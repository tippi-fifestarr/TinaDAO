/// ENVVAR
// - CI:                output gas report to file instead of stdout
// - COVERAGE:          enable coverage report
// - ENABLE_GAS_REPORT: enable gas report
// - COMPILE_MODE:      production modes enables optimizations (default: development)
// - COMPILE_VERSION:   compiler version (default: 0.8.4)
// - COINMARKETCAP:     coinmarkercat api key for USD value in gas report

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("dotenv").config();

const argv = require("yargs/yargs")()
  .env("")
  .options({
    ci: {
      type: "boolean",
      default: false,
    },
    coverage: {
      type: "boolean",
      default: false,
    },
    gas: {
      alias: "enableGasReport",
      type: "boolean",
      default: false,
    },
    mode: {
      alias: "compileMode",
      type: "string",
      choices: ["production", "development"],
      default: "development",
    },
    compiler: {
      alias: "compileVersion",
      type: "string",
      default: "0.8.4",
    },
    coinmarketcap: {
      alias: "coinmarketcapApiKey",
      type: "string",
    },
  }).argv;

if (argv.enableGasReport) {
  require("hardhat-gas-reporter");
}

const withOptimizations =
  argv.enableGasReport || argv.compileMode === "production";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: argv.compiler,
    settings: {
      optimizer: {
        enabled: withOptimizations,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      blockGasLimit: 10000000,
      allowUnlimitedContractSize: !withOptimizations,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 1,
    },
    kovan: {
      url: process.env.KOVAN_RPC_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 42,
    },
    ropsten: {
      url: process.env.ROPSTEN_RPC_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 3,
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 4,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      chainId: 137,
    },
  },
  gasReporter: {
    currency: "USD",
    outputFile: argv.ci ? "gas-report.txt" : undefined,
    coinmarketcap: argv.coinmarketcap,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API,
    // apiKey: process.env.POLYGONSCAN_API,
  },
};

if (argv.coverage) {
  require("solidity-coverage");
  module.exports.networks.hardhat.initialBaseFeePerGas = 0;
}
