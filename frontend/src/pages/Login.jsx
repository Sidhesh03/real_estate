import React from "react";
import WalletConnect from "../components/WalletConnect";

const Login = ({ onConnect }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏠 Decentralized Real Estate</h1>
        <p style={styles.subtitle}>
          Welcome to the future of property trading. Connect your MetaMask wallet to access your dedicated role-based dashboard.
        </p>
        
        <div style={styles.walletContainer}>
          <WalletConnect onConnect={onConnect} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    maxWidth: "480px",
    textAlign: "center",
  },
  title: {
    color: "#1a237e",
    marginBottom: "16px",
    fontSize: "28px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  walletContainer: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    border: "1px dashed #ccc",
  }
};

export default Login;
