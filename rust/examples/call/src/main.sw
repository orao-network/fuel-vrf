contract;

mod error;

use std::{
    asset::{
        transfer,
    },
    auth::msg_sender,
    b512::B512,
    call_frames::msg_asset_id,
    constants::{
        ZERO_B256,
    },
    context::{
        balance_of,
        msg_amount,
    },
    identity::Identity,
    logging::log,
    revert::revert,
    storage::*,
};
use std::hash::Hash;

use error::Error;

pub use vrf_abi::{randomness::{Fulfilled, Randomness, RandomnessState, Unfulfilled}, Vrf, Consumer};

const VRF_ID: b256 = 0x2a8d96911becbe05b2a9f5253c91865f0f4b365ed0e2abab17a35e9fc9c4ac76;
const THRESHOLD: b256 = 0x0aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa; // 1/6 of max b256 value
const MAX_BET: u64 = 1_000_000;

abi RussianRoulette {
    fn round_cost() -> u64;
    #[storage(read)]
    fn status(player: Address) -> Status;
    #[storage(read)]
    fn randomness_status(player: Address) -> RandomnessState;
    #[storage(read)]
    fn execute_callback();
    #[payable]
    #[storage(read, write)]
    fn spin_and_pull_the_trigger(force: b256, bet_amount: u64);
}

enum RoundOutcome {
    Bang: (),
    Click: (),
}

impl RoundOutcome {
    fn derive(random: B512) -> Self {
        // roughly 1/6 chance
        if random.bits()[0] <= THRESHOLD
        {
            RoundOutcome::Bang
        } else {
            RoundOutcome::Click
        }
    }
}

enum Status {
    PlayerIsAlive: u64,
    PlayerIsDead: u64,
    SpinningBarrel: u64,
}

pub struct PlayerState {
    force: b256,
    rounds: u64,
    status: Status,
    bet_amount: u64,
}

storage {
    player_state: StorageMap<Identity, PlayerState> = StorageMap {},
    force_to_player: StorageMap<b256, Identity> = StorageMap {},
}

fn only_vrf() {
    let vrf_id = Identity::ContractId(ContractId::from(VRF_ID));
    if msg_sender().unwrap() != vrf_id {
        log(Error::OnlyVrfCanFulfill);
        revert(3);
    }
}

impl Consumer for Contract {
    #[storage(read, write)]
    fn fulfill_randomness(seed: b256, randomness: B512) {
        // Restrict access to only the VRF contract
        only_vrf();

        // Retrieve the player associated with the seed
        let player_id = match storage.force_to_player.get(seed).try_read() {
            Some(id) => id,
            None => {
                log(Error::UnknownSeed);
                return;
            }
        };

        // Retrieve the player's state
        let mut player = match storage.player_state.get(player_id).try_read() {
            Some(p) => p,
            None => {
                log(Error::PlayerNotFound);
                return;
            }
        };

        // Determine the outcome
        let outcome = RoundOutcome::derive(randomness);
        let status = match outcome {
            RoundOutcome::Bang => Status::PlayerIsDead(player.rounds),
            RoundOutcome::Click => {
                // Player survives, return their bet
                let mut payout = player.bet_amount * 2;
                let balance = balance_of(ContractId::this(), AssetId::base());
                if balance < payout {
                    payout = balance;
                }
                transfer(player_id, AssetId::base(), payout);
                Status::PlayerIsAlive(player.rounds)
            },
        };
        player.status = status;
        player.bet_amount = 0; // Reset bet amount

        storage.player_state.insert(player_id, player);
    }
}

impl RussianRoulette for Contract {
    fn round_cost() -> u64 {
        abi(Vrf, VRF_ID).get_fee(AssetId::base())
    }

    #[storage(read)]
    fn status(player: Address) -> Status {
        match storage.player_state.get(Identity::Address(player)).try_read() {
            Some(player_state) => player_state.status,
            None => Status::PlayerIsAlive(0),
        }
    }

    #[storage(read)]
    fn randomness_status(player: Address) -> RandomnessState {
        match storage.player_state.get(Identity::Address(player)).try_read() {
            Some(player_state) => {
                match abi(Vrf, VRF_ID).get_request_by_seed(player_state.force) {
                    Some(randomness) => randomness.state,
                    None => RandomnessState::Unfulfilled(Unfulfilled::new()),
                }
            },
            None => RandomnessState::Unfulfilled(Unfulfilled::new()),
        }
    }

    // Callback can be manually executed after fulfillment of randomness.
    #[storage(read)]
    fn execute_callback() {
        let sender = msg_sender().unwrap();

        // Retrieve the player's state
        let mut player = match storage.player_state.get(sender).try_read() {
            Some(p) => p,
            None => {
                log(Error::PlayerNotFound);
                return;
            }
        };

        let vrf = abi(Vrf, VRF_ID);
        vrf.execute_callback(player.force);
    }

    #[payable]
    #[storage(read, write)]
    fn spin_and_pull_the_trigger(force: b256, bet_amount: u64) {
        let sender = msg_sender().unwrap();
        let mut amount = msg_amount();

        if msg_asset_id() != AssetId::base() {
            log(Error::InvalidAsset);
            revert(2);
        }

        // Make sure that if the player bets higher than max bet that it's ignored and that it only takes the max_bet and the rest is returned
        let bet_amount = if bet_amount > MAX_BET {
            // Return excess funds to the player
            let refund = bet_amount - MAX_BET;
            transfer(sender, AssetId::base(), refund);
            amount = amount - refund;
            MAX_BET
        } else {
            bet_amount
        };

        let mut player = match storage.player_state.get(sender).try_read() {
            Some(player) => player,
            None => PlayerState {
                force,
                rounds: 0,
                status: Status::PlayerIsAlive(0),
                bet_amount: 0,
            },
        };

        player.force = force;
        player.rounds += 1;
        player.status = Status::SpinningBarrel(player.rounds);
        player.bet_amount = bet_amount;

        storage.player_state.insert(sender, player);
        storage.force_to_player.insert(force, sender);

        let vrf = abi(Vrf, VRF_ID);

        let fee = vrf.get_fee(AssetId::base());
        if fee + bet_amount > amount {
            log(Error::InvalidAmount);
            revert(2);
        }

        let _ = vrf.request {
            asset_id: AssetId::base().bits(),
            coins: amount - bet_amount,
        }(force);
    }
}
