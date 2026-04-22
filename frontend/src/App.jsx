import React, { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import AddProperty from "./pages/AddProperty";
import PropertyList from "./pages/PropertyList";
import "./App.css";

// ─── App.jsx ────────────────────────────────────────────────
// Root component that assembles the three main views.
// The walletAddress and refreshTrigger states are lifted here
// so all child components stay in sync with each other.
// ─────────────────────────────────────────────────────────────
function App() {
  const [walletAddress, setWalletAddress] = useState("");
  // Increment this to trigger a re-fetch in PropertyList
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("list"); // "list" | "add"

  const handlePropertyAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("list"); // Switch to list view after minting/listing
  };

  return (
    <div style={styles.wrapper}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <h1 style={styles.title}>🏠 Decentralized Real Estate Platform</h1>
        <p style={styles.subtitle}>
          Phase 3 · NFT Tokenization on Local Blockchain
        </p>
      </header>

      <main style={styles.main}>
        {/* ── Wallet Connection ── */}
        <WalletConnect onConnect={setWalletAddress} />

        {/* ── Tab Navigation ── */}
        {walletAddress && (
          <div style={styles.tabs}>
            <button
              id="tab-list"
              style={{
                ...styles.tab,
                borderBottom: activeTab === "list" ? "3px solid #3f51b5" : "3px solid transparent",
                color: activeTab === "list" ? "#3f51b5" : "#666",
              }}
              onClick={() => setActiveTab("list")}
            >
              🏘️ All Properties
            </button>
            <button
              id="tab-add"
              style={{
                ...styles.tab,
                borderBottom: activeTab === "add" ? "3px solid #3f51b5" : "3px solid transparent",
                color: activeTab === "add" ? "#3f51b5" : "#666",
              }}
              onClick={() => setActiveTab("add")}
            >
              ➕ Mint / List
            </button>
          </div>
        )}

        {/* ── Views ── */}
        {activeTab === "list" && (
          <PropertyList
            walletAddress={walletAddress}
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeTab === "add" && (
          <AddProperty
            walletAddress={walletAddress}
            onPropertyAdded={handlePropertyAdded}
          />
        )}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Segoe UI', sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  header: {
    backgroundColor: "#1a237e",
    color: "white",
    padding: "20px 32px",
  },
  title: { margin: 0, fontSize: "24px" },
  subtitle: { margin: "4px 0 0", fontSize: "14px", opacity: 0.8 },
  main: { maxWidth: "960px", margin: "24px auto", padding: "0 16px" },
  tabs: {
    display: "flex",
    gap: "4px",
    marginBottom: "16px",
    borderBottom: "1px solid #ddd",
  },
  tab: {
    padding: "10px 20px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "color 0.2s",
  },
};

export default App;
