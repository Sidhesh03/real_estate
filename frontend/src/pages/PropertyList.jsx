import React, { useState, useEffect } from "react";
import { getAllProperties, buyProperty } from "../services/web3Service";

// ─── PropertyList.jsx ─────────────────────────────────────────
// Fetches and displays all properties from the blockchain.
// If a property isForSale, shows a "Buy" button.
// The buy button calls buyProperty() which triggers a MetaMask tx.
// ─────────────────────────────────────────────────────────────
const PropertyList = ({ walletAddress, refreshTrigger }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Track individual buy loading states per tokenId
  const [buyingId, setBuyingId] = useState(null);
  const [txMsg, setTxMsg] = useState({ id: null, text: "", isError: false });

  // Fetch all properties on mount and whenever refreshTrigger changes
  useEffect(() => {
    if (walletAddress) {
      fetchProperties();
    }
  }, [walletAddress, refreshTrigger]);

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    try {
      // Calls getAllProperties() — a read-only call, no MetaMask popup
      const data = await getAllProperties();
      setProperties(data);
    } catch (err) {
      setError("Failed to load properties: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (property) => {
    setBuyingId(property.tokenId);
    setTxMsg({ id: null, text: "", isError: false });
    try {
      // Sends ETH = property.price with the transaction
      // MetaMask popup appears asking user to confirm
      const receipt = await buyProperty(property.tokenId, property.price);
      setTxMsg({
        id: property.tokenId,
        text: `Purchase successful! Tx: ${receipt.hash.slice(0, 18)}...`,
        isError: false,
      });
      // Refresh the list to show updated ownership
      fetchProperties();
    } catch (err) {
      setTxMsg({
        id: property.tokenId,
        text: err.code === 4001 ? "Transaction rejected by user." : err.message,
        isError: true,
      });
    } finally {
      setBuyingId(null);
    }
  };

  const shortenAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "N/A";

  if (!walletAddress) {
    return (
      <div style={styles.card}>
        <p style={{ color: "#888" }}>⚠️ Please connect your wallet to view properties.</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>🏘️ All Properties</h2>
        <button id="refresh-btn" onClick={fetchProperties} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {loading && <p style={{ color: "#888" }}>Loading from blockchain...</p>}
      {error && <p style={{ color: "#f44336" }}>❌ {error}</p>}

      {!loading && properties.length === 0 && (
        <p style={{ color: "#888" }}>
          No properties found. Mint the first one!
        </p>
      )}

      <div style={styles.grid}>
        {properties.map((property) => {
          const isOwner =
            walletAddress &&
            property.owner.toLowerCase() === walletAddress.toLowerCase();
          const isBuying = buyingId === property.tokenId;

          return (
            <div key={property.tokenId} style={styles.propertyCard}>
              {/* Status Badge */}
              <span
                style={{
                  ...styles.badge,
                  backgroundColor: property.isForSale ? "#e8f5e9" : "#fff3e0",
                  color: property.isForSale ? "#388e3c" : "#f57c00",
                }}
              >
                {property.isForSale ? "🟢 For Sale" : "🔒 Not Listed"}
              </span>

              <div style={styles.infoRow}>
                <span style={styles.fieldLabel}>Token ID</span>
                <span style={styles.fieldValue}>#{property.tokenId}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.fieldLabel}>Owner</span>
                <span style={styles.fieldValue}>
                  {isOwner
                    ? `You (${shortenAddress(property.owner)})`
                    : shortenAddress(property.owner)}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.fieldLabel}>Price</span>
                <span style={styles.fieldValue}>
                  {property.isForSale ? `${property.priceEth} ETH` : "—"}
                </span>
              </div>

              {/* Buy button — only visible for non-owners on listed properties */}
              {property.isForSale && !isOwner && (
                <button
                  id={`buy-btn-${property.tokenId}`}
                  onClick={() => handleBuy(property)}
                  disabled={isBuying}
                  style={styles.buyBtn}
                >
                  {isBuying
                    ? "Buying... (confirm MetaMask)"
                    : `💰 Buy for ${property.priceEth} ETH`}
                </button>
              )}

              {/* Per-property transaction feedback */}
              {txMsg.id === property.tokenId && txMsg.text && (
                <p
                  style={{
                    fontSize: "12px",
                    marginTop: "8px",
                    color: txMsg.isError ? "#f44336" : "#4caf50",
                  }}
                >
                  {txMsg.isError ? "❌ " : "✔ "}
                  {txMsg.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  heading: { fontSize: "18px", margin: 0 },
  refreshBtn: {
    padding: "6px 14px",
    border: "1px solid #3f51b5",
    borderRadius: "6px",
    color: "#3f51b5",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "13px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px",
  },
  propertyCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#fafafa",
    position: "relative",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
    fontSize: "13px",
  },
  fieldLabel: { color: "#888" },
  fieldValue: { fontWeight: "600", color: "#333" },
  buyBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "10px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
  },
};

export default PropertyList;
