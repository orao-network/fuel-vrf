<h1 align="center">
  ORAO FUEL VRF
</h1>

<p>
  Generate on-chain randomness on Fuel. ORAO's Verifiable Random Function for Fuel offers unbiased, fast and affordable randomness for your Fuel programs. Create unique NFT characteristics, generate random levels in games and weapon characteristics, provide unique loot boxes, enable provably fair reward distribution, randomize airdrops and provide secure, verifiable lottery/raffle.
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@orao-network/fuel-vrf"><img src="https://img.shields.io/npm/v/%40orao-network%2Ffuel-vrf?logo=fueler&logoColor=white&color=blue" /></a> 
  <a href="https://crates.io/crates/orao-fuel-vrf"><img src="https://img.shields.io/crates/v/orao-fuel-vrf?logo=codeium&color=%2308B1AB" /></a>
</p>

## Building

Make sure to have a working rust development environment.

1. Update Rust. Your rust version needs to be no older than v1.65

```sh
rustup update
```

2. Update fuel toolchain

```sh
fuelup self update
fuelup toolchain install testnet
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
