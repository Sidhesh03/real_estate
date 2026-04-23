import { ethers } from "ethers";
import { readFileSync } from "fs";

// Load the compiled artifact
const artifact = JSON.parse(
  readFileSync(
    new URL("../artifacts/contracts/PropertyNFT.sol/PropertyNFT.json", import.meta.url)
  )
);

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Get signers (Hardhat/Ganache accounts)
  const owner = await provider.getSigner(0);
  const buyer1 = await provider.getSigner(1);
  const buyer2 = await provider.getSigner(2);

  console.log("====================================================");
  console.log("PHASE 7: DUMMY DATA POPULATION");
  console.log("====================================================");

  // Connect to the contract
  const PropertyNFT = new ethers.Contract(contractAddress, artifact.abi, owner);

  const properties = [
    { uri: "ipfs://QmSkylinePenthouse", name: "Skyline Penthouse", price: "2.5" },
    { uri: "ipfs://QmGreenValleyVilla", name: "Green Valley Villa", price: "1.8" },
    { uri: "ipfs://QmOceanBreezeApartment", name: "Ocean Breeze Apartment", price: "3.2" },
    { uri: "ipfs://QmSunsetLoft", name: "Sunset Loft", price: "1.2" },
    { uri: "ipfs://QmRiversideCottage", name: "Riverside Cottage", price: "0.8" },
    { uri: "ipfs://QmUrbanStudio", name: "Urban Studio", price: "0.5" },
  ];

  console.log("\n--- Minting 6 Properties ---");
  for (let i = 0; i < properties.length; i++) {
    const tx = await PropertyNFT.mintProperty(await owner.getAddress(), properties[i].uri);
    await tx.wait();
    console.log(`Minted Property #${i}: ${properties[i].name}`);
  }

  console.log("\n--- Listing 4 Properties for Sale ---");
  const listingIndices = [0, 1, 2, 3];
  for (const index of listingIndices) {
    const priceWei = ethers.parseEther(properties[index].price);
    const tx = await PropertyNFT.listProperty(index, priceWei);
    await tx.wait();
    console.log(`Listed Property #${index} for ${properties[index].price} ETH`);
  }

  console.log("\n--- Simulating Sales (Buyer Transactions) ---");

  // Buyer 1 buys Property #0
  const buyer1Contract = PropertyNFT.connect(buyer1);
  const buyTx1 = await buyer1Contract.buyProperty(0, { 
    value: ethers.parseEther(properties[0].price) 
  });
  await buyTx1.wait();
  console.log(`Property #0 BOUGHT by Buyer 1 (${await buyer1.getAddress()})`);

  // Buyer 2 buys Property #1
  const buyer2Contract = PropertyNFT.connect(buyer2);
  const buyTx2 = await buyer2Contract.buyProperty(1, { 
    value: ethers.parseEther(properties[1].price) 
  });
  await buyTx2.wait();
  console.log(`Property #1 BOUGHT by Buyer 2 (${await buyer2.getAddress()})`);

  console.log("\n====================================================");
  console.log("SEEDING COMPLETE");
  console.log("====================================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
