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
export const CONTRACT_ADDRESS = "0x55FA73a4196E48a947a24589B2e236154DF0E405";

export const CONTRACT_ABI = PropertyNFTArtifact.abi;

// Ganache default chain ID (decimal and hex)
export const GANACHE_CHAIN_ID = 1337;
export const GANACHE_CHAIN_ID_HEX = "0x539";
