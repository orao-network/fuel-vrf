use fuels::prelude::{Bits256, CallParameters, TxParameters};

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

impl bindings::RussianRoulette {
    /// Helper that calls `status` on a russian roulette instance.
    pub async fn status(&self) -> anyhow::Result<bindings::Status> {
        Ok(self
            .methods()
            .status()
            // this is necessary, because our contract calls VRF contract
            .set_contracts(&[orao_fuel_vrf::CONTRACT_ID.into()])
            .simulate()
            .await?
            .value)
    }

    /// Helper that calls `spin_and_pull_the_trigger` on a russian roulette instance.
    pub async fn spin_and_pull_the_trigger(&self) -> anyhow::Result<()> {
        // using random "force"
        let force = rand::random();

        // we need to get the correct fee
        let fee = self
            .methods()
            .round_cost()
            .set_contracts(&[orao_fuel_vrf::CONTRACT_ID.into()])
            .simulate()
            .await?
            .value;

        self.methods()
            .spin_and_pull_the_trigger(Bits256(force))
            .tx_params(TxParameters::new(Some(1), None, None))
            .call_params(CallParameters::new(Some(fee), None, None))
            .set_contracts(&[orao_fuel_vrf::CONTRACT_ID.into()])
            .call()
            .await?;

        Ok(())
    }
}
