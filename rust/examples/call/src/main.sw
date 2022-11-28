contract;

dep error;

use std::{
    auth::msg_sender,
    b512::B512,
    call_frames::msg_asset_id,
    constants::{
        BASE_ASSET_ID,
        ZERO_B256,
    },
    context::{
        msg_amount,
    },
    identity::Identity,
    logging::log,
    revert::revert,
    storage::StorageMap,
};

use vrf_abi::{randomness::{Fulfilled, Randomness, RandomnessState}, Vrf};

const VRF_ID = 0x11aadad33b006b21390e1452cd6354b6aa71bfd997ce0977936eb60637a96a0e;

abi RussianRoulette {
    fn round_cost() -> u64;
    #[storage(read)]
    fn status() -> Status;
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
        if random.bytes[0] <= 0x2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
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
    force: b256,
    rounds: u64,
}

impl PlayerState {
    fn get_status(self) -> Status {
        let vrf = abi(Vrf, VRF_ID);
        match vrf.get_request_by_seed(self.force) {
            Option::Some(r) => match r.state {
                RandomnessState::Fulfilled(x) => {
                    match RoundOutcome::derive(x.randomness) {
                        RoundOutcome::Bang => {
                            return Status::PlayerIsDead(self.rounds);
                        }
                        _ => (),
                    }
                },
                RandomnessState::Unfulfilled(_) => {
                    return Status::SpinningBarrel(self.rounds);
                }
            },
            _ => (),
        }

        Status::PlayerIsAlive(self.rounds)
    }
}

impl PlayerState {
    /// Reverts with error if user can't play.
    fn assert_can_play(self) {
        match self.get_status() {
            Status::PlayerIsAlive => (),
            Status::PlayerIsDead => {
                log(error::Error::PlayerIsDead);
                revert(0);
            },
            Status::SpinningBarrel => {
                log(error::Error::RoundIsInProgress);
                revert(1);
            },
        }
    }
}

storage {
    player_state: StorageMap<Identity, PlayerState> = StorageMap {},
}

impl RussianRoulette for Contract {
    fn round_cost() -> u64 {
        let vrf = abi(Vrf, VRF_ID);
        vrf.get_fee(BASE_ASSET_ID)
    }

    #[storage(read)]
    fn status() -> Status {
        let sender = msg_sender().unwrap();
        let player = storage.player_state.get(sender);
        player.get_status()
    }

    #[storage(read, write)]
    fn spin_and_pull_the_trigger(force: b256) {
        let sender = msg_sender().unwrap();
        let amount = msg_amount();
        let msg_asset = msg_asset_id();

        if msg_asset != BASE_ASSET_ID {
            log(error::Error::InvalidAsset);
            revert(2);
        }

        let mut player = storage.player_state.get(sender);
        player.assert_can_play();

        let vrf = abi(Vrf, VRF_ID);

        let fee = vrf.get_fee(BASE_ASSET_ID);
        if fee != amount {
            log(error::Error::InvalidAmount);
            revert(2);
        }

        let _ = vrf.request {
            gas: 300000,
            asset_id: BASE_ASSET_ID.value,
            coins: fee,
        }(force);

        player.force = force;
        player.rounds += 1;

        storage.player_state.insert(sender, player);
    }
}
