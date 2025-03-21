use std::fmt::Debug;

pub use abi::{
    bindings::{
        Error as ContractError, Event, Fulfill, Fulfilled, Randomness, RandomnessState, Request,
        Reset, Response, State, Unfulfilled,
    },
    randomness_to_bytes64,
};
pub use error::Error;
use fuels::{
    core::traits::{Parameterize, Tokenizable},
    crypto::Signature,
    prelude::*,
    programs::calls::{CallHandler, ContractCall},
    types::{Bits256, Identity},
};

pub mod abi;
pub mod error;

pub type Result<T> = std::result::Result<T, Error>;

pub const MAX_AUTHORITIES: usize = 10;
pub const MAINNET_CONTRACT_ID: ContractId = ContractId::new([
    0xf0, 0xb0, 0xfc, 0xde, 0xd2, 0xb3, 0xdc, 0xbc, 0x52, 0x9d, 0x61, 0x13, 0x00, 0xb9, 0x04, 0xdf,
    0x97, 0xbf, 0x47, 0x32, 0x40, 0xce, 0x46, 0x79, 0x99, 0x3e, 0x41, 0x8b, 0x36, 0xb3, 0xe8, 0xd0,
]);
pub const TESTNET_CONTRACT_ID: ContractId = ContractId::new([
    0x2a, 0x8d, 0x96, 0x91, 0x1b, 0xec, 0xbe, 0x05, 0xb2, 0xa9, 0xf5, 0x25, 0x3c, 0x91, 0x86, 0x5f,
    0x0f, 0x4b, 0x36, 0x5e, 0xd0, 0xe2, 0xab, 0xab, 0x17, 0xa3, 0x5e, 0x9f, 0xc9, 0xc4, 0xac, 0x76,
]);

#[derive(Debug)]
pub struct Vrf<T: Account> {
    pub abi: abi::bindings::Vrf<T>,
    pub methods: abi::bindings::VrfMethods<T>,
    pub contract_id: ContractId,
    pub target_contract_id: Option<ContractId>,
}

impl<A: Account> Vrf<A> {
    pub async fn new(contract_id: ContractId, wallet: A) -> Self {
        let abi = abi::bindings::Vrf::new(contract_id, wallet);
        let proxy_abi = abi::bindings::Proxy::new(
            contract_id,
            ImpersonatedAccount::new(
                Bech32Address::default(),
                Some(abi.account().try_provider().unwrap().clone()),
            ),
        );
        let target_contract_id = match proxy_abi
            .methods()
            .proxy_target()
            .simulate(Execution::StateReadOnly)
            .await
        {
            Ok(result) => result.value,
            Err(_) => None,
        };

        Self {
            contract_id,
            target_contract_id,
            methods: abi.methods(),
            abi,
        }
    }

    pub fn contract_ids(&self) -> Vec<Bech32ContractId> {
        let mut ids = vec![self.contract_id.into()];
        if let Some(target_id) = self.target_contract_id {
            ids.push(target_id.into());
        }
        ids
    }

    fn with_target_contract<T: Tokenizable + Parameterize + Debug>(
        &self,
        mut call: CallHandler<A, ContractCall, T>,
    ) -> CallHandler<A, ContractCall, T> {
        if let Some(contract_id) = self.target_contract_id {
            call = call.with_contract_ids(&[contract_id.into()]);
        }
        call
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
    /// let consensus_parameters = instance.abi.account().try_provider()?.consensus_parameters().await?;
    /// let network_base_asset = *consensus_parameters.base_asset_id();
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
        self.with_target_contract(self.methods.request(seed))
    }

    /// Returns the configured authority.
    ///
    /// # Note
    ///
    /// `None` means that the contract instance is not yet configured.
    pub async fn get_authority(&self) -> Result<Option<Identity>> {
        match self
            .with_target_contract(self.methods.owner())
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
            .with_target_contract(self.methods.get_fee(asset))
            .simulate(Execution::StateReadOnly)
            .await?
            .value)
    }

    /// Returns the additional asset to pay fee with.
    ///
    /// Note that it returns the base asset if additional asset is not configured.
    pub async fn get_asset(&self) -> Result<AssetId> {
        Ok(AssetId::new(
            self.with_target_contract(self.methods.get_asset())
                .simulate(Execution::StateReadOnly)
                .await?
                .value
                .into(),
        ))
    }

    /// Returns configured fulfillment authorities.
    pub async fn get_fulfillment_authorities(&self) -> Result<Vec<Address>> {
        let response = self
            .with_target_contract(self.methods.get_fulfillment_authorities())
            .simulate(Execution::StateReadOnly)
            .await?;
        Ok(response.value)
    }

    /// Returns collected fees amount for the given asset.
    pub async fn get_balance(&self, asset: AssetId) -> Result<u64> {
        Ok(self
            .with_target_contract(self.methods.get_balance(asset))
            .simulate(Execution::StateReadOnly)
            .await?
            .value)
    }

    /// Returns request by its number.
    pub async fn get_request_by_num(&self, num: u64) -> Result<Option<Randomness>> {
        let response = self
            .with_target_contract(self.methods.get_request_by_num(num))
            .simulate(Execution::StateReadOnly)
            .await?;
        Ok(response.value)
    }

    /// Returns request by its seed.
    pub async fn get_request_by_seed(&self, seed: Bits256) -> Result<Option<Randomness>> {
        let response = self
            .with_target_contract(self.methods.get_request_by_seed(seed))
            .simulate(Execution::StateReadOnly)
            .await?;
        Ok(response.value)
    }

    /// Returns the number of performed requests.
    pub async fn get_num_requests(&self) -> Result<u64> {
        Ok(self
            .with_target_contract(self.methods.get_num_requests())
            .simulate(Execution::StateReadOnly)
            .await?
            .value)
    }

    /// Convenience method that returns on-chain VRF status.
    // TODO: Clean this up as soon as FuelLabs/fuels-rs#914 is fixed
    // TODO: 15.03.2024. this should be refactored using ReceiptParser
    pub async fn get_status(&self) -> Result<Status> {
        let consensus_parameters = self
            .abi
            .account()
            .try_provider()?
            .consensus_parameters()
            .await?;
        let base_asset_id = consensus_parameters.base_asset_id();
        let mut call = CallHandler::new_multi_call(self.abi.account())
            .add_call(self.with_target_contract(self.methods.owner()))
            .add_call(self.with_target_contract(self.methods.get_balance(base_asset_id.clone())))
            .add_call(self.with_target_contract(self.methods.get_fee(base_asset_id.clone())))
            .add_call(self.with_target_contract(self.methods.get_asset()))
            .add_call(self.with_target_contract(self.methods.get_fulfillment_authorities()))
            .add_call(self.with_target_contract(self.methods.get_num_requests()))
            .with_tx_policies(TxPolicies::default().with_script_gas_limit(10_000_000));

        let response = call
            .simulate::<(State, u64, u64, AssetId, Vec<Address>, u64)>(Execution::StateReadOnly)
            .await?;
        let asset = response.value.3;

        let additional_asset = if asset != *base_asset_id {
            let mut call = CallHandler::new_multi_call(self.abi.account())
                .add_call(self.with_target_contract(self.methods.get_balance(asset)))
                .add_call(self.with_target_contract(self.methods.get_fee(asset)));
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
