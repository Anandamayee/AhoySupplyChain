//This file will be executed once at the time of initial deployment
const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require('fs-extra');

async function main() {
  const { JSON_RPC_HTTP_ENDPOINT,PRIVATE_KEY,PROXY_CONTRACT_ADDRESS_1,PROXY_CONTRACT_ADDRESS_2 } =
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

  //Initialize Contract once
  const tx = await chaiContract._initialize(PROXY_CONTRACT_ADDRESS_1,{
    gasPrice: ethers.utils.parseUnits('0', 'gwei')
  });
  await tx.wait();

  console.log(`Chai Contract Initialized`);

}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
