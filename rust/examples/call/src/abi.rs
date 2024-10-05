use fuels::{
    prelude::{CallParameters, TxPolicies},
    types::Bits256,
};

use fuels::prelude::{Account, Execution};

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
    pub async fn status(&self) -> anyhow::Result<bindings::Status> {
        Ok(self
            .methods()
            .status()
            // this is necessary, because our contract calls VRF contract
            .with_contract_ids(&[orao_fuel_vrf::CONTRACT_ID.into()])
            .simulate(Execution::StateReadOnly)
            .await?
            .value)
    }

    /// Helper that calls `spin_and_pull_the_trigger` on a russian roulette instance.
    pub async fn spin_and_pull_the_trigger(&self) -> anyhow::Result<()> {
        // using random "force" - generates a boolean
        let force = rand::random();

        // we need to get the correct fee
        let fee = self
            .methods()
            .round_cost()
            .with_contract_ids(&[orao_fuel_vrf::CONTRACT_ID.into()])
            .simulate(Execution::StateReadOnly)
            .await?
            .value;

        println!("VRF fee is: {:?}", fee);

        self.methods()
            .spin_and_pull_the_trigger(Bits256(force))
            .with_tx_policies(TxPolicies::default())
            .call_params(CallParameters::default().with_amount(fee))?
            .with_contract_ids(&[orao_fuel_vrf::CONTRACT_ID.into()])
            .call()
            .await?;

        Ok(())
    }
}
