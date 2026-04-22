import "@nomicfoundation/hardhat-ethers";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "london"
    }
  },
  networks: {
    ganache: {
      type: "http",
      url: "http://127.0.0.1:7545",
      chainId: 1337
    }
  }
};
