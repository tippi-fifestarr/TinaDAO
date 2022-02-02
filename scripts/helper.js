const { BigNumber, utils } = require("ethers");
const fs = require("fs");

module.exports = {
  getTimestamp(date) {
    return BigNumber.from(date.getTime()).div(1000).toNumber();
  },
  parseEther(ether) {
    return utils.parseEther(ether);
  },
  createFolderIfNotExistAndReset(folderPath) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    } else {
      fs.rmSync(folderPath, { recursive: true });
      fs.mkdirSync(folderPath);
    }
  },
  removeFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath);
    }
  },
};
