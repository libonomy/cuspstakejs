const assert = require('assert');
const cuspstakejs = require("../src");

const mnemonic = "swear buyer security impulse public stereo peasant correct cross tornado bid discover anchor float venture deal patch property cool wreck eight dwarf december surface";

describe("Libonomycluster", function() {
	const chainId = "testnet";
	const libonomy = cuspstakejs.network("https://lcd-cosmos-free.cosmostation.io", chainId);
	describe("getAddress", function () {

		it("gets a libonomy address from mnemonic", function () {
			let address = libonomy.getAddress(mnemonic);
			assert.strictEqual(address, "libonomy1fnk3lxlks7tdg6x55ynv6vggtnd73ycqun3rf4");
		});
	});
	
	describe("sign", function () {
		it("creates a deterministic signature", function () {
			let address = libonomy.getAddress(mnemonic);
			let ecpairPriv = libonomy.getECPairPriv(mnemonic);
	
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
				account_number: String(5711),
				sequence: String(4)
			});
	
			let signedTx = libonomy.sign(stdSignMsg, ecpairPriv);
	
			assert.strictEqual(signedTx.tx.signatures[0].signature, "T5j0wjfOQp0rK+2Pz8CDxiElw97b1UXOdOJ8y0QjZcJ9KQTW0HLOOwX2/iamllgNwDd+mW2Px+QRNc2SlLoBYQ==");
		});
	});
});



