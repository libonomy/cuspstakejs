const assert = require("assert");
const cuspstakejs = require("../src");
const length = 12;
const mnemonic =
  "swear buyer security impulse public stereo peasant correct cross tornado bid discover anchor float venture deal patch property cool wreck eight dwarf december surface";
const hexAddress = "0x4CEd1f9BF68796D468d4a126cD31085CdBe89300";

const accountMock = {
  mnemonic,
  address: "libonomy1fnk3lxlks7tdg6x55ynv6vggtnd73ycqun3rf4",
  privateKey:
    "77943a16107af10afcb5fb07fd94e36508f680d07982a209d2cecf32e2b7b8ea",
  publicKey:
    "04f10d4579a3bfbd142afbf2ab36f02d6ec427cb8fbad65ebb00b77abbb4c34ca83d1827092c5dc8274f7e9cc5d97c2855a5d8345024c70894740cbafeb4dbc0a6",
};

describe("Libonomycluster", function () {
  const chainId = "testnet";
  const libonomy = cuspstakejs.network("http://127.0.0.1:1317/", chainId);
  describe("getAddress", function () {
    it("gets a libonomy address from mnemonic", function () {
      let address = libonomy.getAddress(mnemonic);
      assert.strictEqual(
        address,
        "libonomy1fnk3lxlks7tdg6x55ynv6vggtnd73ycqun3rf4"
      );
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
                  amount: String(100000), // 6 decimal places (1000000 flby = 1 LBY)
                  denom: "flby",
                },
              ],
              from_address: address,
              to_address: "libonomy18vhdczjut44gpsy804crfhnd5nq003nz0nf20v",
            },
          },
        ],
        chain_id: chainId,
        fee: {
          amount: [{ amount: String(5000), denom: "flby" }],
          gas: String(200000),
        },
        memo: "",
        account_number: String(5711),
        sequence: String(4),
      });

      let signedTx = libonomy.sign(stdSignMsg, ecpairPriv);

      assert.strictEqual(
        signedTx.tx.signatures[0].signature,
        "Cu66NfqHjo8WNJelpm4YOSiJC6G1z4jlo+tyM4EmpB1JopmJa8YyTvZrYB4nJTxydmvmkZK7pFe+sUQhpl92Tg=="
      );
    });
  });

  describe("create account", function () {
    it("create new account with 12 or 24 words menomics", function () {
      const createdAccount = libonomy.createAccount(length);
      const createdAccountWithMnemonics = libonomy.restoreAccountWithMnemonics(
        createdAccount.mnemonic
      );
      assert.deepStrictEqual(createdAccount, createdAccountWithMnemonics);
    });
  });

  describe("restore account", function () {
    it("restore account with 12 or 24 words mnemonics", function () {
      const createdAccount = libonomy.restoreAccountWithMnemonics(mnemonic);
      assert.deepEqual(accountMock, createdAccount);
    });
  });

  describe("Address conversion", function () {
    it("convert address from bech32 to hex", function () {
      const generatedHexAddress = libonomy.bech32toHex(accountMock.address);
      assert.deepEqual(generatedHexAddress, hexAddress);
    });
    it("convert address from hex to bech32", function () {
      const generatedBechAddress = libonomy.hextoBech32(hexAddress);
      assert.deepEqual(generatedBechAddress, accountMock.address);
    });
  });
});
