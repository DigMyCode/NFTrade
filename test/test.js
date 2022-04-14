const { assert } = require('chai')

const NFTrade = artifacts.require('./NFTrade.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('NFTrade', ([deployer, author, buyer]) => {
  let nftrade

  before(async () => {
    token = await NFTrade.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = token.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await token.name()
      assert.equal(name, 'NFTrade Token')
    })

    it('has a symbol', async () => {
      const symbol = await token.symbol()
      assert.equal(symbol, 'NFTRADE')
    })
  })
})