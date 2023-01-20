import { Provider, AbstractAddress, BN, BigNumberish, BaseWalletLocked } from "fuels";
import { VrfImplAbi__factory, VrfImplAbi } from "./contracts";
import { Option } from "./contracts/common";
import { AddressOutput, ContractIdInput, ContractIdOutput, IdentityOutput, RandomnessOutput } from "./contracts/VrfImplAbi";

export const CONTRACT_ID = "0x11aadad33b006b21390e1452cd6354b6aa71bfd997ce0977936eb60637a96a0e";

export class Vrf {
    private abi: VrfImplAbi;

    /**
     * Created object will use deployed Vrf instance at the given address.
     * 
     * Note, that you'll need a configured wallet to perform reqeusts.
     */
    constructor(walletOrProvider: BaseWalletLocked | Provider, id: string | AbstractAddress = CONTRACT_ID) {
        this.abi = VrfImplAbi__factory.connect(id, walletOrProvider)
    }

    /**
     * Returns the configured authority.
     */
    async getAuthority(): Promise<IdentityOutput> {
        return (await this.abi.functions.get_authority().get()).value
    }

    /**
     * Returns contract balance for the given asset.
     */
    async getBalance(asset: ContractIdInput): Promise<BN> {
        return (await this.abi.functions.get_balance(asset).get()).value;
    }

    /**
     * Returns the additional asset to pay fees with.
     * 
     * Returns default asset if additional asset is not configured.
     */
    async getAsset(): Promise<ContractIdOutput> {
        return (await this.abi.functions.get_asset().get()).value;
    }

    /**
     * Returns the configured fee for the given asset.
     */
    async getFee(asset: ContractIdInput): Promise<BN> {
        return (await this.abi.functions.get_fee(asset).get()).value;
    }

    /**
     * Returns the list of fulfillment authorities.
     */
    async getFulfillmentAuthorities(): Promise<AddressOutput[]> {
        const output = [];
        for (let address of (await this.abi.functions.get_fulfillment_authorities().get()).value) {
            let a = address;
            if (a) {
                output.push(a);
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
    async getRequest(seedHexOrNum: string | BigNumberish): Promise<Option<RandomnessOutput>> {
        if (typeof seedHexOrNum == "string") {
            return (await this.abi.functions.get_request_by_seed(seedHexOrNum).get()).value;
        } else {
            return (await this.abi.functions.get_request_by_num(seedHexOrNum).get()).value;
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
        let asset = { value: '0x0000000000000000000000000000000000000000000000000000000000000000' };
        if (useAdditionalAsset) {
            asset = await this.getAsset();
        }
        let fee = await this.getFee(asset);
        let call = this.abi.functions
            .request(seedHex)
            .txParams({ gasPrice: 1 })
            .callParams({ "forward": { "amount": fee, "assetId": asset.value } });
        return (await call.call()).value;
    }
}