use std::time::Duration;

use clap::Parser;
use fuels::prelude::*;
use indicatif::ProgressBar;
use tokio::time::timeout;

use crate::abi::bindings::Status;

pub const CONTRACT_ID: ContractId = ContractId::new([
    0x78, 0x18, 0x85, 0xa2, 0xb7, 0x3c, 0x32, 0xf6, 0xcb, 0x87, 0x9d, 0x31, 0x19, 0xdd, 0xae, 0x05,
    0x2c, 0x6f, 0x8b, 0xc8, 0x28, 0x59, 0x5c, 0x4b, 0x91, 0x53, 0x1a, 0xfa, 0x7e, 0x64, 0xa7, 0x83,
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

    /// Bet amount.
    #[arg(long, short, default_value_t = 100_000)]
    pub bet_amount: u64,
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

    eprintln!("Contract address: {}\n", args.contract_id);

    let wallet = WalletUnlocked::new_from_private_key(secret_key, Some(provider));
    let address = Address::from(wallet.address());
    eprintln!("Player address: {}", address.clone());

    let instance = abi::bindings::RussianRoulette::new(args.contract_id, wallet);

    let status = instance.status(address).await?;

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
    progress.enable_steady_tick(Duration::from_millis(120));
    progress.set_message("Round started..");

    instance.spin_and_pull_the_trigger(args.bet_amount).await?;

    progress.set_message("Waiting for round to finish..");
    loop {
        let status = instance.status(address.clone()).await?;
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
