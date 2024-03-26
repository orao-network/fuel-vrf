use std::{convert::identity, fmt::Debug, time::Duration};

pub use abi::{
    bindings::{
        Error as ContractError, Event, Fulfill, Fulfilled, Randomness, RandomnessState, Request,
        Reset, Response, Unfulfilled,
    },
    randomness_to_bytes64,
};
use fuels::{
    core::traits::{Parameterize, Tokenizable},
    prelude::*,
    programs::{call_response::FuelCallResponse, contract::ContractCallHandler},
    tx::{Receipt, ScriptExecutionResult},
    types::{Bits256, Identity},
};

use fuels::crypto::Signature;

pub use error::Error;

pub mod abi;
pub mod error;

pub type Result<T> = std::result::Result<T, Error>;

pub const MAX_AUTHORITIES: usize = 10;
pub const CONTRACT_ID: ContractId = ContractId::new([
    0xba, 0x35, 0x9a, 0x2c, 0x9c, 0x75, 0xe5, 0x1e, 0x04, 0xc1, 0x4a, 0x9b, 0x78, 0x49, 0xc6, 0xfd,
    0x76, 0xea, 0xd1, 0x5e, 0xa4, 0xe6, 0x8e, 0x62, 0x3d, 0x75, 0xd1, 0xbe, 0xd9, 0xd0, 0xdc, 0x4b,
]);

#[derive(Debug)]
pub struct Vrf<T: Account> {
    pub abi: abi::bindings::Vrf<T>,
    pub methods: abi::bindings::VrfMethods<T>,
}

impl<A: Account> Vrf<A> {
    pub fn new(contract_id: Bech32ContractId, wallet: A) -> Self {
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
    /// # use fuels::types::Bits256;
    /// # tokio_test::block_on(async {
    /// # let instance: orao_fuel_vrf::Vrf<WalletUnlocked> = panic!();
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
    ///     .call_params(CallParameters::default().with_amount(fee).with_asset_id(asset))?
    ///     .call()
    ///     .await?;
    /// # orao_fuel_vrf::Result::Ok(()) });
    /// ```
    pub fn request(&self, seed: Bits256) -> ContractCallHandler<A, u64> {
        self.methods.request(seed)
    }

    pub async fn request_and_await(
        &self,
        seed: Bits256,
        fee: u64,
        tx_policies: Option<TxPolicies>,
    ) -> Result<FuelCallResponse<u64>> {
        let mut call = self.methods.request(seed);
        if let Some(policies) = tx_policies {
            call = call.with_tx_policies(policies);
        }
        let call = call.call_params(CallParameters::default().with_amount(fee))?;
        self.call_and_await(call).await
    }

    // Workaround for FuelLabs/fuel-core#1076
    async fn call_and_await<T>(
        &self,
        call: ContractCallHandler<A, T>,
    ) -> Result<FuelCallResponse<T>>
    where
        T: Tokenizable + Parameterize,
        T: Debug,
    {
        let tx = call.build_tx().await?;
        let wallet = self.abi.account();
        let provider = wallet.try_provider()?;
        let tx_id = provider.send_transaction(tx).await?;

        //let tx_id = self.try_provider()?.send_transaction(&tx).await?;

        // see FuelLabs/fuel-core#1076
        let mut receipts = vec![];
        for _ in 0..5 {
            tokio::time::sleep(Duration::from_secs(1)).await;
            receipts = provider.tx_status(&tx_id).await.unwrap().take_receipts();
            if !receipts.is_empty() {
                break;
            }
        }

        Ok(call.get_response(receipts)?)
    }

    /// Returns the configured authority.
    ///
    /// # Note
    ///
    /// `None` means that the contract instance is not yet configured.
    pub async fn get_authority(&self) -> Result<Option<Identity>> {
        let authority = self.methods.get_authority().simulate().await?.value;
        if authority != Identity::Address(Address::zeroed()) {
            Ok(Some(authority))
        } else {
            Ok(None)
        }
    }

    /// Returns the configured fee for the given asset.
    ///
    /// Use [`AssetId::BASE`] to get base asset fee.
    pub async fn get_fee(&self, asset: AssetId) -> Result<u64> {
        Ok(self
            .methods
            .get_fee(Bits256(*asset.clone()))
            .simulate()
            .await?
            .value)
    }

    /// Returns the additional asset to pay fee with.
    ///
    /// Not that it returns the base asset if additional asset is not configured.
    pub async fn get_asset(&self) -> Result<AssetId> {
        Ok(AssetId::new(
            self.methods.get_asset().simulate().await?.value.0,
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

    /// Convenience method that returns on-chain VRF status.
    // TODO: Clean this up as soon as FuelLabs/fuels-rs#914 is fixed
    pub async fn get_status(&self) -> Result<Status> {
        let mut call = MultiContractCallHandler::new(self.abi.account());
        call.add_call(self.methods.get_authority())
            .add_call(self.methods.get_balance(Bits256(*AssetId::BASE.clone())))
            .add_call(self.methods.get_fee(Bits256(*AssetId::BASE.clone())))
            .add_call(self.methods.get_asset())
            .add_call(self.methods.get_fulfillment_authorities())
            .add_call(self.methods.get_num_requests());
        let policies = TxPolicies::default().with_gas_price(1).with_script_gas_limit(10_000_000);
        call = call.with_tx_policies(policies);

        //let tx = fuels::tx::FuelTransaction::from(call.build_tx().await.unwrap());
        let tx2 = call.build_tx().await.unwrap();

        let mut receipts = self
            .abi
            .account()
            .try_provider()?
            .dry_run_no_validation(tx2)
            .await
            .unwrap()
            .into_iter();
        
        /// Helper, that extracts next call receipts.
        fn next_receipts(i: &mut impl Iterator<Item = Receipt>) -> Vec<Receipt> {
            let mut receipts = i
                .by_ref()
                .enumerate()
                .take_while(|(i, x)| *i == 0 || !matches!(x, Receipt::Call { .. }))
                .map(|(_, x)| x)
                .collect::<Vec<_>>();
            receipts.push(Receipt::ScriptResult {
                result: ScriptExecutionResult::Success,
                gas_used: 0,
            });
            receipts
        }

        let authority = self
            .methods
            .get_authority()
            .get_response(next_receipts(&mut receipts))?
            .value;
        let balance = self
            .methods
            .get_balance(Bits256(*AssetId::BASE.clone()))
            .get_response(next_receipts(&mut receipts))?
            .value;
        let fee = self
            .methods
            .get_fee(Bits256(*AssetId::BASE.clone()))
            .get_response(next_receipts(&mut receipts))?
            .value;
        let asset = self
            .methods
            .get_asset()
            .get_response(next_receipts(&mut receipts))?
            .value;
        let fulfillment_authorities = self
            .methods
            .get_fulfillment_authorities()
            .get_response(next_receipts(&mut receipts))?
            .value;
        let num_requests = self
            .methods
            .get_num_requests()
            .get_response(next_receipts(&mut receipts))?
            .value;

        let additional_asset = if asset.0 != *AssetId::BASE {
            let mut call = MultiContractCallHandler::new(self.abi.account());
            call.add_call(self.methods.get_balance(asset))
                .add_call(self.methods.get_fee(asset));
            //let tx = fuels::tx::FuelTransaction::from(call.build_tx().await.unwrap());
            let tx2 = call.build_tx().await.unwrap();

            let mut receipts = self
                .abi
                .account()
                .try_provider()?
                .dry_run_no_validation(tx2)
                .await
                .unwrap()
                .into_iter();
            
            let balance = self
                .methods
                .get_balance(Bits256(*AssetId::BASE.clone()))
                .get_response(next_receipts(&mut receipts))?
                .value;
            let fee = self
                .methods
                .get_fee(Bits256(*AssetId::BASE.clone()))
                .get_response(next_receipts(&mut receipts))?
                .value;
            Some((AssetId::new(asset.0), AssetStatus { fee, balance }))
        } else {
            None
        };

        Ok(Status {
            authority: if authority != Identity::Address(Address::zeroed()) {
                Some(authority)
            } else {
                None
            },
            num_requests,
            base_asset: AssetStatus { fee, balance },
            fulfillment_authorities: fulfillment_authorities
                .into_iter()
                .filter_map(identity)
                .collect(),
            additional_asset,
        })
    }
}

/// Structure that represents on-chain VRF state.
#[derive(Debug, Clone)]
pub struct Status {
    pub authority: Option<Identity>,
    pub num_requests: u64,
    pub base_asset: AssetStatus,
    pub fulfillment_authorities: Vec<Address>,
    pub additional_asset: Option<(AssetId, AssetStatus)>,
}

#[derive(Debug, Clone, Copy)]
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
