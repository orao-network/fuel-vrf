/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.77.0
  Forc version: 0.51.1
  Fuel-Core version: 0.22.1
*/

import type {
  BigNumberish,
  BN,
  BytesLike,
  Contract,
  DecodedValue,
  FunctionFragment,
  Interface,
  InvokeFunction,
} from 'fuels';

import type { Option, Enum } from "./common";

export enum ErrorInput { ContractNotConfigured = 'ContractNotConfigured', AssetNotConfigured = 'AssetNotConfigured', NotAuthorized = 'NotAuthorized', RemainingAssets = 'RemainingAssets', NonZeroFee = 'NonZeroFee', ZeroAuthority = 'ZeroAuthority', ZeroFee = 'ZeroFee', NoFeePaid = 'NoFeePaid', WrongFeePaid = 'WrongFeePaid', SeedInUse = 'SeedInUse', NoAmountSpecified = 'NoAmountSpecified', NotEnoughFunds = 'NotEnoughFunds', UnknownRequest = 'UnknownRequest', InvalidResponse = 'InvalidResponse', Responded = 'Responded', Fulfilled = 'Fulfilled' }
export enum ErrorOutput { ContractNotConfigured = 'ContractNotConfigured', AssetNotConfigured = 'AssetNotConfigured', NotAuthorized = 'NotAuthorized', RemainingAssets = 'RemainingAssets', NonZeroFee = 'NonZeroFee', ZeroAuthority = 'ZeroAuthority', ZeroFee = 'ZeroFee', NoFeePaid = 'NoFeePaid', WrongFeePaid = 'WrongFeePaid', SeedInUse = 'SeedInUse', NoAmountSpecified = 'NoAmountSpecified', NotEnoughFunds = 'NotEnoughFunds', UnknownRequest = 'UnknownRequest', InvalidResponse = 'InvalidResponse', Responded = 'Responded', Fulfilled = 'Fulfilled' }
export type EventInput = Enum<{ Fulfill: FulfillInput, Response: ResponseInput, Request: RequestInput, Reset: ResetInput }>;
export type EventOutput = Enum<{ Fulfill: FulfillOutput, Response: ResponseOutput, Request: RequestOutput, Reset: ResetOutput }>;
export type IdentityInput = Enum<{ Address: AddressInput, ContractId: ContractIdInput }>;
export type IdentityOutput = Enum<{ Address: AddressOutput, ContractId: ContractIdOutput }>;
export type RandomnessStateInput = Enum<{ Unfulfilled: UnfulfilledInput, Fulfilled: FulfilledInput }>;
export type RandomnessStateOutput = Enum<{ Unfulfilled: UnfulfilledOutput, Fulfilled: FulfilledOutput }>;

export type AddressInput = { value: string };
export type AddressOutput = AddressInput;
export type AssetIdInput = { value: string };
export type AssetIdOutput = AssetIdInput;
export type ContractIdInput = { value: string };
export type ContractIdOutput = ContractIdInput;
export type FulfillInput = { seed: string, randomness: string };
export type FulfillOutput = FulfillInput;
export type FulfilledInput = { randomness: string, keys: FulfillersKeysInput };
export type FulfilledOutput = { randomness: string, keys: FulfillersKeysOutput };
export type FulfillersKeysInput = { keys: [AddressInput, AddressInput, AddressInput, AddressInput, AddressInput, AddressInput, AddressInput] };
export type FulfillersKeysOutput = { keys: [AddressOutput, AddressOutput, AddressOutput, AddressOutput, AddressOutput, AddressOutput, AddressOutput] };
export type RandomnessInput = { seed: string, state: RandomnessStateInput };
export type RandomnessOutput = { seed: string, state: RandomnessStateOutput };
export type RequestInput = { seed: string, client: IdentityInput, no: BigNumberish };
export type RequestOutput = { seed: string, client: IdentityOutput, no: BN };
export type ResetInput = { seed: string };
export type ResetOutput = ResetInput;
export type ResponseInput = { seed: string, authority: AddressInput, randomness: string };
export type ResponseOutput = { seed: string, authority: AddressOutput, randomness: string };
export type UnfulfilledInput = { randomness: string, keys: FulfillersKeysInput };
export type UnfulfilledOutput = { randomness: string, keys: FulfillersKeysOutput };

interface VrfImplAbiInterface extends Interface {
  functions: {
    configure: FunctionFragment;
    configure_asset: FunctionFragment;
    fulfill: FunctionFragment;
    get_asset: FunctionFragment;
    get_authority: FunctionFragment;
    get_balance: FunctionFragment;
    get_fee: FunctionFragment;
    get_fulfillment_authorities: FunctionFragment;
    get_num_requests: FunctionFragment;
    get_request_by_num: FunctionFragment;
    get_request_by_seed: FunctionFragment;
    get_requests: FunctionFragment;
    request: FunctionFragment;
    withdraw_fees: FunctionFragment;
  };

  encodeFunctionData(functionFragment: 'configure', values: [IdentityInput, BigNumberish, [Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>]]): Uint8Array;
  encodeFunctionData(functionFragment: 'configure_asset', values: [AssetIdInput, BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'fulfill', values: [string, string]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_asset', values: []): Uint8Array;
  encodeFunctionData(functionFragment: 'get_authority', values: []): Uint8Array;
  encodeFunctionData(functionFragment: 'get_balance', values: [AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_fee', values: [AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_fulfillment_authorities', values: []): Uint8Array;
  encodeFunctionData(functionFragment: 'get_num_requests', values: []): Uint8Array;
  encodeFunctionData(functionFragment: 'get_request_by_num', values: [BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_request_by_seed', values: [string]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_requests', values: [BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'request', values: [string]): Uint8Array;
  encodeFunctionData(functionFragment: 'withdraw_fees', values: [AssetIdInput, BigNumberish, AddressInput]): Uint8Array;

  decodeFunctionData(functionFragment: 'configure', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'configure_asset', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'fulfill', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_asset', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_authority', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_balance', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_fee', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_fulfillment_authorities', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_num_requests', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_request_by_num', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_request_by_seed', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_requests', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'request', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'withdraw_fees', data: BytesLike): DecodedValue;
}

export class VrfImplAbi extends Contract {
  interface: VrfImplAbiInterface;
  functions: {
    configure: InvokeFunction<[authority: IdentityInput, fee: BigNumberish, fulfillment_authorities: [Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>, Option<AddressInput>]], void>;
    configure_asset: InvokeFunction<[asset: AssetIdInput, fee: BigNumberish], void>;
    fulfill: InvokeFunction<[seed: string, signature: string], void>;
    get_asset: InvokeFunction<[], AssetIdOutput>;
    get_authority: InvokeFunction<[], IdentityOutput>;
    get_balance: InvokeFunction<[asset: AssetIdInput], BN>;
    get_fee: InvokeFunction<[asset: AssetIdInput], BN>;
    get_fulfillment_authorities: InvokeFunction<[], [Option<AddressOutput>, Option<AddressOutput>, Option<AddressOutput>, Option<AddressOutput>, Option<AddressOutput>, Option<AddressOutput>, Option<AddressOutput>, Option<AddressOutput>, Option<AddressOutput>, Option<AddressOutput>]>;
    get_num_requests: InvokeFunction<[], BN>;
    get_request_by_num: InvokeFunction<[num: BigNumberish], Option<RandomnessOutput>>;
    get_request_by_seed: InvokeFunction<[seed: string], Option<RandomnessOutput>>;
    get_requests: InvokeFunction<[offset: BigNumberish], [Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>, Option<RandomnessOutput>]>;
    request: InvokeFunction<[seed: string], BN>;
    withdraw_fees: InvokeFunction<[asset: AssetIdInput, amount: BigNumberish, recipient_address: AddressInput], void>;
  };
}
