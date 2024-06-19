# ORAO VRF SDK for Fuel blockchain

## Building

Make sure to have a working rust development environment.

1. Update Rust. Your rust version needs to be no older than v1.65

```sh
rustup update
```

2. Update fuel toolchain

```sh
fuelup self update
fuelup toolchain install latest
```

OR

2. Install fuel toolchain

```sh
curl --proto '=https' --tlsv1.2 -sSf https://fuellabs.github.io/fuelup/fuelup-init.sh | sh
```

This will install the Fuel latest toolchain, forc-wallet, explorer cli tool and indexer.

3. Build the SDK
   Current version will build for the testnet.
   This command will also build sample apps

```sh
cargo build --release
```

4. Check out our sample apps

[on-chain Russian Roulette game](https://github.com/orao-network/fuel-vrf/tree/master/rust/examples/call) and
[off-chain VRF request](https://github.com/orao-network/fuel-vrf/tree/master/rust/examples/off-chain)
