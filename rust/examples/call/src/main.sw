contract;

mod error;

use std::{
    auth::msg_sender,
    b512::B512,
    call_frames::msg_asset_id,
    constants::{
        ZERO_B256,
    },
    context::{
        msg_amount,
    },
    identity::Identity,
    logging::log,
    revert::revert,
    storage::*,
};
use std::hash::Hash;

use error::Error;

use vrf_abi::{randomness::{Fulfilled, Randomness, RandomnessState}, Vrf, Consumer};

const VRF_ID = 0x2a8d96911becbe05b2a9f5253c91865f0f4b365ed0e2abab17a35e9fc9c4ac76;

abi RussianRoulette {
    fn round_cost() -> u64;
    #[storage(read)]
    fn status(player: Address) -> Status;
    #[payable]
    #[storage(read, write)]
    fn spin_and_pull_the_trigger(force: b256);
}

enum RoundOutcome {
    Bang: (),
    Click: (),
}

impl RoundOutcome {
    fn derive(random: B512) -> Self {
        // roughly 1/6 chance
        if random.bits()[0] <= 0x2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
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
    player: Identity,
    rounds: u64,
    status: Status,
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
            _ => {
                // transfer(player_id, AssetId::base(), AMOUNT);
                Status::PlayerIsAlive(player.rounds)
            },
        };
        player.status = status;

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

    #[payable]
    #[storage(read, write)]
    fn spin_and_pull_the_trigger(force: b256) {
        let sender = msg_sender().unwrap();
        let amount = msg_amount();

        if msg_asset_id() != AssetId::base() {
            log(Error::InvalidAsset);
            revert(2);
        }

        let mut player = match storage.player_state.get(sender).try_read() {
            Some(player) => player,
            None => PlayerState {
                player: sender,
                rounds: 0,
                status: Status::PlayerIsAlive(0),
            },
        };

        player.rounds += 1;
        player.status = Status::SpinningBarrel(player.rounds);

        storage.player_state.insert(sender, player);
        storage.force_to_player.insert(force, sender);

        let vrf = abi(Vrf, VRF_ID);

        let fee = vrf.get_fee(AssetId::base());
        if fee > amount {
            log(Error::InvalidAmount);
            revert(2);
        }

        let _ = vrf.request {
            asset_id: AssetId::base().bits(),
            coins: amount,
        }(force);
    }
}
