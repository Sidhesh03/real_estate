# Decentralized Blockchain-Based Real Estate Platform

This is the Phase 1 Setup for a Hybrid Architecture DApp.

## Project Structure
- **`backend-java/`**: Spring Boot application using Web3j to integrate with the blockchain.
- **`blockchain/`**: Hardhat development environment containing Solidity smart contracts and deployment scripts.
- **`frontend/`**: React application bootstrapped with Vite, containing a simple UI to connect to MetaMask.

## Running Locally

### 1. Ganache (Local Blockchain)
- Start your Ganache instance.
- Default expected configuration: `http://127.0.0.1:7545` (Network ID: 1337).

### 2. Backend (Spring Boot)
```bash
cd backend-java
mvn spring-boot:run
```
- Test API: `http://localhost:8080/api/test`

### 3. Blockchain (Hardhat)
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.cjs --network ganache
```

### 4. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173/` in your browser.
