use fuels::{
    contract::contract::ContractCallHandler, core::Parameterize, prelude::*,
    signers::fuel_crypto::Signature, tx::Receipt,
};

pub use abi::{
    bindings::{
        Error as ContractError, Event, Fulfill, Fulfilled, Randomness, RandomnessState, Request,
        Reset, Response, Unfulfilled,
    },
    randomness_to_bytes64,
};
pub use error::Error;

pub mod abi;
pub mod error;

pub type Result<T> = std::result::Result<T, Error>;

pub const MAX_AUTHORITIES: usize = 10;
pub const CONTRACT_ID: ContractId = ContractId::new([
    0x11, 0xaa, 0xda, 0xd3, 0x3b, 0x00, 0x6b, 0x21, 0x39, 0x0e, 0x14, 0x52, 0xcd, 0x63, 0x54, 0xb6,
    0xaa, 0x71, 0xbf, 0xd9, 0x97, 0xce, 0x09, 0x77, 0x93, 0x6e, 0xb6, 0x06, 0x37, 0xa9, 0x6a, 0x0e,
]);

#[derive(Debug)]
pub struct Vrf {
    pub abi: abi::bindings::Vrf,
    pub methods: abi::bindings::VrfMethods,
}

impl Vrf {
    pub fn new(contract_id: Bech32ContractId, wallet: WalletUnlocked) -> Self {
        let abi = abi::bindings::Vrf::new(contract_id, wallet);
        Self {
            methods: abi.methods(),
            abi,
        }
    }

    /// Performs the randomness request.
    ///
    /// Client is able to pay fees with the base asset or with an additional asset,
    /// if it is configured and enabled. Transfer amount must be equal to the fee,
    /// configured for the asset being used.
    ///
    /// ```no_run
    /// # use fuels::prelude::*;
    /// # tokio_test::block_on(async {
    /// # let instance: orao_fuel_vrf::Vrf = panic!();
    ///
    /// // Let's try to pay with additional asset with fallback to the base asset
    /// let asset = instance.get_asset().await?;
    /// let fee = instance.get_fee(asset).await?;
    ///
    /// let (asset, fee) = if asset == AssetId::BASE {
    ///     eprintln!("Additional asset is not configured. Paying with base asset");
    ///     (asset, fee)
    /// } else {
    ///     if fee == 0 {
    ///         eprintln!("Additional asset is disabled. Paying with base asset");
    ///         // We need to load the base asset fee
    ///         let fee = instance.get_fee(AssetId::BASE).await?;
    ///         (AssetId::BASE, fee)
    ///     } else {
    ///         eprintln!("Paying with additional asset");
    ///         (asset, fee)
    ///     }
    /// };
    ///
    /// instance.request(Bits256([1_u8; 32]))
    ///     .call_params(CallParameters::new(Some(fee), Some(asset), None))
    ///     .call()
    ///     .await?;
    /// # orao_fuel_vrf::Result::Ok(()) });
    /// ```
    pub fn request(&self, seed: Bits256) -> ContractCallHandler<u64> {
        self.methods.request(seed)
    }

    /// Returns the configured fee for the given asset.
    ///
    /// Use [`AssetId::BASE`] to get base asset fee.
    pub async fn get_fee(&self, asset: AssetId) -> Result<u64> {
        Ok(self
            .methods
            .get_fee(ContractId::new(*asset))
            .simulate()
            .await?
            .value)
    }

    /// Returns the additional asset to pay fee with.
    ///
    /// Not that it returns the base asset if additional asset is not configured.
    pub async fn get_asset(&self) -> Result<AssetId> {
        Ok(AssetId::new(
            *self.methods.get_asset().simulate().await?.value,
        ))
    }

    /// Returns configured fulfillment authorities.
    pub async fn get_fulfillment_authorities(&self) -> Result<Vec<Address>> {
        let fulfillment_authorities = self
            .methods
            .get_fulfillment_authorities()
            .simulate()
            .await?;
        Ok(fulfillment_authorities
            .value
            .into_iter()
            .flatten()
            .collect())
    }

    /// Returns request by its number.
    pub async fn get_request_by_num(&self, num: u64) -> Result<Option<Randomness>> {
        let request = self.methods.get_request_by_num(num).simulate().await?;
        Ok(request.value)
    }

    /// Returns request by its seed.
    pub async fn get_request_by_seed(&self, seed: Bits256) -> Result<Option<Randomness>> {
        let request = self.methods.get_request_by_seed(seed).simulate().await?;
        Ok(request.value)
    }

    /// Returns the number of performed requests.
    pub async fn get_num_requests(&self) -> Result<u64> {
        Ok(self.methods.get_num_requests().simulate().await?.value)
    }

    /// Extracts logs of the given type from the set of receipts.
    pub fn logs_with_type<D: Tokenizable + Parameterize>(
        &self,
        receipts: &[Receipt],
    ) -> Result<Vec<D>> {
        Ok(self.abi.logs_with_type(receipts)?)
    }
}

pub fn signature_to_parts(s: Signature) -> (Bits256, Bits256) {
    let mut fst = [0_u8; Signature::LEN / 2];
    fst.copy_from_slice(&s[..Signature::LEN / 2]);
    let mut snd = [0_u8; Signature::LEN / 2];
    snd.copy_from_slice(&s[Signature::LEN / 2..]);
    (Bits256(fst), Bits256(snd))
}
