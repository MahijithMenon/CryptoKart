const fs = require('fs');
require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

const privateKey = fs.readFileSync('.secret').toString().trim();

module.exports = {
  networks: {
    goerli: {
      url: `${process.env.MY_ALCHEMY_RPC_ENDPOINT}`,
      accounts: [`0x${privateKey}`],
    },
  },
  solidity: '0.8.4',
};
