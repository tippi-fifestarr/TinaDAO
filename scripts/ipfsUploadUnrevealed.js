const fs = require("fs");
const { create, globSource } = require("ipfs-http-client");
const { createFolderIfNotExistAndReset } = require("./helper");

const UNREVEALED_DIR = "./images/unrevealed";

async function main() {
  const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });
  console.log("IPFS: waiting for unrevealed image to be uploaded...");
  const file = await ipfs.addAll(
    globSource("./images/beforeReveal.png", "**/*"),
    {
      pin: true,
    }
  );
  let cid;
  for await (const item of file) {
    cid = item.cid;
    console.log(`IPFS: upload done, cid: ${item.cid}`);
  }

  let metadataTemplate = JSON.parse(
    fs.readFileSync("./scripts/metadata-template.json")
  );

  console.log("Metadata template:", metadataTemplate);

  createFolderIfNotExistAndReset(UNREVEALED_DIR);

  for (let i = 0; i < process.env.MAX_SUPPLY; ++i) {
    // for (let i = 0; i < 5; ++i) {
    let metadata = metadataTemplate;
    metadata.name = `${process.env.ARG_NAME} #${i}`;
    metadata.image = cid;
    fs.writeFileSync(`${UNREVEALED_DIR}/${i}`, JSON.stringify(metadata));
  }

  const metadataCount = fs.readdirSync(UNREVEALED_DIR).length;
  // if (metadataCount != process.env.MAX_SUPPLY) {
  //   console.log("Files not uploaded completely, need to rerun this script.");
  //   process.exit();
  // }

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
      console.log(`Folder CID: ${item.cid}`);
    }

    // item.cid;
  }
}
main();
