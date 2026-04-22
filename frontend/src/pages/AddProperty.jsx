import React, { useState } from "react";
import { mintProperty, listProperty } from "../services/web3Service";

// ─── AddProperty.jsx ─────────────────────────────────────────
// Allows the connected wallet owner to:
//   1. Mint a new property NFT with a tokenURI (e.g. IPFS link)
//   2. List an already-owned property for sale
// Both actions call the smart contract via web3Service.
// ─────────────────────────────────────────────────────────────
const AddProperty = ({ walletAddress, onPropertyAdded }) => {
  // ── Mint State ──
  const [tokenURI, setTokenURI] = useState("");
  const [mintLoading, setMintLoading] = useState(false);
  const [mintMsg, setMintMsg] = useState({ text: "", isError: false });

  // ── List State ──
  const [listTokenId, setListTokenId] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [listMsg, setListMsg] = useState({ text: "", isError: false });

  // ── Mint Handler ──────────────────────────────────────────
  const handleMint = async (e) => {
    e.preventDefault();
    if (!tokenURI.trim()) {
      setMintMsg({ text: "Please enter a Token URI.", isError: true });
      return;
    }
    setMintLoading(true);
    setMintMsg({ text: "", isError: false });
    try {
      // Sends tx to contract → MetaMask popup appears → user confirms
      const receipt = await mintProperty(tokenURI);
      setMintMsg({
        text: `Property minted! Tx: ${receipt.hash.slice(0, 18)}...`,
        isError: false,
      });
      setTokenURI("");
      // Notify parent to refresh property list
      if (onPropertyAdded) onPropertyAdded();
    } catch (err) {
      setMintMsg({ text: err.message, isError: true });
    } finally {
      setMintLoading(false);
    }
  };

  // ── List Handler ──────────────────────────────────────────
  const handleList = async (e) => {
    e.preventDefault();
    if (!listTokenId || !listPrice) {
      setListMsg({ text: "Please enter Token ID and price.", isError: true });
      return;
    }
    setListLoading(true);
    setListMsg({ text: "", isError: false });
    try {
      // Sends tx to contract → MetaMask popup appears → user confirms
      const receipt = await listProperty(listTokenId, listPrice);
      setListMsg({
        text: `Property #${listTokenId} listed! Tx: ${receipt.hash.slice(0, 18)}...`,
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
        <p style={{ color: "#888" }}>⚠️ Please connect your wallet first.</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>➕ Mint New Property NFT</h2>
      <form onSubmit={handleMint} style={styles.form}>
        <label style={styles.label}>Token URI (IPFS or metadata URL)</label>
        <input
          id="token-uri-input"
          type="text"
          placeholder="ipfs://Qm... or https://..."
          value={tokenURI}
          onChange={(e) => setTokenURI(e.target.value)}
          style={styles.input}
        />
        <button
          id="mint-btn"
          type="submit"
          disabled={mintLoading}
          style={styles.primaryBtn}
        >
          {mintLoading ? "Minting... (confirm in MetaMask)" : "🔨 Mint Property"}
        </button>
        {mintMsg.text && (
          <p style={{ ...styles.msgText, color: mintMsg.isError ? "#f44336" : "#4caf50" }}>
            {mintMsg.isError ? "❌ " : "✔ "}{mintMsg.text}
          </p>
        )}
      </form>

      <hr style={{ margin: "24px 0", borderColor: "#eee" }} />

      <h2 style={styles.heading}>📋 List Property For Sale</h2>
      <form onSubmit={handleList} style={styles.form}>
        <label style={styles.label}>Token ID</label>
        <input
          id="list-token-id-input"
          type="number"
          placeholder="e.g. 0"
          value={listTokenId}
          onChange={(e) => setListTokenId(e.target.value)}
          style={styles.input}
        />
        <label style={styles.label}>Price (ETH)</label>
        <input
          id="list-price-input"
          type="number"
          step="0.01"
          placeholder="e.g. 1.5"
          value={listPrice}
          onChange={(e) => setListPrice(e.target.value)}
          style={styles.input}
        />
        <button
          id="list-btn"
          type="submit"
          disabled={listLoading}
          style={styles.secondaryBtn}
        >
          {listLoading ? "Listing... (confirm in MetaMask)" : "🏷️ List For Sale"}
        </button>
        {listMsg.text && (
          <p style={{ ...styles.msgText, color: listMsg.isError ? "#f44336" : "#4caf50" }}>
            {listMsg.isError ? "❌ " : "✔ "}{listMsg.text}
          </p>
        )}
      </form>
    </div>
  );
};

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "16px",
    backgroundColor: "#fff",
  },
  heading: { fontSize: "18px", marginBottom: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", color: "#555", fontWeight: "bold" },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  },
  primaryBtn: {
    padding: "10px 16px",
    backgroundColor: "#3f51b5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    marginTop: "4px",
  },
  secondaryBtn: {
    padding: "10px 16px",
    backgroundColor: "#ff9800",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    marginTop: "4px",
  },
  msgText: { margin: "8px 0 0", fontSize: "13px" },
};

export default AddProperty;
