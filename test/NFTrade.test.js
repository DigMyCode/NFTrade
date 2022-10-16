const { assert } = require('chai')

const NFTrade = artifacts.require('./NFTrade.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

  contract('NFTrade', ([deployer, buyer, author]) => {
    let token
  
    before(async () => {
      token = await NFTrade.deployed()
    })
  
    describe('NFTrade deployment', async () => {
      it('NFTrade deploys successfully', async () => {
        const address = token.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
      })
  
    })
  
    describe('images', async () => {
      let result, imageCount
      const hash = 'abc123'
  
      before(async () => {
        result = await token.uploadImage(hash, 'Image description', { from: author })
        imageCount = await token.imageCount()
      })
  
      // Check event
      it('creates images', async () => {
        // SUCCESS
        assert.equal(imageCount, 1)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
        assert.equal(event.hash, hash, 'Hash is correct')
        assert.equal(event.description, 'Image description', 'description is correct')
        assert.equal(event.imgPrice, '1', 'price is correct')
        assert.equal(event.author, author, 'author is correct')
      
        // FAILURE: Image must have hash
        await token.uploadImage('', 'Image description', { from: author }).should.be.rejected;
      
        // FAILURE: Image must have hash
        await token.uploadImage('Image hash', '', { from: author }).should.be.rejected;
      })
  
      // Check from Struct
      it('lists images', async () => {
        const image = await token.images(imageCount)
        assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
        assert.equal(image.hash, hash, 'Hash is correct')
        assert.equal(image.description, 'Image description', 'description is correct')
        assert.equal(image.imgPrice, '1', 'price is correct')
        assert.equal(image.author, author, 'author is correct')      
      })
    })
  
    describe('market', async () => {
      
      before(async () => {
        buyImage = await token.buyImage(imageCount, buyer)
      })
  
      it('able to buy item', async () => {
        assert.equal(imageCount, 1)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
        assert.equal(event.hash, hash, 'Hash is correct')
        assert.equal(event.imgPrice, '1', 'price is correct')
        assert.equal(event.author, author, 'author is correct')   
        assert.equal(event.owner, buyer, 'owner is correct')
      })
    })
  })