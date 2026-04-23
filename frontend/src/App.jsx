import React, { useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ListerDashboard from "./pages/ListerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import { getUserRole } from "./services/web3Service";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [userRole, setUserRole] = useState(null); // "admin", "lister", "buyer"

  const handleConnect = async (address) => {
    setWalletAddress(address);
    if (address) {
      const role = await getUserRole(address);
      setUserRole(role);
    } else {
      setUserRole(null);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress("");
    setUserRole(null);
  };

  return (
    <div style={styles.wrapper}>
      {/* ── Global Header ── */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🏠 Decentralized Real Estate Platform</h1>
          <p style={styles.subtitle}>Phase 4 · Advanced Role-Based Dashboards</p>
        </div>
        {walletAddress && (
          <div style={styles.headerRight}>
            <span style={styles.roleBadge}>Role: {userRole?.toUpperCase()}</span>
            <button onClick={handleDisconnect} style={styles.disconnectBtn}>Disconnect</button>
          </div>
        )}
      </header>

      <main style={styles.main}>
        {/* ── Routing Logic ── */}
        {!walletAddress ? (
          <Login onConnect={handleConnect} />
        ) : (
          <>
            {userRole === "admin" && <AdminDashboard />}
            {userRole === "lister" && <ListerDashboard walletAddress={walletAddress} />}
            {userRole === "buyer" && <BuyerDashboard walletAddress={walletAddress} />}
          </>
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
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  roleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: "6px 12px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  disconnectBtn: {
    backgroundColor: "transparent",
    color: "white",
    border: "1px solid rgba(255,255,255,0.5)",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  title: { margin: 0, fontSize: "20px" },
  subtitle: { margin: "4px 0 0", fontSize: "13px", opacity: 0.8 },
  main: { maxWidth: "1000px", margin: "24px auto", padding: "0 16px" },
};

export default App;
