import React, { useState, useEffect } from "react";
import { grantListerRole, revokeListerRole, getAllProperties } from "../services/web3Service";

const AdminDashboard = () => {
  const [address, setAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, forSale: 0, sold: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const properties = await getAllProperties();
      const total = properties.length;
      const forSale = properties.filter(p => p.isForSale).length;
      const sold = total - forSale; // Simple approximation
      setStats({ total, forSale, sold });
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    }
  };

  const handleGrant = async () => {
    if (!address) return;
    setLoading(true);
    setStatusMsg("");
    try {
      await grantListerRole(address);
      setStatusMsg("✅ Successfully granted LISTER role.");
    } catch (error) {
      console.error(error);
      setStatusMsg("❌ Failed to grant role. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!address) return;
    setLoading(true);
    setStatusMsg("");
    try {
      await revokeListerRole(address);
      setStatusMsg("✅ Successfully revoked LISTER role.");
    } catch (error) {
      console.error(error);
      setStatusMsg("❌ Failed to revoke role. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h2>⚙️ Admin Dashboard</h2>
        <p>Platform Analytics and Role Management</p>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Minted</h3>
          <p style={styles.statValue}>{stats.total}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>For Sale</h3>
          <p style={styles.statValue}>{stats.forSale}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Sold</h3>
          <p style={styles.statValue}>{stats.sold}</p>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.title}>Role Management</h3>
        <p style={styles.subtitle}>Authorize real estate agents to mint and list properties.</p>

        <div style={styles.formGroup}>
          <label style={styles.label}>Wallet Address:</label>
          <input
            type="text"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={handleGrant} disabled={loading} style={styles.grantButton}>
            {loading ? "Processing..." : "Authorize Lister"}
          </button>
          <button onClick={handleRevoke} disabled={loading} style={styles.revokeButton}>
            {loading ? "Processing..." : "Revoke Lister"}
          </button>
        </div>

        {statusMsg && <p style={styles.status}>{statusMsg}</p>}
      </div>
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
  },
  statsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1a237e",
    color: "white",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  statTitle: { margin: 0, fontSize: "16px", opacity: 0.9 },
  statValue: { margin: "10px 0 0", fontSize: "32px", fontWeight: "bold" },
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  },
  title: { marginTop: 0, fontSize: "20px", color: "#333" },
  subtitle: { color: "#666", marginBottom: "20px", fontSize: "14px" },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  buttonGroup: { display: "flex", gap: "12px", marginTop: "16px" },
  grantButton: {
    padding: "10px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    flex: 1
  },
  revokeButton: {
    padding: "10px 16px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    flex: 1
  },
  status: { marginTop: "16px", fontWeight: "bold", color: "#333" }
};

export default AdminDashboard;
