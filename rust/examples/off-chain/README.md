# Off-chain randomness
This is a sample app that requests randomness off-chain from the ORAO VRF contrat on Fuel's beta-3 testnet.

## Requirements

* uses `forc-wallet`-generated wallets

## Build
```sh
cargo build --release
```

## Test
Go to target/release and invoke
```sh
./off-chain --account-index <account-index> --wallet-password '<wallet-password>'
```
replacing `<account-index>` and `<wallet-password>` with your own

