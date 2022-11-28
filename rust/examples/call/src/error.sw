library error;

pub enum Error {
    PlayerIsDead: (),
    RoundIsInProgress: (),
    /// Only base asset is supported.
    InvalidAsset: (),
    /// Coins transferred should match VRF fee.
    InvalidAmount: (),
}