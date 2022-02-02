const { ethers } = require("hardhat");
const { writeFile, readFile } = require("fs/promises");
const contractAddress = require("../frontend/src/contracts/contract-address.json");
const VOUCHER_TYPE = {
  NFTVoucher: [
    { name: "redeemer", type: "address" },
    { name: "stageId", type: "uint8" },
    { name: "amount", type: "uint8" },
  ],
};
const stageId = 1;

async function main() {
  const [signer] = await ethers.getSigners();
  // domain data
  const chainId = hre.network.config.chainId;
  console.log("chain ID:", chainId);
  const contractAddr = contractAddress.TinaDAO;
  if (!contractAddr) {
    console.log("[ERROR] contract address not set");
    return;
  }
  const domainData = {
    name: "TinaDAO",
    version: "1",
    chainId: chainId,
    verifyingContract: contractAddr,
  };
  const whitelist = (await readFile("./scripts/whitelist.txt"))
    .toString()
    .split("\n");
  let sigMap = new Map();
  await Promise.all(
    whitelist.map(async (list) => {
      const struct = list.split(" ");
      const redeemer = struct[0];
      const amount = parseInt(struct[1]);
      const voucher = { redeemer, stageId, amount };
      const signature = await signer._signTypedData(
        domainData,
        VOUCHER_TYPE,
        voucher
      );
      sigMap.set(redeemer.toLowerCase(), { voucher, signature });
      return signature;
    })
  );
  console.log("voucher count:", sigMap.size);
  await writeFile(
    "frontend/src/whitelist.json",
    JSON.stringify(Object.fromEntries(sigMap), null, 4)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
