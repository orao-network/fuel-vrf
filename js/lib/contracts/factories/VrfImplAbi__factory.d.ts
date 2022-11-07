import type { Provider, Wallet, AbstractAddress } from "fuels";
import type { VrfImplAbi, VrfImplAbiInterface } from "../VrfImplAbi";
export declare class VrfImplAbi__factory {
    static readonly abi: {
        types: ({
            typeId: number;
            type: string;
            components: {
                name: string;
                type: number;
                typeArguments: {
                    name: string;
                    type: number;
                    typeArguments: null;
                }[];
            }[];
            typeParameters: null;
        } | {
            typeId: number;
            type: string;
            components: {
                name: string;
                type: number;
                typeArguments: null;
            }[];
            typeParameters: null;
        } | {
            typeId: number;
            type: string;
            components: null;
            typeParameters: null;
        } | {
            typeId: number;
            type: string;
            components: {
                name: string;
                type: number;
                typeArguments: null;
            }[];
            typeParameters: number[];
        })[];
        functions: ({
            inputs: {
                name: string;
                type: number;
                typeArguments: null;
            }[];
            name: string;
            output: {
                name: string;
                type: number;
                typeArguments: null;
            };
        } | {
            inputs: {
                name: string;
                type: number;
                typeArguments: null;
            }[];
            name: string;
            output: {
                name: string;
                type: number;
                typeArguments: {
                    name: string;
                    type: number;
                    typeArguments: null;
                }[];
            };
        })[];
        loggedTypes: ({
            logId: number;
            loggedType: {
                name: string;
                type: number;
                typeArguments: never[];
            };
        } | {
            logId: number;
            loggedType: {
                name: string;
                type: number;
                typeArguments: null;
            };
        })[];
    };
    static createInterface(): VrfImplAbiInterface;
    static connect(id: string | AbstractAddress, walletOrProvider: Wallet | Provider): VrfImplAbi;
}
