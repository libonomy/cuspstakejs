
This library provides supports for libonomy transaction signing and broadcasting. 
## Installation

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

## Import 

#### NodeJS

```js
const cuspstakejs = require("@libonomy/cuspstakejs");
```

## Usage
- Generate address from mnemonic 
```js
const cuspstakejs = require("@libonomy/cuspstakejs");

const chainId = "testnet";
const libonomy = cuspstakejs.network("YOUR_NODE_URL", chainId);

const mnemonic = "YOUR_SEED_PHRASE"
libonomy.setPath("m/44'/118'/0'/0/0"); //hd path for libonomy
const address = libonomy.getAddress(mnemonic);
const ecpairPriv = libonomy.getECPairPriv(mnemonic);
```

Generate ECPairPriv value that is needed for signing signatures
```js
const ecpairPriv = libonomy.getECPairPriv(mnemonic);
```

Transfer LIBOCOIN to designated address. 
* Make sure to input proper type, account number, and sequence of the libonomy account to generate StdSignMsg. You can get those account information on blockchain 
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
libonomy.broadcast(signedTx).then(response => console.log(response));
```

Validate Wallet Address
```js
libonomy.validateAddress("libonomy1da4v3fxy3xkkgqr5g60cjmcpvjcjdd5e4m0qwa")

```
 Wallet Address Balance
```js
libonomy.getAddressBalance("libonomy1da4v3fxy3xkkgqr5g60cjmcpvjcjdd5e4m0qwa")

```

## Documentation

This library is simple and easy to use. We don't have any formal documentation yet other than examples. Ask for help if our examples aren't enough to guide you