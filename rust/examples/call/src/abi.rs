use fuels::{prelude::*, types::Bits256};
use orao_fuel_vrf::{Vrf, TESTNET_CONTRACT_ID};

pub mod bindings {
    include!(concat!(env!("OUT_DIR"), "/bindings.rs"));
}

impl bindings::Status {
    pub fn round(&self) -> u64 {
        match self {
            bindings::Status::PlayerIsAlive(x) => *x,
            bindings::Status::PlayerIsDead(x) => *x,
            bindings::Status::SpinningBarrel(x) => *x,
        }
    }
}

impl<T: Account> bindings::RussianRoulette<T> {
    /// Helper that calls `status` on a russian roulette instance.
    pub async fn status(&self, address: Address) -> anyhow::Result<bindings::Status> {
        Ok(self
            .methods()
            .status(address)
            .simulate(Execution::StateReadOnly)
            .await?
            .value)
    }

    /// Helper that calls `randomness_status` on a russian roulette instance.
    pub async fn randomness_status(
        &self,
        address: Address,
    ) -> anyhow::Result<bindings::RandomnessState> {
        let account = ImpersonatedAccount::new(
            Bech32Address::default(),
            Some(self.account().try_provider().unwrap().clone()),
        );
        let vrf = Vrf::new(TESTNET_CONTRACT_ID, account).await;
        let contract_ids = vrf.contract_ids();

        Ok(self
            .methods()
            .randomness_status(address)
            .with_contract_ids(&contract_ids)
            .simulate(Execution::StateReadOnly)
            .await?
            .value)
    }

    /// Helper that calls `execute_callback` on a russian roulette instance.
    pub async fn execute_callback(&self) -> anyhow::Result<()> {
        let account = ImpersonatedAccount::new(
            Bech32Address::default(),
            Some(self.account().try_provider().unwrap().clone()),
        );
        let vrf = Vrf::new(TESTNET_CONTRACT_ID, account).await;
        let mut contract_ids = vrf.contract_ids();
        contract_ids.push(crate::CONTRACT_ID.into());

        self.methods()
            .execute_callback()
            // this is necessary, because our contract calls VRF contract
            .with_contract_ids(&contract_ids)
            // https://docs.fuel.network/docs/fuels-rs/calling-contracts/variable-outputs/
            .with_variable_output_policy(VariableOutputPolicy::Exactly(1))
            .call()
            .await?;

        Ok(())
    }

    /// Helper that calls `spin_and_pull_the_trigger` on a russian roulette instance.
    pub async fn spin_and_pull_the_trigger(&self, bet_amount: u64) -> anyhow::Result<()> {
        let account = ImpersonatedAccount::new(
            Bech32Address::default(),
            Some(self.account().try_provider().unwrap().clone()),
        );
        let vrf = Vrf::new(TESTNET_CONTRACT_ID, account).await;
        let contract_ids = vrf.contract_ids();

        // using random "force" - generates a boolean
        let force = rand::random();

        // we need to get the correct fee
        let fee = self
            .methods()
            .round_cost()
            .with_contract_ids(&contract_ids)
            .simulate(Execution::StateReadOnly)
            .await?
            .value;

        println!("VRF fee is: {:?}", fee);

        self.methods()
            .spin_and_pull_the_trigger(Bits256(force), bet_amount)
            // this is necessary, because our contract calls VRF contract
            .with_contract_ids(&contract_ids)
            .with_tx_policies(TxPolicies::default())
            .call_params(CallParameters::default().with_amount(bet_amount + fee + 10000))? // fee + CALLBACK_FEE
            .call()
            .await?;

        Ok(())
    }
}
