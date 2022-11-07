import { Wallet, Provider, AbstractAddress, BN, BigNumberish } from "fuels";
import { AddressOutput, ContractIdInput, ContractIdOutput, IdentityOutput, OptionalRandomnessOutput } from "./contracts/VrfImplAbi";
export declare const CONTRACT_ID = "0x14ba36bb24ff06352e692d9c3b30548cffb3e4d94282aa033d03285aedca4fa8";
export declare class Vrf {
    private abi;
    /**
     * Created object will use deployed Vrf instance at the given address.
     *
     * Note, that you'll need a configured wallet to perform reqeusts.
     */
    constructor(walletOrProvider: Wallet | Provider, id?: string | AbstractAddress);
    /**
     * Returns the configured authority.
     */
    getAuthority(): Promise<IdentityOutput>;
    /**
     * Returns contract balance for the given asset.
     */
    getBalance(asset: ContractIdInput): Promise<BN>;
    /**
     * Returns the additional asset to pay fees with.
     *
     * Returns default asset if additional asset is not configured.
     */
    getAsset(): Promise<ContractIdOutput>;
    /**
     * Returns the configured fee for the given asset.
     */
    getFee(asset: ContractIdInput): Promise<BN>;
    /**
     * Returns the list of fulfillment authorities.
     */
    getFulfillmentAuthorities(): Promise<AddressOutput[]>;
    /**
     * Returns the number of received randomness requests.
     */
    getNumRequests(): Promise<BN>;
    /**
     * Returns the given randomness request (if exists).
     */
    getRequest(seedHexOrNum: string | BigNumberish): Promise<OptionalRandomnessOutput>;
    /**
     * Performs a randomness request.
     *
     * Please note, that fees will be paid. Caller is able to choose additional
     * asset to pay fees, if it is configured (see `getAsset()`). This function
     * will fall back to the base asset.
     *
     * @returns a pair of seed and request number.
     */
    request(seedHex: string, useAdditionalAsset?: boolean): Promise<[string, BN]>;
}
