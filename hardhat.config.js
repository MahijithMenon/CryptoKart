const fs = require('fs');
require('@nomiclabs/hardhat-waffle');

const privateKey = fs.readFileSync('.secret').toString().trim();

module.exports = {
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/P9nzhL_XXp6cRqYyL18D0Gr5dsTxBZ4b',
      accounts: [`0x${privateKey}`],
    },
  },
  solidity: '0.8.4',
};
