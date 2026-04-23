import React, { useState } from "react";
import AddProperty from "./AddProperty";
import PropertyList from "./PropertyList";

const ListerDashboard = ({ walletAddress }) => {
  const [activeTab, setActiveTab] = useState("mint");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePropertyAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("list");
  };

  return (
    <div>
      <div style={styles.header}>
        <h2>🏢 Seller / Lister Dashboard</h2>
        <p>Mint new properties as NFTs and list them on the marketplace.</p>
        
        <div style={styles.tabs}>
          <button 
            style={{...styles.tab, borderBottom: activeTab === "mint" ? "3px solid #3f51b5" : "none"}}
            onClick={() => setActiveTab("mint")}
          >
            ➕ Mint / List Property
          </button>
          <button 
            style={{...styles.tab, borderBottom: activeTab === "list" ? "3px solid #3f51b5" : "none"}}
            onClick={() => setActiveTab("list")}
          >
            🏘️ View All Properties
          </button>
        </div>
      </div>

      {activeTab === "mint" ? (
        <AddProperty walletAddress={walletAddress} onPropertyAdded={handlePropertyAdded} />
      ) : (
        <PropertyList walletAddress={walletAddress} refreshTrigger={refreshTrigger} />
      )}
    </div>
  );
};

const styles = {
  header: {
    backgroundColor: "white",
    padding: "20px 20px 0 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  tab: {
    padding: "10px 20px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333"
  }
};

export default ListerDashboard;
