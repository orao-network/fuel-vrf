import {
    Provider,
    AbstractAddress,
    BN,
    BigNumberish,
    Account,
    TxParams,
    B256Address,
    AssetId,
} from "fuels";
import { VrfImplAbi__factory, VrfImplAbi } from "./contracts";
import { Option } from "./contracts/common";
import {
    AssetIdInput,
    AssetIdOutput,
    ContractIdInput,
    IdentityOutput,
    RandomnessOutput,
} from "./contracts/VrfImplAbi";

/** Deployed contract address */
export const CONTRACT_ID =
    "0x749a7eefd3494f549a248cdcaaa174c1a19f0c1d7898fa7723b6b2f8ecc4828d";

export class Vrf {
    protected abi: VrfImplAbi;

    /**
     * Returns the provider reference.
     */
    provider(): Provider {
        return this.abi.provider;
    }

    /**
     * Helper returning the network base asset identifier.
     */
    getNetworkBaseAsset(): AssetId {
        return {
            bits: this.abi.provider.getBaseAssetId(),
        };
    }

    /**
     * Created object will use deployed Vrf instance at the given address.
     *
     * Note, that you'll need a configured wallet to perform requests.
     */
    constructor(
        walletOrProvider: Account | Provider,
        id: B256Address | AbstractAddress = CONTRACT_ID
    ) {
        this.abi = VrfImplAbi__factory.connect(id, walletOrProvider);
    }

    /**
     * Returns the configured authority (if any).
     */
    async getAuthority(): Promise<IdentityOutput | null> {
        const owner = (await this.abi.functions.owner().dryRun()).value;
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
        asset: B256Address | AbstractAddress | AssetId
    ): Promise<BN> {
        let asset_id: AssetIdInput;

        if ("object" === typeof asset && "bits" in asset) {
            asset_id = asset;
        } else {
            asset_id = { bits: asset.toString() };
        }

        return (await this.abi.functions.get_balance(asset_id).dryRun()).value;
    }

    /**
     * Returns the additional asset to pay fees with.
     *
     * Returns default asset if additional asset is not configured.
     */
    async getAsset(): Promise<B256Address> {
        return (await this.abi.functions.get_asset().dryRun()).value.bits;
    }

    /**
     * Returns the configured fee for the given asset.
     */
    async getFee(asset: B256Address | AbstractAddress | AssetId): Promise<BN> {
        let asset_id: AssetIdInput;

        if ("object" === typeof asset && "bits" in asset) {
            asset_id = asset;
        } else {
            asset_id = { bits: asset.toString() };
        }

        return (await this.abi.functions.get_fee(asset_id).dryRun()).value;
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
                await this.abi.functions.get_fulfillment_authorities().dryRun()
            ).value.map((x: AssetIdOutput) => x.bits);
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
        return (await this.abi.functions.get_num_requests().dryRun()).value;
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
                    .dryRun()
            ).value;
        } else {
            return (
                await this.abi.functions
                    .get_request_by_num(seedHexOrNum)
                    .dryRun()
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
     * @returns a pair of seed and request number.
     */
    async request(
        seedHex: string,
        useAdditionalAsset: boolean = false,
        txParams?: TxParams
    ): Promise<BN> {
        let asset = this.abi.provider.getBaseAssetId();
        if (useAdditionalAsset) {
            asset = await this.getAsset();
        }
        let fee = await this.getFee(asset);
        let call = this.abi.functions.request(seedHex);
        if (txParams) {
            call = call.txParams(txParams);
        }
        call.callParams({ forward: { amount: fee, assetId: asset } });
        return (await call.call()).value;
    }
}

export function toContractIdInput(
    value: B256Address | AbstractAddress
): ContractIdInput {
    if ("string" == typeof value) {
        return { bits: value };
    } else {
        return { bits: value.toB256() };
    }
}
