library;

use std::address::Address;
use std::b512::B512;
use std::constants::{BASE_ASSET_ID, ZERO_B256};
use std::error_signals::FAILED_REQUIRE_SIGNAL;
use std::revert::{require, revert};
use std::option::Option;
use std::logging::log;

/// Must be a quorum requirement for `MAX_AUTHORITIES`.
pub const MAX_FULFILLERS: u8 = 7;

/// List of fulfiller's keys (`Address::zeroed()`-terminated).
pub struct FulfillersKeys {
    keys: [Address; 7] /* TODO: can't specify a constant here */ ,
}

impl FulfillersKeys {
    /// Creates new instance with all keys zeroed.
    pub fn new() -> FulfillersKeys {
        FulfillersKeys {
            keys: [
                Address::from(ZERO_B256),
                Address::from(ZERO_B256),
                Address::from(ZERO_B256),
                Address::from(ZERO_B256),
                Address::from(ZERO_B256),
                Address::from(ZERO_B256),
                Address::from(ZERO_B256),
            ],
        }
    }

    /// Puts another fulfiller's key into the list.
    ///
    /// Returns the updated len. Returns None if this authority is present.
    pub fn put(ref mut self, authority: Address) -> Option<u8> {
        let mut keys = self.keys;
        let mut i: u8 = 0;
        while i < MAX_FULFILLERS {
            if keys[i].value == ZERO_B256 {
                keys[i] = authority;
                self.keys = keys;
                return Option::Some(i + 1_u8);
            } else if keys[i] == authority {
                return Option::None;
            }
            i += 1_u8;
        }

        // Must not reach this, because the quorum is ether achieved
        // or `MAX_FULFILLERS` and `MAX_AUTHORITIES` does not match
        log("Fulfill overflow");
        revert(FAILED_REQUIRE_SIGNAL);
        Option::None
    }
}

/// Randomness request state.
pub enum RandomnessState {
    Unfulfilled: Unfulfilled,
    Fulfilled: Fulfilled,
}

/// Unfulfilled randomness.
pub struct Unfulfilled {
    /// Random bytes provided so far.
    randomness: B512,
    /// List of fulfillers (`Address::zeroed()`-terminated)..
    keys: FulfillersKeys,
}

impl Unfulfilled {
    /// Creates new unfulfilled randomness state.
    pub fn new() -> Unfulfilled {
        Unfulfilled {
            randomness: B512::new(),
            keys: FulfillersKeys::new(),
        }
    }
}

/// Fulfilled randomness.
pub struct Fulfilled {
    /// Resulting randomness.
    randomness: B512,
    /// List of fulfillers (`Address::zeroed()`-terminated)..
    keys: FulfillersKeys,
}

/// Randomness request data.
pub struct Randomness {
    seed: b256,
    state: RandomnessState,
}

impl Randomness {
    /// Creates new unfulfilled randomness for the given seed.
    pub fn new(seed: b256) -> Randomness {
        Randomness {
            seed,
            state: RandomnessState::Unfulfilled(Unfulfilled::new()),
        }
    }
}

impl Unfulfilled {
    /// Adds another response to this unfulfilled randomness.
    ///
    /// Returns new number of responses. Returns `None` if authority is already present.
    pub fn fulfill(ref mut self, authority: Address, randomness: B512) -> Option<u8> {
        let num_responses = match self.keys.put(authority) {
            Option::Some(n) => n,
            Option::None => return Option::None,
        };

        let (l1, l2) = self.randomness.into();
        let (r1, r2) = randomness.into();

        self.randomness = B512 {
            bytes: [l1 ^ r1, l2 ^ r2],
        };

        Option::Some(num_responses)
    }

    /// Clears the state making this unfulfilled request appear as new.
    pub fn reset(ref mut self) {
        self.keys = FulfillersKeys::new();
        self.randomness = B512::new();
    }
}
