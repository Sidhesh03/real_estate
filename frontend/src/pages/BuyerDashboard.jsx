import React from "react";
import PropertyList from "./PropertyList";

const BuyerDashboard = ({ walletAddress }) => {
  return (
    <div>
      <div style={styles.header}>
        <h2>🛍️ Buyer Dashboard</h2>
        <p>Browse available properties and make purchases securely on the blockchain.</p>
      </div>
      <PropertyList walletAddress={walletAddress} refreshTrigger={0} />
    </div>
  );
};

const styles = {
  header: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  }
};

export default BuyerDashboard;
