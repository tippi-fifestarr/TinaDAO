const hre = require("hardhat");
const fs = require("fs");
const { getTimestamp, parseEther } = require("./helper");
const contractAddress = require("../frontend/src/contracts/contract-address.json");
const CONFIG_PATH = "./scripts/config.json";

const name = process.env.ARG_NAME;
const symbol = process.env.ARG_SYMBOL;
const maxSupply = process.env.MAX_SUPPLY;
let configFile = JSON.parse(fs.readFileSync(CONFIG_PATH));
const baseURI = configFile.UNREVEALED_BASEURI;

const stageId = 1;
const startTime = 0;
const endTime = getTimestamp(new Date(process.env.ARG_ENDTIME));
const mintPrice = parseEther("0.1");

const stageInfo = {
  stageId,
  maxSupply,
  startTime,
  endTime,
  mintPrice,
};

async function main() {
  // verify contracts
  await hre.run("verify:verify", {
    address: contractAddress.TinaDAO,
    constructorArguments: [name, symbol, stageInfo, baseURI],
  });
}

main();
