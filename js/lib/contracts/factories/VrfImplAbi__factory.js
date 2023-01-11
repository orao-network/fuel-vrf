"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VrfImplAbi__factory = void 0;
const fuels_1 = require("fuels");
const _abi = {
    types: [
        {
            typeId: 0,
            type: "()",
            components: [],
            typeParameters: null,
        },
        {
            typeId: 1,
            type: "[_; 10]",
            components: [
                {
                    name: "__array_element",
                    type: 8,
                    typeArguments: [
                        {
                            name: "",
                            type: 14,
                            typeArguments: null,
                        },
                    ],
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 2,
            type: "[_; 24]",
            components: [
                {
                    name: "__array_element",
                    type: 8,
                    typeArguments: [
                        {
                            name: "",
                            type: 20,
                            typeArguments: null,
                        },
                    ],
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 3,
            type: "[_; 2]",
            components: [
                {
                    name: "__array_element",
                    type: 4,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 4,
            type: "b256",
            components: null,
            typeParameters: null,
        },
        {
            typeId: 5,
            type: "enum Error",
            components: [
                {
                    name: "ContractNotConfigured",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "AssetNotConfigured",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "NotAuthorized",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "RemainingAssets",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "NonZeroFee",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "ZeroAuthority",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "ZeroFee",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "NoFeePaid",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "WrongFeePaid",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "SeedInUse",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "NoAmountSpecified",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "NotEnoughFunds",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "UnknownRequest",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "InvalidResponse",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "Fulfilled",
                    type: 0,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 6,
            type: "enum Event",
            components: [
                {
                    name: "Fulfill",
                    type: 17,
                    typeArguments: null,
                },
                {
                    name: "Response",
                    type: 23,
                    typeArguments: null,
                },
                {
                    name: "Request",
                    type: 21,
                    typeArguments: null,
                },
                {
                    name: "Reset",
                    type: 22,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 7,
            type: "enum Identity",
            components: [
                {
                    name: "Address",
                    type: 14,
                    typeArguments: null,
                },
                {
                    name: "ContractId",
                    type: 16,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 8,
            type: "enum Option",
            components: [
                {
                    name: "None",
                    type: 0,
                    typeArguments: null,
                },
                {
                    name: "Some",
                    type: 10,
                    typeArguments: null,
                },
            ],
            typeParameters: [10],
        },
        {
            typeId: 9,
            type: "enum RandomnessState",
            components: [
                {
                    name: "Unfulfilled",
                    type: 24,
                    typeArguments: null,
                },
                {
                    name: "Fulfilled",
                    type: 18,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 10,
            type: "generic T",
            components: null,
            typeParameters: null,
        },
        {
            typeId: 11,
            type: "str[16]",
            components: null,
            typeParameters: null,
        },
        {
            typeId: 12,
            type: "str[17]",
            components: null,
            typeParameters: null,
        },
        {
            typeId: 13,
            type: "str[30]",
            components: null,
            typeParameters: null,
        },
        {
            typeId: 14,
            type: "struct Address",
            components: [
                {
                    name: "value",
                    type: 4,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 15,
            type: "struct B512",
            components: [
                {
                    name: "bytes",
                    type: 3,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 16,
            type: "struct ContractId",
            components: [
                {
                    name: "value",
                    type: 4,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 17,
            type: "struct Fulfill",
            components: [
                {
                    name: "seed",
                    type: 4,
                    typeArguments: null,
                },
                {
                    name: "randomness",
                    type: 15,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 18,
            type: "struct Fulfilled",
            components: [
                {
                    name: "randomness",
                    type: 15,
                    typeArguments: null,
                },
                {
                    name: "keys",
                    type: 19,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 19,
            type: "struct FulfillersKeys",
            components: [
                {
                    name: "key1",
                    type: 14,
                    typeArguments: null,
                },
                {
                    name: "key2",
                    type: 14,
                    typeArguments: null,
                },
                {
                    name: "key3",
                    type: 14,
                    typeArguments: null,
                },
                {
                    name: "key4",
                    type: 14,
                    typeArguments: null,
                },
                {
                    name: "key5",
                    type: 14,
                    typeArguments: null,
                },
                {
                    name: "key6",
                    type: 14,
                    typeArguments: null,
                },
                {
                    name: "key7",
                    type: 14,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 20,
            type: "struct Randomness",
            components: [
                {
                    name: "seed",
                    type: 4,
                    typeArguments: null,
                },
                {
                    name: "state",
                    type: 9,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 21,
            type: "struct Request",
            components: [
                {
                    name: "seed",
                    type: 4,
                    typeArguments: null,
                },
                {
                    name: "client",
                    type: 7,
                    typeArguments: null,
                },
                {
                    name: "no",
                    type: 25,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 22,
            type: "struct Reset",
            components: [
                {
                    name: "seed",
                    type: 4,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 23,
            type: "struct Response",
            components: [
                {
                    name: "seed",
                    type: 4,
                    typeArguments: null,
                },
                {
                    name: "authority",
                    type: 14,
                    typeArguments: null,
                },
                {
                    name: "randomness",
                    type: 15,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 24,
            type: "struct Unfulfilled",
            components: [
                {
                    name: "randomness",
                    type: 15,
                    typeArguments: null,
                },
                {
                    name: "keys",
                    type: 19,
                    typeArguments: null,
                },
            ],
            typeParameters: null,
        },
        {
            typeId: 25,
            type: "u64",
            components: null,
            typeParameters: null,
        },
    ],
    functions: [
        {
            inputs: [
                {
                    name: "authority",
                    type: 7,
                    typeArguments: null,
                },
                {
                    name: "fee",
                    type: 25,
                    typeArguments: null,
                },
                {
                    name: "fulfillment_authorities",
                    type: 1,
                    typeArguments: null,
                },
            ],
            name: "configure",
            output: {
                name: "",
                type: 0,
                typeArguments: null,
            },
        },
        {
            inputs: [
                {
                    name: "asset",
                    type: 16,
                    typeArguments: null,
                },
                {
                    name: "fee",
                    type: 25,
                    typeArguments: null,
                },
            ],
            name: "configure_asset",
            output: {
                name: "",
                type: 0,
                typeArguments: null,
            },
        },
        {
            inputs: [
                {
                    name: "seed",
                    type: 4,
                    typeArguments: null,
                },
                {
                    name: "signature",
                    type: 15,
                    typeArguments: null,
                },
            ],
            name: "fulfill",
            output: {
                name: "",
                type: 0,
                typeArguments: null,
            },
        },
        {
            inputs: [],
            name: "get_asset",
            output: {
                name: "",
                type: 16,
                typeArguments: null,
            },
        },
        {
            inputs: [],
            name: "get_authority",
            output: {
                name: "",
                type: 7,
                typeArguments: null,
            },
        },
        {
            inputs: [
                {
                    name: "asset",
                    type: 16,
                    typeArguments: null,
                },
            ],
            name: "get_balance",
            output: {
                name: "",
                type: 25,
                typeArguments: null,
            },
        },
        {
            inputs: [
                {
                    name: "asset",
                    type: 16,
                    typeArguments: null,
                },
            ],
            name: "get_fee",
            output: {
                name: "",
                type: 25,
                typeArguments: null,
            },
        },
        {
            inputs: [],
            name: "get_fulfillment_authorities",
            output: {
                name: "",
                type: 1,
                typeArguments: null,
            },
        },
        {
            inputs: [],
            name: "get_num_requests",
            output: {
                name: "",
                type: 25,
                typeArguments: null,
            },
        },
        {
            inputs: [
                {
                    name: "num",
                    type: 25,
                    typeArguments: null,
                },
            ],
            name: "get_request_by_num",
            output: {
                name: "",
                type: 8,
                typeArguments: [
                    {
                        name: "",
                        type: 20,
                        typeArguments: null,
                    },
                ],
            },
        },
        {
            inputs: [
                {
                    name: "seed",
                    type: 4,
                    typeArguments: null,
                },
            ],
            name: "get_request_by_seed",
            output: {
                name: "",
                type: 8,
                typeArguments: [
                    {
                        name: "",
                        type: 20,
                        typeArguments: null,
                    },
                ],
            },
        },
        {
            inputs: [
                {
                    name: "offset",
                    type: 25,
                    typeArguments: null,
                },
            ],
            name: "get_requests",
            output: {
                name: "",
                type: 2,
                typeArguments: null,
            },
        },
        {
            inputs: [
                {
                    name: "seed",
                    type: 4,
                    typeArguments: null,
                },
            ],
            name: "request",
            output: {
                name: "",
                type: 25,
                typeArguments: null,
            },
        },
        {
            inputs: [
                {
                    name: "asset",
                    type: 16,
                    typeArguments: null,
                },
                {
                    name: "amount",
                    type: 25,
                    typeArguments: null,
                },
                {
                    name: "recipient_address",
                    type: 14,
                    typeArguments: null,
                },
            ],
            name: "withdraw_fees",
            output: {
                name: "",
                type: 0,
                typeArguments: null,
            },
        },
    ],
    loggedTypes: [
        {
            logId: 0,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 1,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 2,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 3,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 4,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 5,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 6,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 7,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 8,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 9,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 10,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 11,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 12,
            loggedType: {
                name: "",
                type: 6,
                typeArguments: [],
            },
        },
        {
            logId: 13,
            loggedType: {
                name: "",
                type: 11,
                typeArguments: null,
            },
        },
        {
            logId: 14,
            loggedType: {
                name: "",
                type: 12,
                typeArguments: null,
            },
        },
        {
            logId: 15,
            loggedType: {
                name: "",
                type: 12,
                typeArguments: null,
            },
        },
        {
            logId: 16,
            loggedType: {
                name: "",
                type: 6,
                typeArguments: [],
            },
        },
        {
            logId: 17,
            loggedType: {
                name: "",
                type: 6,
                typeArguments: [],
            },
        },
        {
            logId: 18,
            loggedType: {
                name: "",
                type: 13,
                typeArguments: null,
            },
        },
        {
            logId: 19,
            loggedType: {
                name: "",
                type: 13,
                typeArguments: null,
            },
        },
        {
            logId: 20,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 21,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 22,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 23,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 24,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 25,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 26,
            loggedType: {
                name: "",
                type: 6,
                typeArguments: [],
            },
        },
        {
            logId: 27,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 28,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 29,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
        {
            logId: 30,
            loggedType: {
                name: "",
                type: 5,
                typeArguments: [],
            },
        },
    ],
};
class VrfImplAbi__factory {
    static abi = _abi;
    static createInterface() {
        return new fuels_1.Interface(_abi);
    }
    static connect(id, walletOrProvider) {
        return new fuels_1.Contract(id, _abi, walletOrProvider);
    }
}
exports.VrfImplAbi__factory = VrfImplAbi__factory;
