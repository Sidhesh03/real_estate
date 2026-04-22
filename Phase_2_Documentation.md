# Phase 2: Smart Contract Engineering

This document provides the complete details of the `PropertyNFT.sol` smart contract, designed specifically for your Decentralized Real Estate Platform. It consolidates all minting and marketplace logic into a single, clean, and secure contract as required.

## 1. Full Solidity Contract Code (`PropertyNFT.sol`)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Property {
        uint256 tokenId;
        address owner;
        uint256 price;
        bool isForSale;
    }

    mapping(uint256 => Property) public properties;

    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event PropertyListed(uint256 indexed tokenId, uint256 price);
    event PropertySold(uint256 indexed tokenId, address indexed oldOwner, address indexed newOwner, uint256 price);

    constructor(address initialOwner) ERC721("RealEstateNFT", "RENFT") Ownable(initialOwner) {}

    function mintProperty(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        properties[tokenId] = Property({
            tokenId: tokenId,
            owner: to,
            price: 0,
            isForSale: false
        });
        
        emit PropertyMinted(tokenId, to, uri);
        
        return tokenId;
    }

    function listProperty(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list this property");
        require(price > 0, "Price must be greater than zero");
        
        properties[tokenId].isForSale = true;
        properties[tokenId].price = price;
        
        emit PropertyListed(tokenId, price);
    }

    function buyProperty(uint256 tokenId) public payable {
        Property storage property = properties[tokenId];
        
        require(property.isForSale, "Property is not for sale");
        require(msg.value >= property.price, "Insufficient funds sent");
        require(msg.sender != property.owner, "Owner cannot buy their own property");
        
        address seller = property.owner;
        uint256 salePrice = property.price;
        
        // Update property state
        property.owner = msg.sender;
        property.isForSale = false;
        
        // Secure transfers
        _transfer(seller, msg.sender, tokenId);
        
        (bool success, ) = payable(seller).call{value: salePrice}("");
        require(success, "ETH transfer failed");
        
        if (msg.value > salePrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - salePrice}("");
            require(refundSuccess, "ETH refund failed");
        }
        
        emit PropertySold(tokenId, seller, msg.sender, salePrice);
    }

    function getProperty(uint256 tokenId) public view returns (Property memory) {
        require(ownerOf(tokenId) != address(0), "Property does not exist");
        return properties[tokenId];
    }

    function getAllProperties() public view returns (Property[] memory) {
        uint256 totalProperties = _nextTokenId;
        Property[] memory allProperties = new Property[](totalProperties);
        
        for (uint256 i = 0; i < totalProperties; i++) {
            allProperties[i] = properties[i];
        }
        
        return allProperties;
    }
}
```

## 2. Explanation of Functions (For Viva Preparation)
* **`mintProperty(address to, string memory uri)`**: Automatically generates a unique `tokenId`, mints the NFT to the given address, sets the IPFS metadata link (`tokenURI`), initializes the `Property` struct in our mapping, and emits the `PropertyMinted` event.
* **`listProperty(uint256 tokenId, uint256 price)`**: Allows the owner to flag the property as `isForSale` and sets the price. It uses `require(ownerOf(tokenId) == msg.sender)` to strictly enforce access control.
* **`buyProperty(uint256 tokenId)`**: A `payable` function handling the actual transaction. It validates that the property is for sale, the buyer is not the seller, and the funds sent match or exceed the price. It updates the state, securely transfers the NFT, sends the ETH to the seller, and refunds any excess ETH.
* **`getProperty(uint256 tokenId)` & `getAllProperties()`**: View functions to quickly retrieve state. `getAllProperties()` iterates through the mapping to build an array, making it easy to display all properties on the frontend without a separate database.

## 3. Deployment Script Update (`scripts/deploy.js`)
The script has been updated to deploy solely the unified `PropertyNFT` contract.
```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy PropertyNFT
  const PropertyNFT = await hre.ethers.getContractFactory("PropertyNFT");
  const propertyNFT = await PropertyNFT.deploy(deployer.address);
  await propertyNFT.waitForDeployment();
  const nftAddress = await propertyNFT.getAddress();
  
  console.log("PropertyNFT deployed successfully to:", nftAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## 4. Steps to Compile, Deploy, and Test

### Compile the Contract
Open a terminal in the `real-estate-dapp/blockchain` directory and run:
```bash
npx hardhat compile
```
*(This ensures the contract has no syntax errors and generates the ABI).*

### Deploy on Ganache
Ensure your Ganache UI is running on `127.0.0.1:7545`, then run:
```bash
npx hardhat run scripts/deploy.js --network ganache
```
*(Copy the deployed contract address output by this script; you will need it for Phase 3!)*

### Test using Hardhat Console
You can manually test the contract using the interactive Hardhat console. Run:
```bash
npx hardhat console --network ganache
```
Inside the console, you can run JavaScript code directly. Example testing flow:
```javascript
// 1. Get signers and contract
const [owner, buyer] = await ethers.getSigners();
const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
// Replace with your actual deployed address
const contract = await PropertyNFT.attach("0xYOUR_DEPLOYED_ADDRESS");

// 2. Mint a property
await contract.mintProperty(owner.address, "ipfs://QmMockHash123");
const propertyDetails = await contract.getProperty(0);
console.log(propertyDetails);

// 3. List the property
const price = ethers.parseEther("1.0"); // 1 ETH
await contract.listProperty(0, price);

// 4. Buy the property using the buyer account
await contract.connect(buyer).buyProperty(0, { value: price });
```
