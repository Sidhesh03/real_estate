// ============================================================
// CONTRACT CONFIGURATION
// ============================================================
// STEP 1: After deploying your contract with Hardhat, paste the
//         deployed contract address here:
//         npx hardhat run scripts/deploy.js --network ganache
//
// STEP 2: The ABI is automatically imported from the compiled
//         Hardhat artifact — no manual copy needed!
// ============================================================

import PropertyNFTArtifact from "../../../blockchain/artifacts/contracts/PropertyNFT.sol/PropertyNFT.json";

// ⬇️ PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = PropertyNFTArtifact.abi;

// Ganache default chain ID (decimal and hex)
export const GANACHE_CHAIN_ID = 31337;
export const GANACHE_CHAIN_ID_HEX = "0x7a69";
