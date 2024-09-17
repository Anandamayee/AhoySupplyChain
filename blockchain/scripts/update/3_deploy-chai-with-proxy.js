const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require('fs-extra');

async function main() {
  const { JSON_RPC_HTTP_ENDPOINT,PRIVATE_KEY,CHAI_CONTRACT_ADDRESS,PROXY_CONTRACT_ADDRESS_2 } =
  process.env;
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_HTTP_ENDPOINT);
  const signer = wallet.connect(provider);

  const contractABI = [
    fs.readFileSync('./artifacts/contracts/proxy/ProxyImp.sol/ProxyImp.json')
  ];

  const proxyContract1 = new ethers.Contract(
    PROXY_CONTRACT_ADDRESS_2,
    JSON.parse(contractABI).abi,
    signer
  );

  //Set Implementation
  const tx = await proxyContract1.setImplementation(CHAI_CONTRACT_ADDRESS,{
    gasPrice: ethers.utils.parseUnits('0', 'gwei')
  });
  await tx.wait();

  console.log(`Chai ontract Upgraded with proxy on respective version`);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
