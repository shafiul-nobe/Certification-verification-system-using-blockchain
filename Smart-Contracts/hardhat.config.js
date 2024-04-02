require("@nomicfoundation/hardhat-toolbox");
require('hardhat-abi-exporter');
require('dotenv').config();
require('solidity-coverage');
require("@nomicfoundation/hardhat-verify");

const NETWORK = process.env.NETWORK || 'hardhat';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const gasPrice = 300000000000 // 300 gwei
module.exports = {
  solidity: "0.8.20",
  defaultNetwork: NETWORK,
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true, // delete old files before export
    flat: true, // all abi json files directly under path
    only: ['Lock']
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/T_v4geCnI2Jta8ginkyrQC7kl9oVlLN2`,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: 'B5BJDZ526T7SINAJRN3TJ7FPU5KAJQACDS',
    }
  }
};
