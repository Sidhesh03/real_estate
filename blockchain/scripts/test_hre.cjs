const hre = require("hardhat");

async function main() {
  console.log("HRE keys:", Object.keys(hre));
  if (hre.ethers) {
    console.log("Ethers found!");
  } else {
    console.log("Ethers NOT found!");
  }
}

main().catch(console.error);
