require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
const { ethers } = require("ethers");
const fs = require("fs");

const { JSON_RPC_HTTP_ENDPOINT , PRIVATE_KEY } =
  process.env;

module.exports = {
  networks: {
    besuWallet: {
      gasPrice: 0,
      gas: 0x1ffffffffffffe,
      url: JSON_RPC_HTTP_ENDPOINT,
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: {
    version: "0.8.26",
    evmVersion: "london",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
      viaIR: true,
    },
  },
};
