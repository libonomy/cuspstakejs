const cuspstakejs = require("../src");

// [WARNING] This mnemonic is just for the demo purpose. DO NOT USE THIS MNEMONIC for your own wallet.
const mnemonic = "swear buyer security impulse public stereo peasant correct cross tornado bid discover anchor float venture deal patch property cool wreck eight dwarf december surface";
const chainId = "testnet-01";
// This rest server URL may be disabled at any time. In order to maintain stable blockchain service, it is recommended to prepare your rest server.
const libonomy = cuspstakejs.network("http://127.0.0.1:1317", chainId);
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
							amount: String(100), 	// 6 decimal places ( 1 LBY = 1000000flby)
							denom: "flby"           // coin denomination is flby
						}
					],
					from_address: address,
					to_address: "libonomy1da4v3fxy3xkkgqr5g60cjmcpvjcjdd5e4m0qwa"
				}
			}
		],
		chain_id: chainId,
		fee: { amount: [ { amount: String(20000), denom: "flby" } ], gas: String(200000) },
		memo: "MY_LIB_TEST_MEMO",
		account_number: String(data.result.value.account_number),
		sequence: String(data.result.value.sequence)
	});

	const signedTx = libonomy.sign(stdSignMsg, ecpairPriv);
	libonomy.broadcast(signedTx).then(response => console.log(response));
})