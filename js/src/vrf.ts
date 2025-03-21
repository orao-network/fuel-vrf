import {
    Provider,
    BN,
    BigNumberish,
    Account,
    TxParams,
    B256Address,
    AssetId,
    Address,
} from "fuels";
import {VrfImpl} from "./contracts";
import {Option} from "./contracts/common";
import {
    AssetIdInput,
    ContractIdInput,
    IdentityOutput,
    RandomnessOutput,
} from "./contracts/VrfImpl";

/** Deployed contract address */
export const MAINNET_CONTRACT_ID =
    "0xf0b0fcded2b3dcbc529d611300b904df97bf473240ce4679993e418b36b3e8d0";
export const TESTNET_CONTRACT_ID =
    "0x2a8d96911becbe05b2a9f5253c91865f0f4b365ed0e2abab17a35e9fc9c4ac76";

export class Vrf {
    public abi: VrfImpl;

    /**
     * Returns the provider reference.
     */
    provider(): Provider {
        return this.abi.provider;
    }

    /**
     * Helper returning the network base asset identifier.
     */
    async getNetworkBaseAsset(): Promise<AssetId> {
        return {
            bits: await this.abi.provider.getBaseAssetId(),
        };
    }

    /**
     * Created object will use deployed Vrf instance at the given address.
     *
     * Note, that you'll need a configured wallet to perform requests.
     */
    constructor(
        walletOrProvider: Account | Provider,
        id: B256Address | Address = MAINNET_CONTRACT_ID,
    ) {
        this.abi = new VrfImpl(id, walletOrProvider);
    }

    /**
     * Returns the configured authority (if any).
     */
    async getAuthority(): Promise<IdentityOutput | null> {
        const owner = (await this.abi.functions.owner().get()).value;
        if (owner.Initialized !== undefined) {
            return owner.Initialized;
        } else {
            return null;
        }
    }

    /**
     * Returns contract balance for the given asset.
     */
    async getBalance(
        asset: B256Address | Address | AssetId
    ): Promise<BN> {
        let asset_id: AssetIdInput;

        if ("object" === typeof asset && "bits" in asset) {
            asset_id = asset;
        } else {
            asset_id = {bits: asset.toString()};
        }

        return (await this.abi.functions.get_balance(asset_id).get()).value;
    }

    /**
     * Returns the additional asset to pay fees with.
     *
     * Returns default asset if additional asset is not configured.
     */
    async getAsset(): Promise<B256Address> {
        return (await this.abi.functions.get_asset().get()).value.bits;
    }

    /**
     * Returns the configured fee for the given asset.
     */
    async getFee(asset: B256Address | Address | AssetId): Promise<BN> {
        let asset_id: AssetIdInput;

        if ("object" === typeof asset && "bits" in asset) {
            asset_id = asset;
        } else {
            asset_id = {bits: asset.toString()};
        }

        return (await this.abi.functions.get_fee(asset_id).get()).value;
    }

    /**
     * Returns the list of fulfillment authorities.
     */
    async getFulfillmentAuthorities(): Promise<B256Address[]> {
        const output = [];
        let addresses: string[];

        // TODO: fuels-rs is unable to parse an empty vector (see FuelLabs/fuels-ts#2550)
        try {
            addresses = (
                await this.abi.functions.get_fulfillment_authorities().get()
            ).value.map((x) => x.bits);
        } catch (e) {
            // pass
            addresses = [];
        }

        for (let address of addresses) {
            if (address) {
                output.push(address);
            }
        }

        return output;
    }

    /**
     * Returns the number of received randomness requests.
     */
    async getNumRequests(): Promise<BN> {
        return (await this.abi.functions.get_num_requests().get()).value;
    }

    /**
     * Returns the given randomness request (if exists).
     */
    async getRequest(
        seedHexOrNum: string | BigNumberish
    ): Promise<Option<RandomnessOutput>> {
        if (typeof seedHexOrNum == "string") {
            return (
                await this.abi.functions
                    .get_request_by_seed(seedHexOrNum)
                    .get()
            ).value;
        } else {
            return (
                await this.abi.functions
                    .get_request_by_num(seedHexOrNum)
                    .get()
            ).value;
        }
    }

    /**
     * Performs a randomness request.
     *
     * Please note, that fees will be paid. Caller is able to choose additional
     * asset to pay fees, if it is configured (see `getAsset()`). This function
     * will fall back to the base asset.
     *
     * @returns A promise that resolves to an object containing:
     *          - transactionId: A string representing the ID of the submitted transaction.
     *          - requestNum: A BN (Big Number) representing the unique identifier for this randomness request.
     */
    async request(
        seedHex: string,
        useAdditionalAsset: boolean = false,
        txParams?: TxParams
    ): Promise<{
        transactionId: string;
        requestNum: BN;
    }> {
        let asset = await this.abi.provider.getBaseAssetId();
        if (useAdditionalAsset) {
            asset = await this.getAsset();
        }
        let fee = await this.getFee(asset);
        let call = this.abi.functions.request(seedHex);
        if (txParams) {
            call = call.txParams(txParams);
        }
        call.callParams({forward: {amount: fee, assetId: asset}});
        const {transactionId, waitForResult} = await call.call();
        const {value: requestNum} = await waitForResult();
        return {transactionId, requestNum};
    }
}

export function toContractIdInput(
    value: B256Address | Address
): ContractIdInput {
    if ("string" == typeof value) {
        return {bits: value};
    } else {
        return {bits: value.toB256()};
    }
}
