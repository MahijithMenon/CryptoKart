const fs = require('fs');
require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

const privateKey = fs.readFileSync('.secret').toString().trim();

module.exports = {
  defaultNetwork: 'matic',
  networks: {
    hardhat: {},
    matic: {
      url: process.env.NEXT_PUBLIC_ALCHEMY_API_URL,
      accounts: [`0x${privateKey}`],
    },
  },
  solidity: '0.8.4',
};
