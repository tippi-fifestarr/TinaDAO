const { artifacts, ethers, network } = require("hardhat");
const { getTimestamp, parseEther } = require("./helper");
const fs = require("fs");
const contractsDir = __dirname + "/../frontend/src/contracts";
const CONFIG_PATH = "./scripts/config.json";

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // TinaDAO contract initial deploy params
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

  const TinaDAO = await ethers.getContractFactory("TinaDAO");

  const tinaDAO = await TinaDAO.deploy(name, symbol, stageInfo, baseURI);

  await tinaDAO.deployed();

  console.log("TinaDAO address:", tinaDAO.address);

  // We also save the contract's artifacts and address in the frontend directory
  initFrontendFile();
  saveFrontendFiles(tinaDAO, "TinaDAO");
  endFrontendFile();
}

function initFrontendFile() {
  fs.writeFileSync(contractsDir + "/contract-address.json", "{\n");
}
function endFrontendFile() {
  fs.appendFileSync(contractsDir + "/contract-address.json", "\n}");
}

let fileCount = 0;
function saveFrontendFiles(contract, contractName) {
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.appendFileSync(
    contractsDir + "/contract-address.json",
    `${fileCount === 0 ? "" : ",\n"}"${contractName}": "${contract.address}"`
  );
  fs.writeFileSync(
    contractsDir + `/${contractName}.json`,
    JSON.stringify(artifacts.readArtifactSync(contractName), null, 2)
  );

  fileCount++;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
