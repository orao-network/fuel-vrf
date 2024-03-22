# Russian Roulette Smart Contract
This is a demo game that utilizes ORAO's VRF contract to get on-chain randomness. It is written in Sway and published on Fuel's beta-5 Testnet.

Contract ID is `0xc44327a482115e513e6eec4396a436d158d8aeb90b06d95c1f87089f693125ed` which is also defined as `CONTRACT_ID` in src/main.rs.

## Requirements

* requires forc 0.35.5 to build (see build.rs)
* uses `forc-wallet`-generated wallets

## Implementation

See `src/main.sw`.

## Test binary
```sh
cargo build --release
```
Go to target/release and invoke `russian-roulette --help` (see `src/main.rs`).

