// ============================================================
// web3Service.js — Blockchain Interaction Layer
// ============================================================
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  GANACHE_CHAIN_ID_HEX,
} from "../config/contractConfig";

// ─── 1. Connect Wallet ────────────────────────────────────────
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install it from https://metamask.io");
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GANACHE_CHAIN_ID_HEX }],
    });

    return accounts[0];
  } catch (error) {
    if (error.code === 4001) throw new Error("Connection request rejected by user.");
    if (error.code === 4902) {
      // Chain not added
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: GANACHE_CHAIN_ID_HEX,
          chainName: "Hardhat Local",
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["http://127.0.0.1:8545"],
        }],
      });
      return connectWallet();
    }
    throw error;
  }
};

// ─── 2. Get Contract Instance ─────────────────────────────────
export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// ─── 3. Mint Property ────────────────────────────────────────
export const mintProperty = async (tokenURI) => {
  const contract = await getContract();
  const signer = contract.runner;
  const ownerAddress = await signer.getAddress();

  try {
    const tx = await contract.mintProperty(ownerAddress, tokenURI);
    return await tx.wait();
  } catch (error) {
    if (error.code === "ACTION_REJECTED") throw new Error("Transaction rejected by user.");
    throw error;
  }
};

// ─── 4. List Property For Sale ───────────────────────────────
export const listProperty = async (tokenId, priceInEth) => {
  const contract = await getContract();
  const priceInWei = ethers.parseEther(priceInEth.toString());

  try {
    const tx = await contract.listProperty(tokenId, priceInWei);
    return await tx.wait();
  } catch (error) {
    if (error.code === "ACTION_REJECTED") throw new Error("Transaction rejected by user.");
    throw error;
  }
};

// ─── 5. Buy Property ─────────────────────────────────────────
export const buyProperty = async (tokenId, priceInWei) => {
  const contract = await getContract();
  try {
    const tx = await contract.buyProperty(tokenId, { value: priceInWei });
    return await tx.wait();
  } catch (error) {
    if (error.code === "ACTION_REJECTED") throw new Error("Transaction rejected by user.");
    throw error;
  }
};

// ─── 6. Get All Properties ───────────────────────────────────
export const getAllProperties = async () => {
  const contract = await getContract();
  const rawProperties = await contract.getAllProperties();

  return rawProperties.map((p) => ({
    tokenId: p.tokenId.toString(),
    owner: p.owner,
    price: p.price,
    priceEth: ethers.formatEther(p.price),
    isForSale: p.isForSale,
  }));
};

// ─── 7. Get Property History (Phase 6) ────────────────────────
export const getPropertyHistory = async (tokenId) => {
  const contract = await getContract();
  const provider = contract.runner.provider;
  
  // Create filters for the specific tokenId
  const mintFilter = contract.filters.PropertyMinted(tokenId);
  const soldFilter = contract.filters.PropertySold(tokenId);

  // Fetch events from genesis to latest block
  const mintEvents = await contract.queryFilter(mintFilter, 0, "latest");
  const soldEvents = await contract.queryFilter(soldFilter, 0, "latest");

  const history = [];

  // Add minting event
  for (const event of mintEvents) {
    const block = await provider.getBlock(event.blockNumber);
    history.push({
      type: "MINTED",
      from: "0x0000000000000000000000000000000000000000",
      to: event.args[1],
      timestamp: block.timestamp,
      txHash: event.transactionHash,
    });
  }

  // Add sale events
  for (const event of soldEvents) {
    const block = await provider.getBlock(event.blockNumber);
    history.push({
      type: "SOLD",
      from: event.args[1],
      to: event.args[2],
      price: ethers.formatEther(event.args[3]),
      timestamp: block.timestamp,
      txHash: event.transactionHash,
    });
  }

  // Sort by timestamp descending
  return history.sort((a, b) => b.timestamp - a.timestamp);
};

// ─── 8. Role Management ───────────────────────────────────────
export const getUserRole = async (address) => {
  try {
    const contract = await getContract();
    const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const LISTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("LISTER_ROLE"));

    const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, address);
    if (isAdmin) return "admin";

    const isLister = await contract.hasRole(LISTER_ROLE, address);
    if (isLister) return "lister";

    return "buyer";
  } catch (error) {
    console.error("Failed to fetch user role:", error);
    return "buyer";
  }
};

export const grantListerRole = async (address) => {
  const contract = await getContract();
  const tx = await contract.grantLister(address);
  return await tx.wait();
};

export const revokeListerRole = async (address) => {
  const contract = await getContract();
  const tx = await contract.revokeLister(address);
  return await tx.wait();
};
