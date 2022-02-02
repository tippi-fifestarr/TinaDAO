const fs = require("fs");
const { create, globSource } = require("ipfs-http-client");
const { createFolderIfNotExist } = require("./helper");

async function main() {
  const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });
  console.log("IPFS: waiting for unrevealed image to be uploaded...");
  const { cid } = await ipfs.add(globSource("./images/beforeReveal.png", "*"), {
    pin: true,
  });
  console.log(`IPFS: upload done, cid: ${cid}`);

  let metadataTemplate = JSON.parse(
    fs.readFileSync("./scripts/metadata-template.json")
  );

  console.log("Metadata created:", metadataTemplate);

  createFolderIfNotExist("./images/unrevealed/");

  for (let i = 0; i < process.env.MAX_SUPPLY; ++i) {
    let metadata = metadataTemplate;
    metadata.name = `${process.env.ARG_NAME} #${i}`;
    metadata.image = cid;
    fs.writeFileSync(`./images/unrevealed/${i}`, JSON.stringify(metadata));
  }
}
main();
