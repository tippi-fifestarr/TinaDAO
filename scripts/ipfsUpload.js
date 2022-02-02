const fs = require("fs");
const { create, globSource } = require("ipfs-http-client");
const { createFolderIfNotExistAndReset } = require("./helper");

const UNREVEALED_DIR = "./images/unrevealed";

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

  createFolderIfNotExistAndReset(UNREVEALED_DIR);

  for (let i = 0; i < process.env.MAX_SUPPLY; ++i) {
    let metadata = metadataTemplate;
    metadata.name = `${process.env.ARG_NAME} #${i}`;
    metadata.image = cid;
    fs.writeFileSync(`${UNREVEALED_DIR}/${i}`, JSON.stringify(metadata));
  }

  const metadataCount = fs.readdirSync(UNREVEALED_DIR).length;
  if (metadataCount != process.env.MAX_SUPPLY) {
    console.log("Files not uploaded completely, need to rerun this script.");
    process.exit();
  }

  console.log(
    `All data written to unrevealed folder, it now has ${metadataCount} files.`
  );

  // upload the entire folder
  const files = await ipfs.addAll(globSource(UNREVEALED_DIR, "**/*"), {
    pin: true,
    wrapWithDirectory: true,
  });

  console.log("IPFS: waiting for all unrevealed images to be uploaded...");
  for await (const item of files) {
    // Print the directory hash
    if (item.path === "") {
      console.log(
        `Check the uploaded folder at: https://ipfs.io/ipfs/${item.cid}`
      );
    }
  }
}
main();
