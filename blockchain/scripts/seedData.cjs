const hre = require("hardhat");

async function main() {
  const [owner, buyer1, buyer2] = await hre.ethers.getSigners();
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Latest deployed address
  
  console.log("====================================================");
  console.log("PHASE 7: DUMMY DATA POPULATION");
  console.log("====================================================");
  console.log("Using account:", owner.address);

  // Connect to the deployed contract
  const PropertyNFT = await hre.ethers.getContractAt("PropertyNFT", contractAddress);

  // 1. MINT PROPERTIES
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
    const tx = await PropertyNFT.mintProperty(owner.address, properties[i].uri);
    await tx.wait();
    console.log(`Minted Property #${i}: ${properties[i].name}`);
  }

  // 2. LIST PROPERTIES FOR SALE
  console.log("\n--- Listing 4 Properties for Sale ---");
  const listingIndices = [0, 1, 2, 3]; // Listing first 4
  for (const index of listingIndices) {
    const priceWei = hre.ethers.parseEther(properties[index].price);
    const tx = await PropertyNFT.listProperty(index, priceWei);
    await tx.wait();
    console.log(`Listed Property #${index} for ${properties[index].price} ETH`);
  }

  // 3. SIMULATE TRANSACTIONS (Account Switches)
  console.log("\n--- Simulating Sales (Buyer Transactions) ---");

  // Buyer 1 buys Property #0
  const buyer1Contract = PropertyNFT.connect(buyer1);
  const buyTx1 = await buyer1Contract.buyProperty(0, { 
    value: hre.ethers.parseEther(properties[0].price) 
  });
  await buyTx1.wait();
  console.log(`Property #0 BOUGHT by Buyer 1 (${buyer1.address})`);

  // Buyer 2 buys Property #1
  const buyer2Contract = PropertyNFT.connect(buyer2);
  const buyTx2 = await buyer2Contract.buyProperty(1, { 
    value: hre.ethers.parseEther(properties[1].price) 
  });
  await buyTx2.wait();
  console.log(`Property #1 BOUGHT by Buyer 2 (${buyer2.address})`);

  console.log("\n====================================================");
  console.log("SEEDING COMPLETE: 6 Properties, 4 Listings, 2 Sales");
  console.log("====================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
