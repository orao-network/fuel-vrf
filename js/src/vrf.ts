import { Provider, AbstractAddress, BN, BigNumberish, Account, TxParams, B256Address } from "fuels";
import { VrfImplAbi__factory, VrfImplAbi } from "./contracts";
import { Option } from "./contracts/common";
import { ContractIdInput, IdentityOutput, RandomnessOutput } from "./contracts/VrfImplAbi";

/** Deployed contract address */
export const CONTRACT_ID = "0xba359a2c9c75e51e04c14a9b7849c6fd76ead15ea4e68e623d75d1bed9d0dc4b";

export class Vrf {
    protected abi: VrfImplAbi;
    protected txParams: TxParams = { gasPrice: 1 };

    /**
     * Created object will use deployed Vrf instance at the given address.
     * 
     * Note, that you'll need a configured wallet to perform reqeusts.
     */
    constructor(walletOrProvider: Account | Provider, id: B256Address | AbstractAddress = CONTRACT_ID) {
        this.abi = VrfImplAbi__factory.connect(id, walletOrProvider)
    }

    /**
     * Returns the configured authority.
     */
    async getAuthority(): Promise<IdentityOutput> {
        return (await this.abi.functions.get_authority().dryRun()).value
    }

    /**
     * Returns contract balance for the given asset.
     */
    async getBalance(asset: B256Address | AbstractAddress): Promise<BN> {
        return (await this.abi.functions.get_balance({value: asset.toString()}).dryRun()).value;
    }

    /**
     * Returns the additional asset to pay fees with.
     * 
     * Returns default asset if additional asset is not configured.
     */
    async getAsset(): Promise<B256Address> {
        return ( (await this.abi.functions.get_asset().dryRun()).value ).value;
    }

    /**
     * Returns the configured fee for the given asset.
     */
    async getFee(asset: B256Address | AbstractAddress): Promise<BN> {
        return (await this.abi.functions.get_fee({value: asset.toString()}).dryRun()).value;
    }

    /**
     * Returns the list of fulfillment authorities.
     */
    async getFulfillmentAuthorities(): Promise<B256Address[]> {
        const output = [];
        for (let address of (await this.abi.functions.get_fulfillment_authorities().dryRun()).value) {
            let a = address;
            if (a) {
                output.push(a.value);
            }
        }
        return output;
    }

    /**
     * Returns the number of received randomness requests.
     */
    async getNumRequests(): Promise<BN> {
        return (await this.abi.functions.get_num_requests().dryRun()).value;
    }

    /**
     * Returns the given randomness request (if exists).
     */
    async getRequest(seedHexOrNum: string | BigNumberish): Promise<Option<RandomnessOutput>> {
        if (typeof seedHexOrNum == "string") {
            return (await this.abi.functions.get_request_by_seed(seedHexOrNum).dryRun()).value;
        } else {
            return (await this.abi.functions.get_request_by_num(seedHexOrNum).dryRun()).value;
        }
    }

    /**
     * Performs a randomness request.
     * 
     * Please note, that fees will be paid. Caller is able to choose additional
     * asset to pay fees, if it is configured (see `getAsset()`). This function
     * will fall back to the base asset.
     *
     * @returns a pair of seed and request number.
     */
    async request(seedHex: string, useAdditionalAsset: boolean = false): Promise<BN> {
        let asset = '0x0000000000000000000000000000000000000000000000000000000000000000';
        if (useAdditionalAsset) {
            asset = await this.getAsset();
        }
        let fee = await this.getFee(asset);
        let call = this.abi.functions
            .request(seedHex)
            .txParams(this.txParams)
            .callParams({ "forward": { "amount": fee, "assetId": asset } });
        return (await call.call()).value;
    }

    /**
     * Every subsequent call to a contract method will use the given `txParams`.
     * 
     * Defaults to `{ gasPrice: 1 }`.
     */
    setTxParams(txParams: TxParams) {
        this.txParams = txParams;
    }
}

export function toContractIdInput(value: B256Address | AbstractAddress): ContractIdInput {
    if ("string" == typeof value) {
        return { value }
    } else {
        return { value: value.toB256() }
    }
}
