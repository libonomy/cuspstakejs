/*
    Developed / Developing by libonomy , motivated from cosmostation
    [WARNING] cuspstakejs is under ACTIVE DEVELOPMENT and should be treated as alpha version. We will remove this warning when we have a release that is stable, secure, and propoerly tested.
*/

"use strict";

global.fetch || (global.fetch = require("node-fetch").default);
const bip39 = require("bip39");
const bip32 = require("bip32");
const { bech32 } = require("bech32");
const secp256k1 = require("secp256k1");
const crypto = require("crypto");
const bitcoinjs = require("bitcoinjs-lib");
const converter = require("./utils/addressConversion");

let Libonomy = function (url, chainId) {
  this.url = url;
  this.chainId = chainId;
  this.path = "m/44'/118'/0'/0/0";
  this.bech32MainPrefix = "libonomy";

  if (!this.url) {
    throw new Error("url object was not set or invalid");
  }
  if (!this.chainId) {
    throw new Error("chainId object was not set or invalid");
  }
};

function network(url, chainId) {
  return new Libonomy(url, chainId);
}

function convertStringToBytes(str) {
  if (typeof str !== "string") {
    throw new Error("str expects a string");
  }
  var myBuffer = [];
  var buffer = Buffer.from(str, "utf8");
  for (var i = 0; i < buffer.length; i++) {
    myBuffer.push(buffer[i]);
  }
  return myBuffer;
}

function getPubKeyBase64(ecpairPriv) {
  const pubKeyByte = secp256k1.publicKeyCreate(ecpairPriv);
  return Buffer.from(pubKeyByte, "binary").toString("base64");
}

function sortObject(obj) {
  if (obj === null) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  const sortedKeys = Object.keys(obj).sort();
  const result = {};
  sortedKeys.forEach((key) => {
    result[key] = sortObject(obj[key]);
  });
  return result;
}

Libonomy.prototype.setBech32MainPrefix = function (bech32MainPrefix) {
  this.bech32MainPrefix = bech32MainPrefix;

  if (!this.bech32MainPrefix) {
    throw new Error("bech32MainPrefix object was not set or invalid");
  }
};

Libonomy.prototype.setPath = function (path) {
  this.path = path;

  if (!this.path) {
    throw new Error("path object was not set or invalid");
  }
};

Libonomy.prototype.getAccounts = function (address) {
  let accountsApi = "";

  accountsApi = "/auth/accounts/";

  return fetch(this.url + accountsApi + address).then((response) =>
    response.json()
  );
};

Libonomy.prototype.getAddress = function (mnemonic, checkSum = true) {
  if (typeof mnemonic !== "string") {
    throw new Error("mnemonic expects a string");
  }
  const seed = bip39.mnemonicToSeed(mnemonic);
  const node = bip32.fromSeed(seed);
  const child = node.derivePath(this.path);
  const words = bech32.toWords(child.identifier);
  return bech32.encode(this.bech32MainPrefix, words);
};

Libonomy.prototype.getECPairPriv = function (mnemonic) {
  if (typeof mnemonic !== "string") {
    throw new Error("mnemonic expects a string");
  }
  const seed = bip39.mnemonicToSeed(mnemonic);
  const node = bip32.fromSeed(seed);
  const child = node.derivePath(this.path);
  const ecpair = bitcoinjs.ECPair.fromPrivateKey(child.privateKey, {
    compressed: false,
  });

  return ecpair.privateKey;
};

Libonomy.prototype.getECPairPublic = function (mnemonic) {
  if (typeof mnemonic !== "string") {
    throw new Error("mnemonic expects a string");
  }
  const seed = bip39.mnemonicToSeed(mnemonic);
  const node = bip32.fromSeed(seed);
  const child = node.derivePath(this.path);
  const ecpair = bitcoinjs.ECPair.fromPublicKey(child.publicKey, {
    compressed: false,
  });

  return ecpair.publicKey;
};

Libonomy.prototype.newStdMsg = function (input) {
  const stdSignMsg = new Object();
  stdSignMsg.json = input;

  stdSignMsg.bytes = convertStringToBytes(
    JSON.stringify(sortObject(stdSignMsg.json))
  );
  return stdSignMsg;
};

Libonomy.prototype.sign = function (stdSignMsg, ecpairPriv, modeType = "sync") {
  // The supported return types includes "block"(return after tx commit), "sync"(return after CheckTx) and "async"(return right away).
  let signMessage = new Object();

  signMessage = stdSignMsg.json;
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(sortObject(signMessage)))
    .digest("hex");
  const buf = Buffer.from(hash, "hex");
  let signObj = secp256k1.sign(buf, ecpairPriv);
  var signatureBase64 = Buffer.from(signObj.signature, "binary").toString(
    "base64"
  );
  let signedTx = new Object();

  signedTx = {
    tx: {
      msg: stdSignMsg.json.msgs,
      fee: stdSignMsg.json.fee,
      signatures: [
        {
          account_number: stdSignMsg.json.account_number,
          sequence: stdSignMsg.json.sequence,
          signature: signatureBase64,
          pub_key: {
            type: "aphelion/PubKeySecp256k1",
            value: getPubKeyBase64(ecpairPriv),
          },
        },
      ],
      memo: stdSignMsg.json.memo,
    },
    mode: modeType,
  };

  return signedTx;
};

Libonomy.prototype.broadcast = function (signedTx) {
  let broadcastApi = "";

  broadcastApi = "/txs";

  return fetch(this.url + broadcastApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signedTx),
  }).then((response) => response.json());
};
Libonomy.prototype.validateAddress = (address) => {
  let decoded;

  try {
    decoded = bech32.decode(address);
  } catch (error) {
    return {
      bech32: false,
      message: "Invalid Address !",
    };
  }

  const prefixesNetwork = {
    libonomy: "libonomy",
  };
  const prefix = prefixesNetwork[decoded.prefix];

  if (prefix === undefined) {
    return {
      bech32: false,
      message: "Invalid Address. Prefix not present !",
    };
  }
  // const witnessVersion = decoded.words[0];

  // if (witnessVersion < 0 || witnessVersion > 16) {
  //     return {
  // 		bech32: false,
  // 		message:"Invalid Address !"
  // 	  };
  // }

  return {
    bech32: true,
    message: "Valid Address !",
    prefix,
    address,
  };
};
Libonomy.prototype.getAddressBalance = function (address) {
  if (typeof address !== "string") {
    throw new Error("address expects a string");
  }
  if (address) {
    if (!this.validateAddress(address)) throw new Error("Invalid Address !");
  }

  let balanceApi = `/bank/balances/${address}`;

  return fetch(this.url + balanceApi, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    let balanceModel = await response.json();
    if (balanceModel.result.length == 0) return [{ denom: "", amount: "0" }];
    else return balanceModel.result;
  });
};

Libonomy.prototype.createAccount = function (length) {
  const phraseLength = parseInt(length);

  if (phraseLength !== 12 && phraseLength !== 24) {
    throw new Error("Invalid length only 12 or 24 menmonics are allowed.");
  }
  let mnemonic = bip39.generateMnemonic((phraseLength / 12) * 128);
  const address = this.getAddress(mnemonic);
  const privateKey = this.getECPairPriv(mnemonic).toString("hex");
  const publicKey = this.getECPairPublic(mnemonic).toString("hex");
  return {
    mnemonic: mnemonic,
    address: address,
    privateKey: privateKey,
    publicKey: publicKey,
  };
};

Libonomy.prototype.restoreAccountWithMnemonics = function (mnemonic) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("mnemonic phrase is not valid");
  }

  const address = this.getAddress(mnemonic);
  const privateKey = this.getECPairPriv(mnemonic).toString("hex");
  const publicKey = this.getECPairPublic(mnemonic).toString("hex");
  return {
    mnemonic: mnemonic,
    address: address,
    privateKey: privateKey,
    publicKey: publicKey,
  };
};

Libonomy.prototype.hextoBech32 = function (address) {
  const bechAddress = converter("libonomy").toBech32(address);
  return bechAddress;
};

Libonomy.prototype.bech32toHex = function (address) {
  if (!this.validateAddress(address).bech32) {
    throw new Error("Invalid bech32 address");
  }
  const hexAddress = converter("libonomy").toHex(address);
  return hexAddress;
};

module.exports = {
  network,
};
