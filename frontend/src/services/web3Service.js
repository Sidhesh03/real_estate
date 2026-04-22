// ============================================================
// web3Service.js — Blockchain Interaction Layer
// ============================================================
// This module is the ONLY place that talks to the blockchain.
// All components import functions from here, keeping the
// blockchain logic cleanly separated from the UI.
// ============================================================

import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  GANACHE_CHAIN_ID_HEX,
  GANACHE_CHAIN_ID,
} from "../config/contractConfig";

// ─── 1. Connect Wallet ────────────────────────────────────────
// Detects MetaMask, requests account access, checks the user
// is on the correct Ganache network, and returns the address.
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed. Please install it from https://metamask.io"
    );
  }

  // Request account access — triggers MetaMask popup
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  // Auto-switch to Ganache network (Chain ID 1337 = 0x539)
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GANACHE_CHAIN_ID_HEX }],
    });
  } catch (switchError) {
    // Error 4902 = chain not added to MetaMask yet → add it automatically
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: GANACHE_CHAIN_ID_HEX,
              chainName: "Ganache Local",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["http://127.0.0.1:7545"],
            },
          ],
        });
      } catch (addError) {
        throw new Error("Failed to add Ganache network to MetaMask: " + addError.message);
      }
    } else if (switchError.code !== 4001) {
      // 4001 = user rejected, which is fine — we still proceed
      throw new Error("Failed to switch network: " + switchError.message);
    }
  }

  return accounts[0];
};

// ─── 2. Get Contract Instance ─────────────────────────────────
// Initializes the Ethers.js provider → signer → contract object
// using the compiled ABI and deployed address from contractConfig.
export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  // BrowserProvider wraps MetaMask's window.ethereum (ethers v6)
  const provider = new ethers.BrowserProvider(window.ethereum);

  // The signer is the connected wallet — it authorizes transactions
  const signer = await provider.getSigner();

  // Create a typed contract instance using ABI + address + signer
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  return contract;
};

// ─── 3. Mint Property ────────────────────────────────────────
// Calls mintProperty(address, tokenURI) on the smart contract.
// Triggers a MetaMask popup for the user to confirm the tx.
export const mintProperty = async (tokenURI) => {
  const contract = await getContract();

  // Get the current signer's address to assign as NFT owner
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const ownerAddress = await signer.getAddress();

  const tx = await contract.mintProperty(ownerAddress, tokenURI);

  // Wait for the transaction to be mined (1 confirmation)
  const receipt = await tx.wait();
  return receipt;
};

// ─── 4. List Property For Sale ───────────────────────────────
// Calls listProperty(tokenId, price) on the smart contract.
// price must be in ETH (string) — converted to wei here.
export const listProperty = async (tokenId, priceInEth) => {
  const contract = await getContract();

  // Convert ETH string (e.g. "1.5") to wei (BigInt)
  const priceInWei = ethers.parseEther(priceInEth.toString());

  const tx = await contract.listProperty(tokenId, priceInWei);
  const receipt = await tx.wait();
  return receipt;
};

// ─── 5. Buy Property ─────────────────────────────────────────
// Calls buyProperty(tokenId) as a payable function.
// Sends the property price as ETH value with the transaction.
export const buyProperty = async (tokenId, priceInWei) => {
  const contract = await getContract();

  const tx = await contract.buyProperty(tokenId, {
    value: priceInWei, // ETH is sent with the transaction
  });
  const receipt = await tx.wait();
  return receipt;
};

// ─── 6. Get All Properties ───────────────────────────────────
// Calls getAllProperties() — a view function (no gas, no popup).
// Returns a formatted array of property objects.
export const getAllProperties = async () => {
  const contract = await getContract();
  const rawProperties = await contract.getAllProperties();

  // Format: convert BigInts to readable strings for the UI
  return rawProperties.map((p) => ({
    tokenId: p.tokenId.toString(),
    owner: p.owner,
    price: p.price,          // Keep as BigInt for buyProperty call
    priceEth: ethers.formatEther(p.price), // Human-readable ETH string
    isForSale: p.isForSale,
  }));
};
