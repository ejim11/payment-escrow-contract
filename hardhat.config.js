require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("solidity-coverage");
require("dotenv").config();
require("hardhat-deploy-ethers");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */

const TEST_POLYGON_URL =
    process.env.TEST_POLYGON_URL || "https:\\eth-POLYGON/example";
const TEST_PRIVATE_KEY = process.env.TEST_PRIVATE_KEY || "key";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "key";
const COIN_MARKET_CAP_API_KEY = process.env.COIN_MARKET_CAP_API_KEY || "key";

module.exports = {
    solidity: "0.8.18",
    networks: {
        mumbai: {
            url: TEST_POLYGON_URL,
            accounts: [TEST_PRIVATE_KEY],
            chainId: 80001,
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: {
            polygonMumbai: POLYGONSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COIN_MARKET_CAP_API_KEY,
        token: "MATIC",
    },
    namedAccounts: {
        payer: {
            default: 0,
        },
        arbiter: {
            default: 1,
        },
        beneficiary: {
            default: 2,
        },
    },
};
