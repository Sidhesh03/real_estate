import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Ignition module for PropertyNFT deployment
// The deployer address is automatically set to the first signer
// Run: npx hardhat ignition deploy ./ignition/modules/PropertyNFT.js --network ganache
const PropertyNFTModule = buildModule("PropertyNFTModule", (m) => {
  // Get the deployer's address (first account from Ganache)
  const deployer = m.getAccount(0);

  // Deploy PropertyNFT contract, passing deployer as the initial owner
  const propertyNFT = m.contract("PropertyNFT", [deployer]);

  return { propertyNFT };
});

export default PropertyNFTModule;
