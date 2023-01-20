import { Provider, AbstractAddress, BN, BigNumberish, BaseWalletLocked } from "fuels";
import { Option } from "./contracts/common";
import { AddressOutput, ContractIdInput, ContractIdOutput, IdentityOutput, RandomnessOutput } from "./contracts/VrfImplAbi";
export declare const CONTRACT_ID = "0x11aadad33b006b21390e1452cd6354b6aa71bfd997ce0977936eb60637a96a0e";
export declare class Vrf {
    private abi;
    /**
     * Created object will use deployed Vrf instance at the given address.
     *
     * Note, that you'll need a configured wallet to perform reqeusts.
     */
    constructor(walletOrProvider: BaseWalletLocked | Provider, id?: string | AbstractAddress);
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
    getRequest(seedHexOrNum: string | BigNumberish): Promise<Option<RandomnessOutput>>;
    /**
     * Performs a randomness request.
     *
     * Please note, that fees will be paid. Caller is able to choose additional
     * asset to pay fees, if it is configured (see `getAsset()`). This function
     * will fall back to the base asset.
     *
     * @returns a pair of seed and request number.
     */
    request(seedHex: string, useAdditionalAsset?: boolean): Promise<BN>;
}
