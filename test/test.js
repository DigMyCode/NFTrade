const { assert } = require('chai')

const NFTrade = artifacts.require('./NFTrade.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('NFTrade', ([deployer, author, tipper]) => {
  let nftrade

  before(async () => {
    nftrade = await NFTrade.deployed()
  })

})