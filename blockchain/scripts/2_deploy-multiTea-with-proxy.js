const { ethers,network } = require("hardhat");
require("dotenv").config();
const fs = require('fs-extra');

async function main() {
  const { PRIVATE_KEY, JSON_RPC_HTTP_ENDPOINT,PROXY_CONTRACT_ADDRESS_1,MULTI_TEA_CONTRACT_ADDRESS } =
    process.env;
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_HTTP_ENDPOINT);
  const signer = wallet.connect(provider);

  ;
 
  console.log(`Address deploying the contract ==> ${signer}`);

  const contractABI = 
    fs.readFileSync('./artifacts/contracts/proxy/ProxyImp.sol/ProxyImp.json')
  ;

  const proxyContract1 = new ethers.Contract(
    PROXY_CONTRACT_ADDRESS_1,
    JSON.parse(contractABI).abi,
    signer
  );

  //Set Implementation
  const tx = await proxyContract1.setImplementation(MULTI_TEA_CONTRACT_ADDRESS,{
    gasPrice: ethers.utils.parseUnits('0', 'gwei')
  });
  await tx.wait();

  console.log(`MultiTeaContract Upgraded with proxy on respective version`);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});
