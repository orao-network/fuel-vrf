# Russian Roulette Smart Contract

This is an on-chain Russian Roulette game leveraging ORAO's VRF for verifiable randomness. Written in Sway and deployed on Fuel testnet.

**Contract ID**: `0x41d98fb232f127282dfb0bed91669f66cb9810ef42343373d5a67e540ffc6971`

## Game Mechanics

### Key Features:

1. **Provably Fair**: Uses ORAO VRF (0x2a8d96..c4ac76) for cryptographic randomness
2. **Risk Management**:
    - Max bet limit of 1,000,000 base asset
    - Automatic refunds for over-bets
3. **Transparent Odds**:
    - 1/6 chance of losing (16.67%)
    - 5/6 chance of doubling your bet
4. **Instant Payouts**: Winnings automatically transferred on successful rounds

### How to Play:

1. Call the `spin_and_pull_the_trigger` function with your desired bet amount and a unique force value.
2. The contract will process your bet, spin the virtual cylinder, and pull the trigger.
3. The outcome is determined by the VRF and processed in the `fulfill_randomness` function.
4. If you survive, you receive double your bet. If not, you lose your entire bet.

### Safety Features:

- Maximum bet limit to prevent excessive losses.
- Automatic refund of excess bets above the maximum limit.
- VRF integration ensures fair and unpredictable outcomes.

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
