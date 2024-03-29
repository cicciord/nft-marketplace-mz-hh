// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

async function deployAIOBlockchainLabMarketplace() {
  const AIOBlockchainLabMarketplace = await ethers.deployContract("AIOBlockchainLabMarketplace");

  await AIOBlockchainLabMarketplace.waitForDeployment();

  console.log(`AIOBlockchainLabMarketplace deployed to ${AIOBlockchainLabMarketplace.target}`);
}

module.exports = {
  deployAIOBlockchainLabMarketplace,
};
