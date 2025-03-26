use std::time::{Duration, Instant};

use clap::Parser;
use fuels::prelude::*;
use indicatif::ProgressBar;
use tokio::time::{sleep, timeout};

use crate::abi::bindings::{RandomnessState, Status};

pub const CONTRACT_ID: ContractId = ContractId::new([
    0x41, 0xd9, 0x8f, 0xb2, 0x32, 0xf1, 0x27, 0x28, 0x2d, 0xfb, 0x0b, 0xed, 0x91, 0x66, 0x9f, 0x66,
    0xcb, 0x98, 0x10, 0xef, 0x42, 0x34, 0x33, 0x73, 0xd5, 0xa6, 0x7e, 0x54, 0x0f, 0xfc, 0x69, 0x71,
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
            instance.execute_callback().await?;
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

    // Timing variables
    let start_time = Instant::now();
    let timeout_duration = Duration::from_secs(10); // 10-second timeout
    let check_interval = Duration::from_millis(100); // Check every 100 millis
    let mut manual_trigger_attempted = false;

    progress.set_message("Waiting for round to finish..");

    loop {
        let status = instance.status(address.clone()).await?;
        if status.round() > prev_round {
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
                    if start_time.elapsed() >= timeout_duration && !manual_trigger_attempted {
                        progress.suspend(|| {
                            println!("Timeout reached, checking VRF fulfillment...");
                        });

                        // Check VRF randomness state
                        let randomness_state = instance.randomness_status(address.clone()).await?;
                        if matches!(randomness_state, RandomnessState::Fulfilled(_)) {
                            progress.suspend(|| {
                                println!("Randomness fulfilled, manually triggering callback...");
                            });
                            instance.execute_callback().await?;
                            manual_trigger_attempted = true;
                        } else {
                            progress.suspend(|| {
                                println!("Randomness not yet fulfilled, waiting longer...");
                            });
                        }
                    } else {
                        progress.suspend(|| {
                            println!("The barrel is still spinning..");
                        });
                    }
                }
            }
        }
        sleep(check_interval).await;
    }

    progress.finish_with_message("Done");

    Ok(())
}
