use std::time::Duration;

use clap::Parser;
use fuels::prelude::*;
use indicatif::ProgressBar;
use tokio::time::timeout;

use crate::abi::bindings::Status;

pub const CONTRACT_ID: ContractId = ContractId::new([
    0x74, 0x9a, 0x7e, 0xef, 0xd3, 0x49, 0x4f, 0x54, 0x9a, 0x24, 0x8c, 0xdc, 0xaa, 0xa1, 0x74, 0xc1,
    0xa1, 0x9f, 0x0c, 0x1d, 0x78, 0x98, 0xfa, 0x77, 0x23, 0xb6, 0xb2, 0xf8, 0xec, 0xc4, 0x82, 0x8d,
]);

mod abi;
mod utils;

/// Fuel VRF on-chain call example.
#[derive(Debug, Parser)]
pub struct Args {
    /// ID of a published RussianRoulette contract.
    #[arg(long, default_value_t = CONTRACT_ID)]
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
    #[arg(long, default_value = "https://testnet.fuel.network/graphql")]
    pub endpoint: String,
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

    let bech32_contract_id = Bech32ContractId::from(args.contract_id);
    eprintln!("Contract address: {}\n", args.contract_id);

    let wallet = WalletUnlocked::new_from_private_key(secret_key, Some(provider));
    eprintln!("Player address: {}", wallet.address());

    let instance = abi::bindings::RussianRoulette::new(bech32_contract_id, wallet);

    let status = instance.status().await?;

    let prev_round = match status {
        Status::PlayerIsDead(x) => {
            eprintln!("Can't play – player died at round {x} 💐🪦.");
            return Ok(());
        }
        Status::SpinningBarrel(_) => {
            eprintln!("Can't play – previous round is still in progress");
            return Ok(());
        }
        Status::PlayerIsAlive(x) => {
            eprintln!("Player is alive after {x} rounds.");
            x
        }
    };

    let progress = ProgressBar::new_spinner();
    progress.enable_steady_tick(std::time::Duration::from_millis(120));
    progress.set_message("Round started..");

    instance.spin_and_pull_the_trigger().await?;

    progress.set_message("Waiting for round to finish..");
    loop {
        let status = instance.status().await?;

        if status.round() <= prev_round {
            // current round is not yet visible
            continue;
        } else if status.round() > (prev_round + 1) {
            panic!("Another round already being started");
        }

        match status {
            Status::PlayerIsAlive(x) => {
                progress.suspend(|| {
                    println!("CLICK!");
                    println!("Player is alive after {x} round(s)");
                });
                break;
            }
            Status::PlayerIsDead(_) => {
                progress.suspend(|| {
                    println!("💥 BANG 💥");
                    println!("Player is dead.");
                });
                break;
            }
            Status::SpinningBarrel(_) => {
                progress.suspend(|| {
                    println!("The barrel is still spinning..");
                });
                continue;
            }
        };
    }

    progress.finish_with_message("Done");

    Ok(())
}
