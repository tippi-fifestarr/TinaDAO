const { create, globSource } = require("ipfs-http-client");
const fs = require("fs");
const chalk = require("chalk");
const { createFolderIfNotExistAndReset, removeFile } = require("./helper");

async function main() {
  const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });
  const RAW_IMG_PATH = "./images/raw";
  const REVEALED_PATH = "./images/revealed";
  const PROCESSED_IMG_PATH = "./images/processed";
  const IMAGE_HASH_PATH = "./scripts/imageHash.json";
  const CONFIG_PATH = "./scripts/config.json";

  const addOptions = {
    pin: true,
  };
  const partSize = 25;
  const fileNames = fs.readdirSync(RAW_IMG_PATH, "utf-8");
  let metadataTemplate = JSON.parse(
    fs.readFileSync("./scripts/metadata-template.json")
  );
  const folderNumber = Math.ceil(fileNames.length / partSize);

  // reset
  createFolderIfNotExistAndReset(`${PROCESSED_IMG_PATH}`);
  createFolderIfNotExistAndReset(REVEALED_PATH);
  removeFile(IMAGE_HASH_PATH);

  // rename all files
  const filesToRename = fs.readdirSync(RAW_IMG_PATH);
  for (let i = 0; i < filesToRename.length; i++) {
    fs.renameSync(
      RAW_IMG_PATH + `/${filesToRename[i]}`,
      RAW_IMG_PATH + `/${i}`,
      (err) => console.log(err)
    );
  }

  for (let i = 0; i < folderNumber; ++i) {
    createFolderIfNotExistAndReset(`${PROCESSED_IMG_PATH}/image-part-${i}`);

    const part = fileNames.slice(i * partSize, (i + 1) * partSize);
    for (let file of part) {
      fs.copyFileSync(
        `${RAW_IMG_PATH}/${file}`,
        `${PROCESSED_IMG_PATH}/image-part-${i}/${file}`
      );
    }
    console.log(chalk.green(`Finish copy part-${i}`));
  }
  for (let i = 0; i < folderNumber; ++i) {
    const list = [];

    for await (const file of ipfs.addAll(
      globSource(`${PROCESSED_IMG_PATH}/image-part-${i}`, "**/*"),
      addOptions
    )) {
      const { path, cid } = file;
      const index = path.split(".")[0];
      list.push({ [index]: cid.toString() });
    }
    if (!fs.existsSync(IMAGE_HASH_PATH)) {
      fs.writeFileSync(IMAGE_HASH_PATH, JSON.stringify(list));
    } else {
      let jsonList = fs.readFileSync(IMAGE_HASH_PATH);
      jsonList = JSON.parse(jsonList);
      jsonList = jsonList.concat(list);
      fs.writeFileSync(IMAGE_HASH_PATH, JSON.stringify(jsonList));
    }
    console.log(chalk.blue(`finish writing part-${i}`));
  }
  console.log(chalk.green("successfully generate image hash!"));

  let jsonList = fs.readFileSync(IMAGE_HASH_PATH);
  jsonList = JSON.parse(jsonList);
  for (let json of jsonList) {
    const id = Object.keys(json)[0];
    const cid = Object.values(json)[0];
    console.log(`${id}: ${cid}`);
    metadataTemplate.name = `${process.env.ARG_NAME} #${id}`;
    metadataTemplate.image = `ipfs://${cid}`;
    fs.writeFileSync(
      `${REVEALED_PATH}/${id}`,
      JSON.stringify(metadataTemplate)
    );
  }

  // upload the entire folder
  const files = await ipfs.addAll(globSource(REVEALED_PATH, "**/*"), {
    pin: true,
    wrapWithDirectory: true,
  });

  console.log("IPFS: waiting for all revealed images to be uploaded...");
  for await (const item of files) {
    // Print the directory hash
    if (item.path === "") {
      console.log(`Folder CID: ${item.cid}`);
      let configFile = JSON.parse(fs.readFileSync(CONFIG_PATH));
      configFile.REVEALED_BASEURI = `ipfs://${item.cid}/`;
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(configFile));
    }
  }
}

main();
