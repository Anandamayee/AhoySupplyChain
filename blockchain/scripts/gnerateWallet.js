// wallet-generation.js
const ethers = require("ethers");
require("dotenv").config();

async function main() {
  const randomMnemonic = ethers.Wallet.createRandom().mnemonic;
  const wallet = ethers.Wallet.fromMnemonic(randomMnemonic.phrase);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});