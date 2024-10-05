use std::fmt::Debug;

pub use abi::{
    bindings::{
        Error as ContractError, Event, Fulfill, Fulfilled, Randomness, RandomnessState, Request,
        Reset, Response, State, Unfulfilled,
    },
    randomness_to_bytes64,
};
use fuels::crypto::Signature;
use fuels::{
    prelude::{Account, Address, AssetId, Bech32ContractId, ContractId, TxPolicies},
    programs::calls::{CallHandler, ContractCall},
    types::{Bits256, Identity},
};
use fuels::prelude::Execution;
pub use error::Error;

pub mod abi;
pub mod error;

pub type Result<T> = std::result::Result<T, Error>;

pub const MAX_AUTHORITIES: usize = 10;
pub const CONTRACT_ID: ContractId = ContractId::new([
    0x74, 0x9a, 0x7e, 0xef, 0xd3, 0x49, 0x4f, 0x54, 0x9a, 0x24, 0x8c, 0xdc, 0xaa, 0xa1, 0x74, 0xc1,
    0xa1, 0x9f, 0x0c, 0x1d, 0x78, 0x98, 0xfa, 0x77, 0x23, 0xb6, 0xb2, 0xf8, 0xec, 0xc4, 0x82, 0x8d,
]);

#[derive(Debug)]
pub struct Vrf<T: Account> {
    pub abi: abi::bindings::Vrf<T>,
    pub methods: abi::bindings::VrfMethods<T>,
    base_asset: AssetId,
}

impl<A: Account> Vrf<A> {
    pub fn new(contract_id: Bech32ContractId, wallet: A) -> Self {
        let abi = abi::bindings::Vrf::new(contract_id, wallet);
        Self {
            base_asset: *abi.account().try_provider().unwrap().base_asset_id(),
            methods: abi.methods(),
            abi,
        }
    }

    /// Returns the base asset of the network.
    ///
    /// It is a part of the network's consensus config.
    pub fn get_network_base_asset(&self) -> AssetId {
        self.base_asset
    }

    /// Performs the randomness request.
    ///
    /// Client is able to pay fees with the base asset or with an additional asset,
    /// if it is configured and enabled. Transfer amount must be equal to the fee,
    /// configured for the asset being used.
    ///
    /// ```no_run
    /// # use fuels::prelude::*;
    /// # use fuels::types::Bits256;
    /// # tokio_test::block_on(async {
    /// # let instance: orao_fuel_vrf::Vrf<WalletUnlocked> = panic!();
    ///
    /// // Let's try to pay with additional asset with fallback to the base asset
    /// let network_base_asset = instance.get_network_base_asset();
    /// let asset = instance.get_asset().await?;
    /// let fee = instance.get_fee(asset).await?;
    ///
    /// let (asset, fee) = if asset == network_base_asset {
    ///     eprintln!("Additional asset is not configured. Paying with base asset");
    ///     (asset, fee)
    /// } else {
    ///     if fee == 0 {
    ///         eprintln!("Additional asset is disabled. Paying with base asset");
    ///         // We need to load the base asset fee
    ///         let fee = instance.get_fee(network_base_asset).await?;
    ///         (network_base_asset, fee)
    ///     } else {
    ///         eprintln!("Paying with additional asset");
    ///         (asset, fee)
    ///     }
    /// };
    ///
    /// instance.request(Bits256([1_u8; 32]))
    ///     .call_params(CallParameters::default().with_amount(fee).with_asset_id(asset))?
    ///     .call()
    ///     .await?;
    /// # orao_fuel_vrf::Result::Ok(()) });
    /// ```
    pub fn request(&self, seed: Bits256) -> CallHandler<A, ContractCall, u64> {
        self.methods.request(seed)
    }

    /// Returns the configured authority.
    ///
    /// # Note
    ///
    /// `None` means that the contract instance is not yet configured.
    pub async fn get_authority(&self) -> Result<Option<Identity>> {
        match self
            .methods
            .owner()
            .simulate(Execution::StateReadOnly)
            .await?
            .value
        {
            State::Initialized(authority) => Ok(Some(authority)),
            _ => Ok(None),
        }
    }

    /// Returns the configured fee for the given asset.
    ///
    /// Use [`AssetId::BASE`] to get base asset fee.
    pub async fn get_fee(&self, asset: AssetId) -> Result<u64> {
        Ok(self
            .methods
            .get_fee(asset)
            .simulate(Execution::StateReadOnly)
            .await?
            .value)
    }

    /// Returns the additional asset to pay fee with.
    ///
    /// Note that it returns the base asset if additional asset is not configured.
    pub async fn get_asset(&self) -> Result<AssetId> {
        Ok(AssetId::new(
            self.methods
                .get_asset()
                .simulate(Execution::StateReadOnly)
                .await?
                .value
                .into(),
        ))
    }

    /// Returns configured fulfillment authorities.
    pub async fn get_fulfillment_authorities(&self) -> Result<Vec<Address>> {
        let response = self
            .methods
            .get_fulfillment_authorities()
            .simulate(Execution::StateReadOnly)
            .await?;
        Ok(response.value)
    }

    /// Returns collected fees amount for the given asset.
    pub async fn get_balance(&self, asset: AssetId) -> Result<u64> {
        Ok(self
            .methods
            .get_balance(asset)
            .simulate(Execution::StateReadOnly)
            .await?
            .value)
    }

    /// Returns request by its number.
    pub async fn get_request_by_num(&self, num: u64) -> Result<Option<Randomness>> {
        let response = self
            .methods
            .get_request_by_num(num)
            .simulate(Execution::StateReadOnly)
            .await?;
        Ok(response.value)
    }

    /// Returns request by its seed.
    pub async fn get_request_by_seed(&self, seed: Bits256) -> Result<Option<Randomness>> {
        let response = self
            .methods
            .get_request_by_seed(seed)
            .simulate(Execution::StateReadOnly)
            .await?;
        Ok(response.value)
    }

    /// Returns the number of performed requests.
    pub async fn get_num_requests(&self) -> Result<u64> {
        Ok(self
            .methods
            .get_num_requests()
            .simulate(Execution::StateReadOnly)
            .await?
            .value)
    }

    /// Convenience method that returns on-chain VRF status.
    // TODO: Clean this up as soon as FuelLabs/fuels-rs#914 is fixed
    // TODO: 15.03.2024. this should be refactored using ReceiptParser
    pub async fn get_status(&self) -> Result<Status> {
        let mut call = CallHandler::new_multi_call(self.abi.account())
            .add_call(self.methods.owner())
            .add_call(self.methods.get_balance(self.base_asset))
            .add_call(self.methods.get_fee(self.base_asset))
            .add_call(self.methods.get_asset())
            .add_call(self.methods.get_fulfillment_authorities())
            .add_call(self.methods.get_num_requests())
            .with_tx_policies(TxPolicies::default().with_script_gas_limit(10_000_000));

        let response = call
            .simulate::<(State, u64, u64, AssetId, Vec<Address>, u64)>(Execution::StateReadOnly)
            .await?;
        let asset = response.value.3;

        let additional_asset = if asset != self.base_asset {
            let mut call = CallHandler::new_multi_call(self.abi.account())
                .add_call(self.methods.get_balance(asset))
                .add_call(self.methods.get_fee(asset));
            let response = call
                .simulate::<(u64, u64)>(Execution::StateReadOnly)
                .await?;
            Some((
                asset,
                AssetStatus {
                    fee: response.value.1,
                    balance: response.value.0,
                },
            ))
        } else {
            None
        };

        Ok(Status {
            authority: if let State::Initialized(authority) = response.value.0 {
                Some(authority)
            } else {
                None
            },
            num_requests: response.value.5,
            base_asset: AssetStatus {
                fee: response.value.2,
                balance: response.value.1,
            },
            fulfillment_authorities: response.value.4,
            additional_asset,
        })
    }
}

/// Structure that represents on-chain VRF state.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Status {
    pub authority: Option<Identity>,
    pub num_requests: u64,
    pub base_asset: AssetStatus,
    pub fulfillment_authorities: Vec<Address>,
    pub additional_asset: Option<(AssetId, AssetStatus)>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct AssetStatus {
    pub fee: u64,
    pub balance: u64,
}

pub fn signature_to_parts(s: Signature) -> (Bits256, Bits256) {
    let mut fst = [0_u8; Signature::LEN / 2];
    fst.copy_from_slice(&s[..Signature::LEN / 2]);
    let mut snd = [0_u8; Signature::LEN / 2];
    snd.copy_from_slice(&s[Signature::LEN / 2..]);
    (Bits256(fst), Bits256(snd))
}
