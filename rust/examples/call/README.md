# Russian Roulette Smart Contract

This is a demo game that utilizes ORAO's VRF contract to get on-chain randomness. It is written in Sway and published on the testnet.

Contract ID is `0xf8901803c134031f690fa0a8c840081910ca0348d9c336248c8697f16521a991` which is also defined as `CONTRACT_ID` in src/main.rs.

## Requirements

-   requires forc 0.67.0 to build (see build.rs)
-   uses `forc-wallet`-generated wallets

## Implementing VRF Consumer

To use ORAO's VRF in your own contract, you need to implement the `Consumer` trait from the `vrf_abi` package:

1. Import the necessary dependencies:
```rust
use vrf_abi::{randomness::{Fulfilled, Randomness, RandomnessState}, Vrf, Consumer};
```
2. Implement the Consumer trait for your contract:
```rust
impl Consumer for Contract {
    #[storage(read, write)]
    fn fulfill_randomness(seed: b256, randomness: B512) {
        // This function will be called by the VRF contract when randomness is available
        // Your logic to handle the randomness goes here
        
        // Example:
        // 1. Retrieve data associated with the seed
        // 2. Use the randomness to determine an outcome
        // 3. Update your contract's state based on the outcome
    }
}
```
3. Request randomness from the VRF contract:
```sway
// Define the VRF contract ID
const VRF_ID = 0x2a8d96911becbe05b2a9f5253c91865f0f4b365ed0e2abab17a35e9fc9c4ac76;

// In your contract function:
let vrf = abi(Vrf, VRF_ID);

// Get the fee required by the VRF service
let fee = vrf.get_fee(AssetId::base());

// Request randomness with a unique seed and callback gas
let _ = vrf.request {
    asset_id: AssetId::base().bits(),
    coins: fee + callback_fee, // Include enough for the callback
}(seed);
```
4. Store any necessary data to associate the seed with your application state, so you can retrieve it when the callback occurs.
See the full implementation in src/main.sw for a working example.

## Test binary

```sh
cargo build --release
```

Go to target/release and invoke `russian-roulette --help` (see `src/main.rs`).
