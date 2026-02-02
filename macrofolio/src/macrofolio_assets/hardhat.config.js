require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: '0.8.20',
  networks: {
    polygonAmoy: {
      url: 'https://rpc-amoy.polygon.technology',
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
