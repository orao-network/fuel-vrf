use std::io;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Fuels(#[from] fuels::types::errors::Error),
    #[error(transparent)]
    Wallet(#[from] fuels::signers::wallet::WalletError),
    #[error(transparent)]
    Io(#[from] io::Error),
}
