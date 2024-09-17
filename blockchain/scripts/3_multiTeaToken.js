//This file will be executed once at the time of initial deployment
const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require('fs-extra');

async function main() {
  const { JSON_RPC_HTTP_ENDPOINT,PRIVATE_KEY,PROXY_CONTRACT_ADDRESS_1 } =
    process.env;
    const wallet = new ethers.Wallet(PRIVATE_KEY);
    const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_HTTP_ENDPOINT);
    const signer = wallet.connect(provider);

  const contractABI = [
    fs.readFileSync('./artifacts/contracts/MultiTeaContract.sol/MultiTeaContract.json')
  ];

  const multiTeaContract = new ethers.Contract(
    PROXY_CONTRACT_ADDRESS_1,
    JSON.parse(contractABI).abi,
    signer
  );

  //Initialize Contract once
  const tx = await multiTeaContract._initialize({
    gasPrice: ethers.utils.parseUnits('0', 'gwei')
  });
  await tx.wait();

  console.log(`MultiTea Contract Initialized`);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
