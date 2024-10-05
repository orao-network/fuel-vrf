# Russian Roulette Smart Contract

This is a demo game that utilizes ORAO's VRF contract to get on-chain randomness. It is written in Sway and published on the testnet.

Contract ID is `0x749a7eefd3494f549a248cdcaaa174c1a19f0c1d7898fa7723b6b2f8ecc4828d` which is also defined as `CONTRACT_ID` in src/main.rs.

## Requirements

-   requires forc 0.35.5 to build (see build.rs)
-   uses `forc-wallet`-generated wallets

## Implementation

See `src/main.sw`.

## Test binary

```sh
cargo build --release
```

Go to target/release and invoke `russian-roulette --help` (see `src/main.rs`).
