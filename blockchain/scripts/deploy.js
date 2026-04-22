// Hardhat 3 ESM deploy script — no hre.ethers, direct ethers usage
// Run: npx hardhat run scripts/deploy.js --network ganache

import { ethers } from "ethers";
import { readFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Load the compiled artifact
const artifact = JSON.parse(
  readFileSync(
    new URL("../artifacts/contracts/PropertyNFT.sol/PropertyNFT.json", import.meta.url)
  )
);

async function main() {
  // Connect to Ganache directly via JSON-RPC
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
  const accounts = await provider.listAccounts();
  const deployer = await provider.getSigner(0);

  console.log("Deploying with account:", await deployer.getAddress());

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("-----------------------------------------------------");
  console.log("PropertyNFT deployed to:", address);
  console.log("Paste this into frontend/src/config/contractConfig.js");
  console.log("-----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
