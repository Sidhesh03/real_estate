import React, { useState, useEffect } from "react";
import { getAllProperties, buyProperty, getPropertyHistory } from "../services/web3Service";

/**
 * PropertyList Page (Phase 6 Enhanced)
 * ------------------------------------
 * Features added:
 * - Status Badges (Owned by You, For Sale, Sold)
 * - Property Transaction History (via blockchain events)
 * - KYC Simulation (Checkbox verification)
 * - ETH to INR conversion display
 * - Loading feedback and disabled button states
 */
const PropertyList = ({ walletAddress, refreshTrigger }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState(null);
  const [txMsg, setTxMsg] = useState({ id: null, text: "", isError: false });
  const [propertyHistory, setPropertyHistory] = useState({}); // { tokenId: historyArray }
  const [showHistory, setShowHistory] = useState({}); // { tokenId: boolean }
  const [isVerified, setIsVerified] = useState(false); // KYC Simulation

  const ETH_TO_INR = 300000;

  useEffect(() => {
    if (walletAddress) {
      fetchProperties();
    }
  }, [walletAddress, refreshTrigger]);

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllProperties();
      setProperties(data);
    } catch (err) {
      setError("Failed to load properties: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (property) => {
    if (!isVerified) {
      setTxMsg({ id: property.tokenId, text: "Please complete KYC verification first.", isError: true });
      return;
    }

    setBuyingId(property.tokenId);
    setTxMsg({ id: null, text: "", isError: false });
    try {
      setTxMsg({ id: property.tokenId, text: "Transaction in progress... please confirm in MetaMask.", isError: false });
      const receipt = await buyProperty(property.tokenId, property.price);
      setTxMsg({
        id: property.tokenId,
        text: `Success! Purchased for ${property.priceEth} ETH.`,
        isError: false,
      });
      fetchProperties(); // Refresh list
    } catch (err) {
      setTxMsg({
        id: property.tokenId,
        text: err.message,
        isError: true,
      });
    } finally {
      setBuyingId(null);
    }
  };

  const toggleHistory = async (tokenId) => {
    if (showHistory[tokenId]) {
      setShowHistory({ ...showHistory, [tokenId]: false });
      return;
    }

    // Fetch history if not already loaded
    if (!propertyHistory[tokenId]) {
      try {
        const history = await getPropertyHistory(tokenId);
        setPropertyHistory({ ...propertyHistory, [tokenId]: history });
      } catch (err) {
        console.error("History fetch error:", err);
      }
    }
    setShowHistory({ ...showHistory, [tokenId]: true });
  };

  const shortenAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "N/A";

  const formatPriceINR = (eth) => {
    const inr = parseFloat(eth) * ETH_TO_INR;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(inr);
  };

  if (!walletAddress) {
    return (
      <div style={styles.card}>
        <p style={{ color: "#888" }}>⚠️ Please connect your wallet to view property marketplace.</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>🏘️ Property Marketplace</h2>
        <button id="refresh-btn" onClick={fetchProperties} style={styles.refreshBtn}>
          🔄 Refresh Data
        </button>
      </div>

      {/* KYC Simulation Banner */}
      <div className="kyc-box">
        <input 
          type="checkbox" 
          id="kyc-check" 
          checked={isVerified} 
          onChange={(e) => setIsVerified(e.target.checked)} 
        />
        <label htmlFor="kyc-check">
          <strong>KYC Simulation:</strong> I confirm my identity and verify myself as a legitimate buyer.
        </label>
      </div>

      {loading && <p style={{ color: "#888", margin: "20px" }}>⏳ Fetching data from blockchain...</p>}
      {error && <p style={{ color: "#f44336", margin: "20px" }}>❌ {error}</p>}

      {!loading && properties.length === 0 && (
        <p style={{ color: "#888", margin: "40px" }}>
          No properties found in the registry. Use the Mint page to add one!
        </p>
      )}

      <div style={styles.grid}>
        {properties.map((property) => {
          const isOwner = property.owner.toLowerCase() === walletAddress.toLowerCase();
          const isBuying = buyingId === property.tokenId;
          const statusClass = isOwner ? "status-owned" : (property.isForSale ? "status-available" : "status-sold");
          const statusText = isOwner ? "👤 Owned by You" : (property.isForSale ? "🟢 Available" : "🔒 Private");

          return (
            <div key={property.tokenId} style={styles.propertyCard}>
              {isBuying && <div className="loading-overlay">⏳ Buying...</div>}
              
              <span className={`status-badge ${statusClass}`}>
                {statusText}
              </span>

              <div style={styles.infoRow}>
                <span style={styles.fieldLabel}>Asset ID</span>
                <span style={styles.fieldValue}>NFT #{property.tokenId}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.fieldLabel}>Owner</span>
                <span style={styles.fieldValue} title={property.owner}>
                  {isOwner ? "You" : shortenAddress(property.owner)}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.fieldLabel}>Market Price</span>
                <div style={{ textAlign: "right" }}>
                  <div style={styles.fieldValue}>
                    {property.isForSale ? `${property.priceEth} ETH` : "—"}
                  </div>
                  {property.isForSale && (
                    <div className="inr-price">≈ {formatPriceINR(property.priceEth)}</div>
                  )}
                </div>
              </div>

              {/* Buy Button */}
              {property.isForSale && !isOwner && (
                <button
                  id={`buy-btn-${property.tokenId}`}
                  onClick={() => handleBuy(property)}
                  disabled={isBuying || !isVerified}
                  style={{
                    ...styles.buyBtn,
                    opacity: (!isVerified || isBuying) ? 0.6 : 1,
                    cursor: (!isVerified || isBuying) ? "not-allowed" : "pointer"
                  }}
                >
                  {isBuying ? "Confirming..." : "Purchase Property"}
                </button>
              )}

              {/* Transaction Messages */}
              {txMsg.id === property.tokenId && txMsg.text && (
                <div style={{
                  fontSize: "12px",
                  marginTop: "12px",
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: txMsg.isError ? "#ffebee" : "#e8f5e9",
                  color: txMsg.isError ? "#c62828" : "#2e7d32",
                  border: `1px solid ${txMsg.isError ? "#ef9a9a" : "#a5d6a7"}`
                }}>
                  {txMsg.text}
                </div>
              )}

              {/* History Toggle */}
              <button 
                onClick={() => toggleHistory(property.tokenId)}
                style={styles.historyBtn}
              >
                {showHistory[property.tokenId] ? "🔼 Hide History" : "🔽 View History"}
              </button>

              {showHistory[property.tokenId] && (
                <div className="history-container">
                  {propertyHistory[property.tokenId] ? (
                    propertyHistory[property.tokenId].length > 0 ? (
                      propertyHistory[property.tokenId].map((h, i) => (
                        <div key={i} className="history-item">
                          <span className="history-type">{h.type}</span>
                          <span style={{ fontSize: "10px" }}>
                            {h.type === "MINTED" ? `to ${shortenAddress(h.to)}` : `from ${shortenAddress(h.from)} to ${shortenAddress(h.to)}`}
                          </span>
                          <div className="history-date">
                            {new Date(h.timestamp * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : <p style={{ fontSize: "11px", color: "#888" }}>No records found.</p>
                  ) : <p style={{ fontSize: "11px", color: "#888" }}>Loading logs...</p>}
                </div>
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
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  heading: { fontSize: "22px", margin: 0, fontWeight: "600" },
  refreshBtn: {
    padding: "8px 16px",
    border: "1px solid #3f51b5",
    borderRadius: "8px",
    color: "#3f51b5",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  propertyCard: {
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "20px",
    backgroundColor: "#fff",
    position: "relative",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
    ":hover": {
      boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
      transform: "translateY(-4px)"
    }
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    fontSize: "14px",
  },
  fieldLabel: { color: "#777", fontWeight: "400" },
  fieldValue: { fontWeight: "600", color: "#111" },
  buyBtn: {
    marginTop: "8px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "14px",
    transition: "background-color 0.2s",
  },
  historyBtn: {
    marginTop: "16px",
    width: "100%",
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "6px",
    padding: "6px",
    fontSize: "12px",
    color: "#666",
    cursor: "pointer",
  }
};

export default PropertyList;
