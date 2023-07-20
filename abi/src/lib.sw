library;

mod randomness;

use std::address::Address;
use std::identity::Identity;
use std::b512::B512;
use std::option::Option;

use randomness::Randomness;

abi Vrf {
    #[storage(read)]
    fn get_asset() -> ContractId;

    #[storage(read)]
    fn get_fee(asset: ContractId) -> u64;

    #[storage(read)]
    fn get_fulfillment_authorities() -> [Option<Address>; 10];

    #[storage(read)]
    fn get_request_by_seed(seed: b256) -> Option<Randomness>;

    #[storage(read)]
    fn get_request_by_num(num: u64) -> Option<Randomness>;

    #[payable]
    #[storage(read, write)]
    fn request(seed: b256) -> u64;
}
