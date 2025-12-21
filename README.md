<br />
<p align="center">
  <h3 align="center">CuspstakeJS</h3>

NPM library for javascript functionalities and interaction with libonomy SDK.

<b>Halt Status:</b> In-production: Libonomy Mainnet.

</p>

## Getting Started (Developer Setup)

Use this section when working with the library source code directly.

###  Prerequisites

Make sure you have the following installed:

- **Node.js**

  Install Node.js from:

  ```sh
  https://nodejs.org/en/
  ```

  ⚠️ **Supported Node.js version:** `16.x`

- **npm** (comes with Node.js)

  Update npm to the latest version:

  ```sh
  npm install -g npm@latest
  ```

### Installation(Local Development)

1. **Clone the repository**

2. **Navigate to the project directory**

3. **Install dependencies**

```sh
npm install
```

If dependency issues occur, you may use:

```sh
npm install --force
```

⚠️ Use `--force` only if necessary, as it may install incompatible versions.

### Publishing (Optional)

This library is already published on NPM as @libonomy/cuspstakejs. Do not need to publish it unless making official releases.


## Installation(Usage)

###  Prerequisites

In order to fully use this library, you need to run a local or remote full node and set up its rest server.

### NPM

```bash
npm install @libonomy/cuspstakejs
```

### Yarn

```bash
yarn add @libonomy/cuspstakejs
```

### Browser Support

This version does not support browsers

### Importing the library

#### NodeJS

```js
const cuspstakejs = require("@libonomy/cuspstakejs");
```

### Usage

- Generate address from mnemonic

```js
const cuspstakejs = require("@libonomy/cuspstakejs");

const chainId = "testnet";
const libonomy = cuspstakejs.network("YOUR_NODE_URL", chainId);

const mnemonic = "YOUR_SEED_PHRASE";
libonomy.setPath("m/44'/118'/0'/0/0"); //hd path for libonomy
const address = libonomy.getAddress(mnemonic);
const ecpairPriv = libonomy.getECPairPriv(mnemonic);
```

Generate ECPairPriv value that is needed for signing signatures

```js
const ecpairPriv = libonomy.getECPairPriv(mnemonic);
```

Transfer LIBOCOIN to designated address.

- Make sure to input proper type, account number, and sequence of the libonomy account to generate StdSignMsg. You can get those account information on blockchain

```js
libonomy.getAccounts(address).then(data => {
	let stdSignMsg = libonomy.newStdMsg({
		msgs: [
			{
				type: "cusp-sdk/MsgSend",
				value: {
					amount: [
						{
							amount: String(100), 	// 6 decimal places ( 1 LBY = 1000000flby)
							denom: "flby"           // coin denomination is flby
						}
					],
					from_address: address,
					to_address: "libonomy18vhdczjut44gpsy804crfhnd5nq003nz0nf20v"
				}
			}
		],
		chain_id: chainId,
		fee: { amount: [ { amount: String(20000), denom: "flby" } ], gas: String(200000) },
		memo: "MY_LIB_TEST_MEMO",
		account_number: String(data.result.value.account_number),
		sequence: String(data.result.value.sequence)
	});

	...
})
```

Sign transaction by using stdSignMsg and broadcast by using [/txs](https://YOUR_NODE_URL/txs) REST API

```js
const signedTx = libonomy.sign(stdSignMsg, ecpairPriv);
libonomy.broadcast(signedTx).then((response) => console.log(response));
```

Validate Wallet Address

```js
libonomy.validateAddress("libonomy1da4v3fxy3xkkgqr5g60cjmcpvjcjdd5e4m0qwa");
```

Wallet Address Balance

```js
libonomy.getAddressBalance("libonomy1da4v3fxy3xkkgqr5g60cjmcpvjcjdd5e4m0qwa");
```

Create New Account

```js
libonomy.createAccount(length);

Note: You can pass mnemonics length as an argument in this function 12 or 24.
```

Restore Account with 12 or 24 Mnemonics

```js
libonomy.restoreAccountWithMnemonics(mnemonics);
```

Convert hex adress to libonomy bech32 address

```js
libonomy.hextoBech32('0x4CEd1f9BF68796D468d4a126cD31085CdBe89300');

Note: Address should be in hex format.

```

Convert libonomy bech32 adress to hex address

```js
libonomy.bech32toHex('libonomy1fnk3lxlks7tdg6x55ynv6vggtnd73ycqun3rf4');

Note: Address should be in libonomy bech32 format.

```

### Documentation

This library is simple and easy to use. We don't have any formal documentation yet other than examples.

```
Copyright © 2025 — Libonomy
```


