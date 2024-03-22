use std::io;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Account(#[from] fuels::accounts::AccountError),
    #[error(transparent)]
    Fuels(#[from] fuels::types::errors::Error),
    #[error(transparent)]
    Wallet(#[from] fuels::accounts::wallet::WalletError),
    #[error(transparent)]
    Io(#[from] io::Error),
}
