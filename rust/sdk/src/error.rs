#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Fuels(#[from] fuels::types::errors::Error),
    #[error(transparent)]
    Wallet(#[from] fuels::signers::wallet::WalletError),
}
