library;

use std::address::Address;
use std::b512::B512;
use std::constants::ZERO_B256;
use std::error_signals::FAILED_REQUIRE_SIGNAL;
use std::revert::{require, revert};
use std::option::Option;
use std::logging::log;
use std::convert::{From, Into};

/// Must be a quorum requirement for `MAX_AUTHORITIES`.
pub const MAX_FULFILLERS: u64 = 7;

/// List of fulfiller's keys (`Address::zeroed()`-terminated).
pub struct FulfillersKeys {
    pub keys: [Address; 7],
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

    /// Puts another fulfiller's key into the list and returns the updated len.
    ///
    /// Returns None if this authority is present or if `MAX_FULFILLERS` reached.
    pub fn put(ref mut self, authority: Address) -> Option<u64> {
        let mut keys = self.keys;
        let mut i: u64 = 0;
        while i < MAX_FULFILLERS {
            if keys[i].bits() == ZERO_B256 {
                keys[i] = authority;
                self.keys = keys;
                return Some(i + 1_u64);
            } else if keys[i] == authority {
                return None;
            }
            i += 1_u64;
        }

        None
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
    pub randomness: B512,
    /// List of fulfillers (`Address::zeroed()`-terminated)..
    pub keys: FulfillersKeys,
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
    pub randomness: B512,
    /// List of fulfillers (`Address::zeroed()`-terminated)..
    pub keys: FulfillersKeys,
}

/// Randomness request data.
pub struct Randomness {
    pub sender: Identity,
    pub seed: b256,
    pub callback_fee: u64,
    pub state: RandomnessState,
}

impl Randomness {
    /// Creates new unfulfilled randomness for the given seed.
    pub fn new(sender: Identity, seed: b256, callback_fee: u64) -> Randomness {
        Randomness {
            sender,
            seed,
            callback_fee,
            state: RandomnessState::Unfulfilled(Unfulfilled::new()),
        }
    }
}

impl Unfulfilled {
    /// Adds another response to this unfulfilled randomness.
    ///
    /// Returns new number of responses. Returns `None` if authority is already present.
    pub fn fulfill(ref mut self, authority: Address, randomness: B512) -> Option<u64> {
        let num_responses = match self.keys.put(authority) {
            Option::Some(n) => n,
            Option::None => return Option::None,
        };

        let left_bits = self.randomness.bits();
        let right_bits = randomness.bits();

        self.randomness = (left_bits[0] ^ right_bits[0], left_bits[1] ^ right_bits[1]).into();

        Option::Some(num_responses)
    }

    /// Clears the state making this unfulfilled request appear as new.
    pub fn reset(ref mut self) {
        self.keys = FulfillersKeys::new();
        self.randomness = B512::new();
    }
}
