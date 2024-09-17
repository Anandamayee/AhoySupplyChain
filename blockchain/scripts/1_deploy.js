const hre = require("hardhat");

async function main() {

  const ProxyContract1 = await hre.ethers.getContractFactory("ProxyImp");
  const proxyContract1 = await ProxyContract1.deploy();

  await proxyContract1.deployed();
  console.log("PROXY_CONTRACT_ADDRESS_1 ::: ", proxyContract1.address);
  process.env.PROXY_CONTRACT_ADDRESS_1 = proxyContract1.address

  const MultiTeaContract = await hre.ethers.getContractFactory("MultiTeaContract");
  const multiTeaContract = await MultiTeaContract.deploy();

  await multiTeaContract.deployed();
  console.log("MULTI_TEA_CONTRACT_ADDRESS ::: ", multiTeaContract.address);
  process.env.MULTI_TEA_CONTRACT_ADDRESS = multiTeaContract.address

  const ProxyContract2 = await hre.ethers.getContractFactory("ProxyImp");
  const proxyContract2 = await ProxyContract2.deploy();

  await proxyContract2.deployed();
  console.log("PROXY_CONTRACT_ADDRESS_2 ::: ", proxyContract2.address);
  process.env.PROXY_CONTRACT_ADDRESS_2 = proxyContract2.address

  const ChaiContract = await hre.ethers.getContractFactory("ChaiContract");
  const chaiContract = await ChaiContract.deploy();

  await chaiContract.deployed();
  console.log("CHAI_CONTRACT_ADDRESS ::: ", chaiContract.address);
  process.env.CHAI_CONTRACT_ADDRESS = chaiContract.address


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});