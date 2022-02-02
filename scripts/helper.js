const { BigNumber, utils } = require("ethers");
const fs = require("fs");

module.exports = {
  getTimestamp(date) {
    return BigNumber.from(date.getTime()).div(1000).toNumber();
  },
  parseEther(ether) {
    return utils.parseEther(ether);
  },
  createFolderIfNotExistAndReset(folderName) {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    } else {
      fs.rmSync(folderName, { recursive: true });
      fs.mkdirSync(folderName);
    }
  },
};
