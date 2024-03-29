/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.77.0
  Forc version: 0.51.1
  Fuel-Core version: 0.22.1
*/

import { Interface, Contract, ContractFactory } from "fuels";
import type { Provider, Account, AbstractAddress, BytesLike, DeployContractOptions, StorageSlot } from "fuels";
import type { VrfImplAbi, VrfImplAbiInterface } from "../VrfImplAbi";

const _abi = {
  "types": [
    {
      "typeId": 0,
      "type": "()",
      "components": [],
      "typeParameters": null
    },
    {
      "typeId": 1,
      "type": "[_; 10]",
      "components": [
        {
          "name": "__array_element",
          "type": 9,
          "typeArguments": [
            {
              "name": "",
              "type": 13,
              "typeArguments": null
            }
          ]
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 2,
      "type": "[_; 24]",
      "components": [
        {
          "name": "__array_element",
          "type": 9,
          "typeArguments": [
            {
              "name": "",
              "type": 20,
              "typeArguments": null
            }
          ]
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 3,
      "type": "[_; 2]",
      "components": [
        {
          "name": "__array_element",
          "type": 5,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 4,
      "type": "[_; 7]",
      "components": [
        {
          "name": "__array_element",
          "type": 13,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 5,
      "type": "b256",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 6,
      "type": "enum Error",
      "components": [
        {
          "name": "ContractNotConfigured",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "AssetNotConfigured",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "NotAuthorized",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "RemainingAssets",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "NonZeroFee",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "ZeroAuthority",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "ZeroFee",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "NoFeePaid",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "WrongFeePaid",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "SeedInUse",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "NoAmountSpecified",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "NotEnoughFunds",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "UnknownRequest",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "InvalidResponse",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "Responded",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "Fulfilled",
          "type": 0,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 7,
      "type": "enum Event",
      "components": [
        {
          "name": "Fulfill",
          "type": 17,
          "typeArguments": null
        },
        {
          "name": "Response",
          "type": 23,
          "typeArguments": null
        },
        {
          "name": "Request",
          "type": 21,
          "typeArguments": null
        },
        {
          "name": "Reset",
          "type": 22,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 8,
      "type": "enum Identity",
      "components": [
        {
          "name": "Address",
          "type": 13,
          "typeArguments": null
        },
        {
          "name": "ContractId",
          "type": 16,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 9,
      "type": "enum Option",
      "components": [
        {
          "name": "None",
          "type": 0,
          "typeArguments": null
        },
        {
          "name": "Some",
          "type": 11,
          "typeArguments": null
        }
      ],
      "typeParameters": [
        11
      ]
    },
    {
      "typeId": 10,
      "type": "enum RandomnessState",
      "components": [
        {
          "name": "Unfulfilled",
          "type": 24,
          "typeArguments": null
        },
        {
          "name": "Fulfilled",
          "type": 18,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 11,
      "type": "generic T",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 12,
      "type": "str",
      "components": null,
      "typeParameters": null
    },
    {
      "typeId": 13,
      "type": "struct Address",
      "components": [
        {
          "name": "value",
          "type": 5,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 14,
      "type": "struct AssetId",
      "components": [
        {
          "name": "value",
          "type": 5,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 15,
      "type": "struct B512",
      "components": [
        {
          "name": "bytes",
          "type": 3,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 16,
      "type": "struct ContractId",
      "components": [
        {
          "name": "value",
          "type": 5,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 17,
      "type": "struct Fulfill",
      "components": [
        {
          "name": "seed",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "randomness",
          "type": 15,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 18,
      "type": "struct Fulfilled",
      "components": [
        {
          "name": "randomness",
          "type": 15,
          "typeArguments": null
        },
        {
          "name": "keys",
          "type": 19,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 19,
      "type": "struct FulfillersKeys",
      "components": [
        {
          "name": "keys",
          "type": 4,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 20,
      "type": "struct Randomness",
      "components": [
        {
          "name": "seed",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "state",
          "type": 10,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 21,
      "type": "struct Request",
      "components": [
        {
          "name": "seed",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "client",
          "type": 8,
          "typeArguments": null
        },
        {
          "name": "no",
          "type": 25,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 22,
      "type": "struct Reset",
      "components": [
        {
          "name": "seed",
          "type": 5,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 23,
      "type": "struct Response",
      "components": [
        {
          "name": "seed",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "authority",
          "type": 13,
          "typeArguments": null
        },
        {
          "name": "randomness",
          "type": 15,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 24,
      "type": "struct Unfulfilled",
      "components": [
        {
          "name": "randomness",
          "type": 15,
          "typeArguments": null
        },
        {
          "name": "keys",
          "type": 19,
          "typeArguments": null
        }
      ],
      "typeParameters": null
    },
    {
      "typeId": 25,
      "type": "u64",
      "components": null,
      "typeParameters": null
    }
  ],
  "functions": [
    {
      "inputs": [
        {
          "name": "authority",
          "type": 8,
          "typeArguments": null
        },
        {
          "name": "fee",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "fulfillment_authorities",
          "type": 1,
          "typeArguments": null
        }
      ],
      "name": "configure",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "asset",
          "type": 14,
          "typeArguments": null
        },
        {
          "name": "fee",
          "type": 25,
          "typeArguments": null
        }
      ],
      "name": "configure_asset",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "seed",
          "type": 5,
          "typeArguments": null
        },
        {
          "name": "signature",
          "type": 15,
          "typeArguments": null
        }
      ],
      "name": "fulfill",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    },
    {
      "inputs": [],
      "name": "get_asset",
      "output": {
        "name": "",
        "type": 14,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [],
      "name": "get_authority",
      "output": {
        "name": "",
        "type": 8,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "asset",
          "type": 14,
          "typeArguments": null
        }
      ],
      "name": "get_balance",
      "output": {
        "name": "",
        "type": 25,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "asset",
          "type": 14,
          "typeArguments": null
        }
      ],
      "name": "get_fee",
      "output": {
        "name": "",
        "type": 25,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [],
      "name": "get_fulfillment_authorities",
      "output": {
        "name": "",
        "type": 1,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [],
      "name": "get_num_requests",
      "output": {
        "name": "",
        "type": 25,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "num",
          "type": 25,
          "typeArguments": null
        }
      ],
      "name": "get_request_by_num",
      "output": {
        "name": "",
        "type": 9,
        "typeArguments": [
          {
            "name": "",
            "type": 20,
            "typeArguments": null
          }
        ]
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "seed",
          "type": 5,
          "typeArguments": null
        }
      ],
      "name": "get_request_by_seed",
      "output": {
        "name": "",
        "type": 9,
        "typeArguments": [
          {
            "name": "",
            "type": 20,
            "typeArguments": null
          }
        ]
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "offset",
          "type": 25,
          "typeArguments": null
        }
      ],
      "name": "get_requests",
      "output": {
        "name": "",
        "type": 2,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "seed",
          "type": 5,
          "typeArguments": null
        }
      ],
      "name": "request",
      "output": {
        "name": "",
        "type": 25,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        },
        {
          "name": "payable",
          "arguments": []
        }
      ]
    },
    {
      "inputs": [
        {
          "name": "asset",
          "type": 14,
          "typeArguments": null
        },
        {
          "name": "amount",
          "type": 25,
          "typeArguments": null
        },
        {
          "name": "recipient_address",
          "type": 13,
          "typeArguments": null
        }
      ],
      "name": "withdraw_fees",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    }
  ],
  "loggedTypes": [
    {
      "logId": 0,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 1,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 2,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 3,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 4,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 5,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 6,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 7,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 8,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 9,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 10,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 11,
      "loggedType": {
        "name": "",
        "type": 7,
        "typeArguments": []
      }
    },
    {
      "logId": 12,
      "loggedType": {
        "name": "",
        "type": 12,
        "typeArguments": null
      }
    },
    {
      "logId": 13,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 14,
      "loggedType": {
        "name": "",
        "type": 7,
        "typeArguments": []
      }
    },
    {
      "logId": 15,
      "loggedType": {
        "name": "",
        "type": 7,
        "typeArguments": []
      }
    },
    {
      "logId": 16,
      "loggedType": {
        "name": "",
        "type": 12,
        "typeArguments": null
      }
    },
    {
      "logId": 17,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 18,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 19,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 20,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 21,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 22,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 23,
      "loggedType": {
        "name": "",
        "type": 7,
        "typeArguments": []
      }
    },
    {
      "logId": 24,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 25,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 26,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    },
    {
      "logId": 27,
      "loggedType": {
        "name": "",
        "type": 6,
        "typeArguments": []
      }
    }
  ],
  "messagesTypes": [],
  "configurables": []
};

const _storageSlots: StorageSlot[] = [
  {
    "key": "7f91d1a929dce734e7f930bbb279ccfccdb5474227502ea8845815c74bd930a7",
    "value": "0000000000000000000000000000000000000000000000000000000000000000"
  },
  {
    "key": "b48b753af346966d0d169c0b2e3234611f65d5cfdb57c7b6e7cd6ca93707bee0",
    "value": "0000000000000000000000000000000000000000000000000000000000000000"
  },
  {
    "key": "f383b0ce51358be57daa3b725fe44acdb2d880604e367199080b4379c41bb6ed",
    "value": "0000000000000000000000000000000000000000000000000000000000000000"
  },
  {
    "key": "f383b0ce51358be57daa3b725fe44acdb2d880604e367199080b4379c41bb6ee",
    "value": "0000000000000000000000000000000000000000000000000000000000000000"
  }
];

export class VrfImplAbi__factory {
  static readonly abi = _abi;

  static readonly storageSlots = _storageSlots;

  static createInterface(): VrfImplAbiInterface {
    return new Interface(_abi) as unknown as VrfImplAbiInterface
  }

  static connect(
    id: string | AbstractAddress,
    accountOrProvider: Account | Provider
  ): VrfImplAbi {
    return new Contract(id, _abi, accountOrProvider) as unknown as VrfImplAbi
  }

  static async deployContract(
    bytecode: BytesLike,
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<VrfImplAbi> {
    const factory = new ContractFactory(bytecode, _abi, wallet);

    const { storageSlots } = VrfImplAbi__factory;

    const contract = await factory.deployContract({
      storageSlots,
      ...options,
    });

    return contract as unknown as VrfImplAbi;
  }
}
