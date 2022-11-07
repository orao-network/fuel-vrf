"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vrf = exports.CONTRACT_ID = void 0;
const contracts_1 = require("./contracts");
exports.CONTRACT_ID = "0x14ba36bb24ff06352e692d9c3b30548cffb3e4d94282aa033d03285aedca4fa8";
class Vrf {
    abi;
    /**
     * Created object will use deployed Vrf instance at the given address.
     *
     * Note, that you'll need a configured wallet to perform reqeusts.
     */
    constructor(walletOrProvider, id = exports.CONTRACT_ID) {
        this.abi = contracts_1.VrfImplAbi__factory.connect(id, walletOrProvider);
    }
    /**
     * Returns the configured authority.
     */
    async getAuthority() {
        return (await this.abi.functions.get_authority().get()).value;
    }
    /**
     * Returns contract balance for the given asset.
     */
    async getBalance(asset) {
        return (await this.abi.functions.get_balance(asset).get()).value;
    }
    /**
     * Returns the additional asset to pay fees with.
     *
     * Returns default asset if additional asset is not configured.
     */
    async getAsset() {
        return (await this.abi.functions.get_asset().get()).value;
    }
    /**
     * Returns the configured fee for the given asset.
     */
    async getFee(asset) {
        return (await this.abi.functions.get_fee(asset).get()).value;
    }
    /**
     * Returns the list of fulfillment authorities.
     */
    async getFulfillmentAuthorities() {
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
    async getNumRequests() {
        return (await this.abi.functions.get_num_requests().get()).value;
    }
    /**
     * Returns the given randomness request (if exists).
     */
    async getRequest(seedHexOrNum) {
        if (typeof seedHexOrNum == "string") {
            return (await this.abi.functions.get_request_by_seed(seedHexOrNum).get()).value;
        }
        else {
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
    async request(seedHex, useAdditionalAsset = false) {
        let asset = { value: '0x0000000000000000000000000000000000000000000000000000000000000000' };
        if (useAdditionalAsset) {
            asset = await this.getAsset();
        }
        let fee = await this.getFee(asset);
        let call = this.abi.functions.request(seedHex);
        let no = (await call.txParams({ gasPrice: 1 }).callParams({ "forward": { "amount": fee, "assetId": asset.value } }).call()).value;
        return [seedHex, no];
    }
}
exports.Vrf = Vrf;
