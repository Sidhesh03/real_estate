import React, { useState, useEffect } from "react";
import { connectWallet } from "../services/web3Service";

// ─── WalletConnect.jsx ────────────────────────────────────────
// Handles MetaMask detection, connection, and wallet display.
// Accepts an optional onConnect(address) callback so the parent
// (App.jsx) can track the wallet address globally.
// ─────────────────────────────────────────────────────────────
const WalletConnect = ({ onConnect }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-detect if wallet was already connected on page reload
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          if (onConnect) onConnect(accounts[0]);
        }
      }
    };
    checkConnection();
  }, []);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          if (onConnect) onConnect(accounts[0]);
        } else {
          setWalletAddress("");
          setStatusMsg("Wallet disconnected.");
        }
      });

      // Refresh page on network change so provider/contract reinitialise cleanly
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setStatusMsg("");
    setIsError(false);
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      setStatusMsg("Wallet connected successfully!");
      if (onConnect) onConnect(address);
    } catch (error) {
      setIsError(true);
      // Show user-friendly messages for common errors
      if (error.code === 4001) {
        setStatusMsg("Connection rejected. Please approve the MetaMask request.");
      } else {
        setStatusMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🦊 Wallet Connection</h3>
      {walletAddress ? (
        <div>
          <p style={styles.label}>Connected Account:</p>
          <code style={styles.address}>{walletAddress}</code>
          <p style={{ color: "#4caf50", marginTop: "6px", fontSize: "13px" }}>
            ✔ Connected to Ganache
          </p>
        </div>
      ) : (
        <button
          id="connect-wallet-btn"
          onClick={handleConnect}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Connecting..." : "Connect MetaMask"}
        </button>
      )}
      {statusMsg && (
        <p style={{ ...styles.status, color: isError ? "#f44336" : "#4caf50" }}>
          {isError ? "❌ " : "✔ "}
          {statusMsg}
        </p>
      )}
    </div>
  );
};

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
    backgroundColor: "#f9f9f9",
  },
  title: { margin: "0 0 12px 0", fontSize: "16px" },
  label: { margin: "0 0 4px 0", fontSize: "13px", color: "#555" },
  address: {
    display: "block",
    padding: "8px",
    backgroundColor: "#e8f5e9",
    borderRadius: "4px",
    fontSize: "13px",
    wordBreak: "break-all",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#f6851b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },
  status: { marginTop: "10px", fontSize: "13px" },
};

export default WalletConnect;
