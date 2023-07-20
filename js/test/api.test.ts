import { describe, expect, test, beforeAll } from '@jest/globals';
import { Provider, WalletUnlocked, Wallet, randomBytes, hexlify } from 'fuels';
import { Vrf } from '../.';

const URL = "https://beta-3.fuel.network/graphql";

let provider: Provider;
let vrf: Vrf;
let seed = randomBytes(32);

if (!process.env.PRIVATE_KEY) {
    throw new Error("Define PRIVATE_KEY in your env (the wallet must be funded)");
}

beforeAll(async () => {
    provider = new Provider(URL);
    const wallet: WalletUnlocked = Wallet.fromPrivateKey(process.env.PRIVATE_KEY ?? "", provider);
    vrf = new Vrf(wallet);
});

describe('VRF API', () => {
    test('request', async () => {
        let seedHex = hexlify(seed);
        let requestNum = await vrf.request(seedHex);

        let response = await vrf.getRequest(requestNum);

        expect(response).toBeDefined();
        expect(response?.seed).toEqual(seedHex);
        expect(response?.state.Unfulfilled).not.toBe(undefined);
    }, 60_000);
    test('wait fulfilled', async () => {
        let seedHex = hexlify(seed);
        let response = await vrf.getRequest(seedHex);
        expect(response).toBeDefined();
        expect(response?.seed).toEqual(seedHex);
        while (response?.state.Fulfilled === undefined) {
            await sleep(2_000);
            response = await vrf.getRequest(seedHex);
            expect(response).toBeDefined();
            expect(response?.seed).toEqual(seedHex);
        }
    }, 60_000);
});

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve, _reject) => setTimeout(resolve, ms));
}