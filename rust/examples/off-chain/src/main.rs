use std::time::Duration;

use clap::Parser;
use fuel_crypto::fuel_types::{Bytes32};
use fuels::prelude::*;
use indicatif::ProgressBar;
use orao_fuel_vrf::{Event, Fulfilled, RandomnessState, Vrf, randomness_to_bytes64};
use tokio::time::timeout;

mod utils;

/// Fuel VRF off-chain example.
#[derive(Debug, Parser)]
pub struct Args {
    /// Id of a published VRF contract.
    #[arg(long, default_value_t = orao_fuel_vrf::CONTRACT_ID)]
    pub contract_id: ContractId,

    /// Encrypted keystore path.
    #[arg(long, default_value = "~/.fuel/wallets/.wallet")]
    pub wallet: String,

    /// Wallet password (program will ask for it interactively if missing).
    #[arg(long, env = "FUEL_WALLET_PASSWORD", hide_env_values = true)]
    pub wallet_password: Option<String>,

    /// Wallet account index.
    #[arg(long, default_value_t = 0_usize)]
    pub account_index: usize,

    /// Fuel node endpoint to connect to.
    #[arg(long, default_value = "http://node-beta-2.fuel.network/graphql")]
    pub endpoint: String,

    /// Request seed.
    ///
    /// Will generate random seed, if not given.
    #[arg(long)]
    pub seed: Option<Address>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let args = Args::parse();

    let wallet_password = match args.wallet_password {
        Some(wallet_password) => wallet_password,
        None => rpassword::prompt_password("Wallet password: ")?,
    };

    let wallet_path = std::fs::canonicalize(shellexpand::tilde(&args.wallet).as_ref())
        .expect("Valid wallet path");

    let secret_key =
        utils::derive_account_with_index(&wallet_password, &wallet_path, args.account_index)
            .expect("Valid account");

    eprintln!("Using node address: {}", args.endpoint);
    let provider = Provider::connect(args.endpoint);
    let Ok(provider) = timeout(Duration::from_secs(15), provider).await else {
        anyhow::bail!("Unable to connect within 15 seconds timeout")
    };
    let provider = provider?;

    let wallet = WalletUnlocked::new_from_private_key(secret_key, Some(provider));
    eprintln!("Using wallet address: {}", wallet.address());

    let bech32_contract_id = Bech32ContractId::from(args.contract_id);
    eprintln!("Using contract address: {}\n", args.contract_id);

    let instance = Vrf::new(bech32_contract_id, wallet);

    let seed = args.seed.unwrap_or_else(|| rand::random());
    let fee = instance.get_fee(AssetId::BASE).await?;
    let progress = ProgressBar::new_spinner();
    progress.enable_steady_tick(std::time::Duration::from_millis(120));
    progress.set_message("Requesting randomness..");
    let response = instance
        .request(Bits256(*seed))
        .tx_params(TxParameters::new(Some(1), None, None))
        .call_params(CallParameters::new(Some(fee), None, None))
        .call()
        .await?;
    progress.suspend(|| {
        let events = instance
            .logs_with_type::<Event>(&response.receipts)
            .expect("being able to parse logs");
        for event in events {
            println!("{event}");
        }
    });

    progress.set_message("Waiting for randomness to be fulfilled..");
    loop {
        let Some(x) = instance.get_request_by_num(response.value).await? else {
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            continue;
        };

        let RandomnessState::Fulfilled(Fulfilled { randomness, keys }) = x.state else {
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            continue;
        };

        progress.suspend(|| {
            println!("Seed: {}", Bytes32::new(x.seed.0));
            println!("Randomness: {}", randomness_to_bytes64(randomness));
            println!("Fulfilled by: [");
            for key in keys.iter() {
                println!("    {}", Bech32Address::from(*key).to_string());
            }
            println!("]");
        });
        break;
    }

    progress.finish_with_message("Done");

    Ok(())
}
