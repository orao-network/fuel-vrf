library;

pub mod randomness;

use std::asset::*;
use std::address::Address;
use std::identity::Identity;
use std::b512::B512;
use std::option::Option;

use randomness::Randomness;

abi Vrf {
    #[storage(read)]
    fn get_asset() -> AssetId;

    #[storage(read)]
    fn get_fee(asset: AssetId) -> u64;

    #[storage(read)]
    fn get_fulfillment_authorities() -> Vec<Address>;

    #[storage(read)]
    fn get_request_by_seed(seed: b256) -> Option<Randomness>;

    #[storage(read)]
    fn get_request_by_num(num: u64) -> Option<Randomness>;

    #[payable]
    #[storage(read, write)]
    fn request(seed: b256) -> u64;

    #[storage(read, write)]
    fn execute_callback(seed: b256);
}

abi Consumer {
    #[storage(read, write)]
    fn fulfill_randomness(seed: b256, randomness: B512);
}
