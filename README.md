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
fuelup toolchain install latest
```
OR

2. Install fuel toolchain
```sh
curl --proto '=https' --tlsv1.2 -sSf https://fuellabs.github.io/fuelup/fuelup-init.sh | sh
```
This will install the Fuel latest toolchain and associated cli tools


3. Build the SDK
   
Current version will build for Fuel's beta-5 testnet.
This command will also build sample apps.

```sh
cargo build --release
```

## Usage
### Sway
Clone this repo and copy the ABI to your contract directory
```
git clone git@github.com:orao-network/fuel-vrf.git
cp -R fuel-vrf/abi my-sway-contract
```

Your `Forc.toml` should reference `vrf_abi` to be able to do on-chain randomness requests from your contract

`vrf_abi = { path = "./abi" }`

In your sway contract you'll need to import vrf_abi and define VRF_ID as a reference to call the appropriate VRF randomness contract

```
use vrf_abi::{randomness::{Fulfilled, Randomness, RandomnessState}, Vrf};
const VRF_ID = 0xba359a2c9c75e51e04c14a9b7849c6fd76ead15ea4e68e623d75d1bed9d0dc4b;
```
afterwards, initialize an instance of vrf and request randomness with your seed:

```
let orao_vrf = abi(Vrf, VRF_ID);
let seed = // unique of b256 | ZERO_B256 per request
let status = orao_vrf.get_request_by_seed(seed);
```
`status` can have two states:
```
RandomnessState::Fulfilled // VRF nodes have generated randomness and the on-chain contract verified signtures. Randomness for your seed is ready.
RandomnessState::Unfulfilled // VRF nodes haven't generated randomness | in progress
```

If the status is fulfilled we can use the generated randomness:
```
match orao_vrf.get_request_by_seed(seed) {
            Option::Some(r) => match r.state {
                RandomnessState::Fulfilled(x) => {
                    //x.randomness
                }
            }
   }
```

### Rust
Your `Cargo.toml` needs to import `orao-fuel-vrf` 

`orao-fuel-vrf = "0.1.6"`

#### Rust Documentation
Rust methods, traits, enums are available on [ORAO Fuel VRF docs.rs](https://docs.rs/orao-fuel-vrf/latest/orao_fuel_vrf/).

Check out our sample apps
We've prepared an on-chain contract call example as a Russian Roulette game and an offchain rust example.
The source codes are available here:
1. [on-chain Russian Roulette game](https://github.com/orao-network/fuel-vrf/tree/master/rust/examples/call)
2. [off-chain VRF request](https://github.com/orao-network/fuel-vrf/tree/master/rust/examples/off-chain)
