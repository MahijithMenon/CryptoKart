const fs = require('fs');
require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

const privateKey = fs.readFileSync('.secret').toString().trim();

module.exports = {
  networks: {
    hardhat: {},
    sepolia: {
      url: `${process.env.ALCHEMY_URL}`,
      accounts: [`0x${privateKey}`],
    },
  },
  solidity: '0.8.4',
};
