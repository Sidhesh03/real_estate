import React, { useState } from "react";
import { mintProperty, listProperty } from "../services/web3Service";

/**
 * AddProperty Page (Phase 6 Enhanced)
 * ---------------------------------
 * Improvements:
 * - Better UX for transaction status
 * - UI consistency with PropertyList cards
 * - Detailed success/error feedback
 */
const AddProperty = ({ walletAddress, onPropertyAdded }) => {
  const [tokenURI, setTokenURI] = useState("");
  const [mintLoading, setMintLoading] = useState(false);
  const [mintMsg, setMintMsg] = useState({ text: "", isError: false });

  const [listTokenId, setListTokenId] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [listMsg, setListMsg] = useState({ text: "", isError: false });

  const handleMint = async (e) => {
    e.preventDefault();
    if (!tokenURI.trim()) {
      setMintMsg({ text: "Please enter a metadata URI.", isError: true });
      return;
    }
    setMintLoading(true);
    setMintMsg({ text: "Transaction requested... check MetaMask.", isError: false });
    try {
      const receipt = await mintProperty(tokenURI);
      setMintMsg({
        text: `Success! New Property NFT minted.`,
        isError: false,
      });
      setTokenURI("");
      if (onPropertyAdded) onPropertyAdded();
    } catch (err) {
      setMintMsg({ text: err.message, isError: true });
    } finally {
      setMintLoading(false);
    }
  };

  const handleList = async (e) => {
    e.preventDefault();
    if (!listTokenId || !listPrice) {
      setListMsg({ text: "Please provide both ID and Price.", isError: true });
      return;
    }
    setListLoading(true);
    setListMsg({ text: "Processing listing... please confirm.", isError: false });
    try {
      await listProperty(listTokenId, listPrice);
      setListMsg({
        text: `Property #${listTokenId} is now listed for sale!`,
        isError: false,
      });
      setListTokenId("");
      setListPrice("");
      if (onPropertyAdded) onPropertyAdded();
    } catch (err) {
      setListMsg({ text: err.message, isError: true });
    } finally {
      setListLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div style={styles.card}>
        <p style={{ color: "#888" }}>⚠️ Please connect your wallet to manage assets.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>🔨 Mint New Asset</h2>
        <p style={styles.subheading}>Create a unique Real Estate NFT by providing its metadata URI.</p>
        <form onSubmit={handleMint} style={styles.form}>
          <input
            type="text"
            placeholder="ipfs://metadata-hash or https://..."
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            style={styles.input}
          />
          <button type="submit" disabled={mintLoading} style={styles.primaryBtn}>
            {mintLoading ? "Mining Transaction..." : "Create NFT"}
          </button>
          {mintMsg.text && (
            <div style={{
              ...styles.msgBox,
              backgroundColor: mintMsg.isError ? "#ffebee" : "#e8f5e9",
              color: mintMsg.isError ? "#c62828" : "#2e7d32"
            }}>
              {mintMsg.text}
            </div>
          )}
        </form>
      </div>

      <div style={styles.card}>
        <h2 style={styles.heading}>🏷️ List for Marketplace</h2>
        <p style={styles.subheading}>Set a price and list your owned property for others to purchase.</p>
        <form onSubmit={handleList} style={styles.form}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="number"
              placeholder="Token ID"
              value={listTokenId}
              onChange={(e) => setListTokenId(e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price in ETH"
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              style={{ ...styles.input, flex: 2 }}
            />
          </div>
          <button type="submit" disabled={listLoading} style={styles.secondaryBtn}>
            {listLoading ? "Updating Registry..." : "Put on Sale"}
          </button>
          {listMsg.text && (
            <div style={{
              ...styles.msgBox,
              backgroundColor: listMsg.isError ? "#fff3e0" : "#e8f5e9",
              color: listMsg.isError ? "#e65100" : "#2e7d32"
            }}>
              {listMsg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "24px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "left"
  },
  heading: { fontSize: "20px", marginBottom: "4px", color: "#333" },
  subheading: { fontSize: "13px", color: "#777", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#fcfcfc"
  },
  primaryBtn: {
    padding: "12px",
    backgroundColor: "#3f51b5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
  secondaryBtn: {
    padding: "12px",
    backgroundColor: "#ff9800",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
  msgBox: {
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
    marginTop: "8px",
    textAlign: "center"
  }
};

export default AddProperty;
