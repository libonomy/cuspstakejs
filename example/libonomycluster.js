const cuspstakejs = require("../src");

// [WARNING] This mnemonic is just for the demo purpose. DO NOT USE THIS MNEMONIC for your own wallet.
const mnemonic = "swear buyer security impulse public stereo peasant correct cross tornado bid discover anchor float venture deal patch property cool wreck eight dwarf december surface";
const chainId = "testnet";
// This rest server URL may be disabled at any time. In order to maintain stable blockchain service, it is recommended to prepare your rest server.
const libonomy = cuspstakejs.network("https://lcd-cosmos-free.cosmostation.io", chainId);
libonomy.setBech32MainPrefix("libonomy");
libonomy.setPath("m/44'/118'/0'/0/0");
const address = libonomy.getAddress(mnemonic);
const ecpairPriv = libonomy.getECPairPriv(mnemonic);

// Generate MsgSend transaction and broadcast 
libonomy.getAccounts(address).then(data => {
	let stdSignMsg = libonomy.newStdMsg({
		msgs: [
			{
				type: "cusp-sdk/MsgSend",
				value: {
					amount: [
						{
							amount: String(100000), 	// 6 decimal places (1000000 libocoin = 1 LIBOCOIN)
							denom: "libocoin"
						}
					],
					from_address: address,
					to_address: "libonomy18vhdczjut44gpsy804crfhnd5nq003nz0nf20v"
				}
			}
		],
		chain_id: chainId,
		fee: { amount: [ { amount: String(5000), denom: "libocoin" } ], gas: String(200000) },
		memo: "",
		account_number: String(data.result.value.account_number),
		sequence: String(data.result.value.sequence)
	});

	const signedTx = libonomy.sign(stdSignMsg, ecpairPriv);
	libonomy.broadcast(signedTx).then(response => console.log(response));
})