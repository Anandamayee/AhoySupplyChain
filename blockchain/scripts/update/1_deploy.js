const hre = require("hardhat");

async function main() {

  const MultiTeaContract = await hre.ethers.getContractFactory("MultiTeaContract");
  const multiTeaContract = await MultiTeaContract.deploy();

  await multiTeaContract.deployed();
  console.log("MULTI_TEA_CONTRACT_ADDRESS ::: ", multiTeaContract.address);
  process.env.MULTI_TEA_CONTRACT_ADDRESS = multiTeaContract.address

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