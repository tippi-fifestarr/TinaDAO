const hre = require("hardhat");
const { getTimestamp, parseEther } = require("./helper");
const contractAddress = require("../frontend/src/contracts/contract-address.json");

const name = process.env.ARG_NAME;
const symbol = process.env.ARG_SYMBOL;
const maxSupply = process.env.MAX_SUPPLY;
const baseURI = "https://arweave.net/";

const stageId = 1;
const startTime = 0;
const endTime = getTimestamp(new Date(2022, 2 - 3, 21, 1, 30));
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