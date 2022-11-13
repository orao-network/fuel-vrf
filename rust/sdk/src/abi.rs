use std::fmt;

use fuels::{
    prelude::*,
    signers::fuel_crypto::Signature,
    tx::{Address, Bytes32, Bytes64},
};

pub mod bindings {
    include!(concat!(env!("OUT_DIR"), "/bindings.rs"));
}

impl std::error::Error for bindings::Error {}
impl fmt::Display for bindings::Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let msg = match self {
            crate::ContractError::ContractNotConfigured() => "contract is not configured",
            crate::ContractError::AssetNotConfigured() => "the asset is not configured",
            crate::ContractError::NotAuthorized() => "not authorized",
            crate::ContractError::RemainingAssets() => {
                "withdraw asset fees before changing the asset"
            }
            crate::ContractError::NonZeroFee() => "set fee to 0 when disabing the asset",
            crate::ContractError::ZeroAuthority() => "zero authority is not allowed",
            crate::ContractError::ZeroFee() => "zero fee is not allowed",
            crate::ContractError::NoFeePaid() => "client must pay the fee",
            crate::ContractError::WrongFeePaid() => "client must pay the correct fee",
            crate::ContractError::SeedInUse() => "seed is in use",
            crate::ContractError::NoAmountSpecified() => "you should specify an amount",
            crate::ContractError::NotEnoughFunds() => "not enough funds to withdraw",
            crate::ContractError::UnknownRequest() => "request seed is unknown",
            crate::ContractError::InvalidResponse() => "randomness response is invalid",
            crate::ContractError::Fulfilled() => "request is fulfilled",
        };
        f.write_str(msg)
    }
}

impl fmt::Debug for bindings::Vrf {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Vrf")
            .field("contract_id", self.get_contract_id())
            .finish_non_exhaustive()
    }
}

impl fmt::Debug for bindings::VrfMethods {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("VrfMethods").finish_non_exhaustive()
    }
}

impl From<Signature> for bindings::B512 {
    fn from(x: Signature) -> Self {
        let mut fst = [0_u8; Signature::LEN / 2];
        fst.copy_from_slice(&x[..Signature::LEN / 2]);
        let mut snd = [0_u8; Signature::LEN / 2];
        snd.copy_from_slice(&x[Signature::LEN / 2..]);
        bindings::B512 {
            bytes: [Bits256(fst), Bits256(snd)],
        }
    }
}

impl From<Bytes64> for bindings::B512 {
    fn from(x: Bytes64) -> Self {
        let mut fst = [0_u8; Bytes64::LEN / 2];
        fst.copy_from_slice(&x[..Bytes64::LEN / 2]);
        let mut snd = [0_u8; Bytes64::LEN / 2];
        snd.copy_from_slice(&x[Bytes64::LEN / 2..]);
        bindings::B512 {
            bytes: [Bits256(fst), Bits256(snd)],
        }
    }
}

impl From<bindings::B512> for Bytes64 {
    fn from(x: bindings::B512) -> Self {
        let mut bytes = [0_u8; Bytes64::LEN];
        bytes[..Bytes64::LEN / 2].copy_from_slice(&x.bytes[0].0);
        bytes[Bytes64::LEN / 2..].copy_from_slice(&x.bytes[1].0);
        Self::new(bytes)
    }
}

impl bindings::Event {
    pub fn seed(&self) -> &Bits256 {
        match self {
            crate::Event::Fulfill(bindings::Fulfill { seed, .. }) => seed,
            crate::Event::Response(bindings::Response { seed, .. }) => seed,
            crate::Event::Request(bindings::Request { seed, .. }) => seed,
            crate::Event::Reset(bindings::Reset { seed }) => seed,
        }
    }
}

impl fmt::Display for bindings::Event {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            bindings::Event::Fulfill(x) => write!(f, "Event: {}", x),
            bindings::Event::Request(x) => write!(f, "Event: {}", x),
            bindings::Event::Response(x) => write!(f, "Event: {}", x),
            bindings::Event::Reset(x) => write!(f, "Event: {}", x),
        }
    }
}

impl fmt::Display for bindings::Fulfill {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Fulfill: seed={}, randomness={}",
            Bytes32::from(self.seed.0),
            Bytes64::from(self.randomness.clone())
        )
    }
}

impl fmt::Display for bindings::Request {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Request: no={}, seed={}, client={}",
            self.no,
            Bytes32::new(self.seed.0),
            match self.client {
                Identity::Address(x) => Bech32Address::from(x).to_string(),
                Identity::ContractId(x) => Bech32ContractId::from(x).to_string(),
            },
        )
    }
}

impl fmt::Display for bindings::Response {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Response: seed={}, authority={}, randomness={}",
            Bytes32::from(self.seed.0),
            Bech32Address::from(self.authority),
            Bytes64::from(self.randomness.clone()),
        )
    }
}

impl fmt::Display for bindings::Reset {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Reset: seed={}", Bytes32::new(self.seed.0))
    }
}

impl bindings::FulfillersKeys {
    pub fn iter(&self) -> FulfillersKeysIter<'_> {
        FulfillersKeysIter::new(self)
    }
}

pub struct FulfillersKeysIter<'a> {
    keys: &'a bindings::FulfillersKeys,
    next: u8,
}

impl<'a> FulfillersKeysIter<'a> {
    fn new(keys: &'a bindings::FulfillersKeys) -> Self {
        Self { keys, next: 0 }
    }
}

impl<'a> Iterator for FulfillersKeysIter<'a> {
    type Item = &'a Address;

    fn next(&mut self) -> Option<Self::Item> {
        match self.next {
            0 => {
                if self.keys.key_1 == Address::zeroed() {
                    None
                } else {
                    self.next += 1;
                    Some(&self.keys.key_1)
                }
            }
            1 => {
                if self.keys.key_2 == Address::zeroed() {
                    None
                } else {
                    self.next += 1;
                    Some(&self.keys.key_2)
                }
            }
            2 => {
                if self.keys.key_3 == Address::zeroed() {
                    None
                } else {
                    self.next += 1;
                    Some(&self.keys.key_3)
                }
            }
            3 => {
                if self.keys.key_4 == Address::zeroed() {
                    None
                } else {
                    self.next += 1;
                    Some(&self.keys.key_4)
                }
            }
            4 => {
                if self.keys.key_5 == Address::zeroed() {
                    None
                } else {
                    self.next += 1;
                    Some(&self.keys.key_5)
                }
            }
            5 => {
                if self.keys.key_6 == Address::zeroed() {
                    None
                } else {
                    self.next += 1;
                    Some(&self.keys.key_6)
                }
            }
            6 => {
                if self.keys.key_7 == Address::zeroed() {
                    None
                } else {
                    self.next += 1;
                    Some(&self.keys.key_7)
                }
            }
            _ => None,
        }
    }
}