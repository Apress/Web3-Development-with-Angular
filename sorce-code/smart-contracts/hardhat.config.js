require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.7.3",
  networks: {
    localhost: { url: "http://127.0.0.1:8545" }
  }
};
