library randomness;

use std::address::Address;
use std::b512::B512;
use std::constants::{BASE_ASSET_ID, ZERO_B256};
use std::revert::{require, revert};
use std::option::Option;
use std::logging::log;

/// List of fulfiller's keys (`Address::zeroed()`-terminated).
pub struct FulfillersKeys {
    // TODO: No nested StorageVec nor mutable arrays support.
    key1: Address,
    key2: Address,
    key3: Address,
    key4: Address,
    key5: Address,
    key6: Address,
    key7: Address,
}

impl FulfillersKeys {
    /// Puts another fulfiller's key into the list.
    ///
    /// Returns the updated len.
    fn put(ref mut self, authority: Address) -> Option<u8> {
        if self.key1.value == ZERO_B256 {
            self.key1 = authority;
            Option::Some(1u8)
        } else if self.key1 == authority {
            Option::None
        } else if self.key2.value == ZERO_B256 {
            self.key2 = authority;
            Option::Some(2u8)
        } else if self.key2 == authority {
            Option::None
        } else if self.key3.value == ZERO_B256 {
            self.key3 = authority;
            Option::Some(3u8)
        } else if self.key3 == authority {
            Option::None
        } else if self.key4.value == ZERO_B256 {
            self.key4 = authority;
            Option::Some(4u8)
        } else if self.key4 == authority {
            Option::None
        } else if self.key5.value == ZERO_B256 {
            self.key5 = authority;
            Option::Some(5u8)
        } else if self.key5 == authority {
            Option::None
        } else if self.key6.value == ZERO_B256 {
            self.key6 = authority;
            Option::Some(6u8)
        } else if self.key6 == authority {
            Option::None
        } else if self.key7.value == ZERO_B256 {
            self.key7 = authority;
            Option::Some(7u8)
        } else if self.key7 == authority {
            Option::None
        } else {
            log("Fulfill overflow");
            revert(42);
        }
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

impl Unfulfilled {
    /// Reverts if this authority already responded.
    ///
    /// Returns number of responses.
    fn fulfill(ref mut self, authority: Address, randomness: B512) -> u8 {
        let num_responses = match self.keys.put(authority) {
            Option::Some(n) => n,
            Option::None => {
                log("Already responded");
                revert(42);
            }
        };

        let (l1, l2) = self.randomness.into();
        let (r1, r2) = randomness.into();

        self.randomness = B512 {
            bytes: [l1 ^ r1, l2 ^ r2],
        };

        num_responses
    }

    /// Clears the state making this unfulfilled request appear as new.
    fn reset(ref mut self) {
        self.keys.key1.value = ZERO_B256;
        self.keys.key2.value = ZERO_B256;
        self.keys.key3.value = ZERO_B256;
        self.keys.key4.value = ZERO_B256;
        self.keys.key5.value = ZERO_B256;
        self.keys.key6.value = ZERO_B256;
        self.keys.key7.value = ZERO_B256;
        self.randomness = B512::new();
    }
}
