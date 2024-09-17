// mint-erc1155.js
const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require('fs-extra');


async function main() {
  const { PRIVATE_KEY, JSON_RPC_HTTP_ENDPOINT,PROXY_CONTRACT_ADDRESS_2 } =
    process.env;
    const wallet = new ethers.Wallet(PRIVATE_KEY);
    const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_HTTP_ENDPOINT);
    const signer = wallet.connect(provider);

  const contractABI = [
    fs.readFileSync('./artifacts/contracts/ChaiContract.sol/ChaiContract.json')
  ];

  const chaiContract = new ethers.Contract(
    PROXY_CONTRACT_ADDRESS_2,
    JSON.parse(contractABI).abi,
    signer
  );

  // Parameters for minting
  const quantity = 1000; // quantity of tokens to mint
  const teaTokenType = "ApsaraTea"; 

  // Mint the token
  const tx = await chaiContract.mintTokenAdmin(quantity, teaTokenType,{
    gasPrice: ethers.utils.parseUnits('0', 'gwei')
  });
  await tx.wait();

  console.log(`Minted ${quantity} tokens`);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
