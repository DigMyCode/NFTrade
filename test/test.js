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

  describe('token distribution', async () => {
    let result

    it('mints tokens', async () => {
      await token.mint(deployer, 'https://www.token-uri.com/nft')
      // It should increase the total supply
      result = await token.totalSupply()
      assert.equal(result.toString(), '1', 'total supply is correct')

      // It increments owner balance
      result = await token.balanceOf(deployer)
      assert.equal(result.toString(), '1', 'balanceOf is correct')

      // Token should belong to owner
      result = await token.ownerOf('1')
      assert.equal(result.toString(), deployer.toString(), 'ownerOf is correct')
      result = await token.tokenOfOwnerByIndex(deployer, 0)

      // Owner can see all tokens
      let balanceOf = await token.balanceOf(deployer)
      let tokenIds = []
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.tokenOfOwnerByIndex(deployer, i)
        tokenIds.push(id.toString())
      }
      let expected = ['1']
      assert.equal(tokenIds.toString(), expected.toString(), 'tokenIds is correct')

      // Token URI is correct
      let tokenURI = await token.tokenURI('1')
      assert.equal(tokenURI, 'https://www.token-uri.com/nft')
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

    // it('allows users to tip images', async () => {
    //   // Track the author balance before purchase
    //   let oldAuthorBalance
    //   oldAuthorBalance = await web3.eth.getBalance(author)
    //   oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

    //   result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })
      
    //   //SUCCESS
    //   const event = result.logs[0].args
    //   assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
    //   assert.equal(event.hash, hash, 'Hash is correct')
    //   assert.equal(event.description, 'Image description', 'description is correct')
    //   assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
    //   assert.equal(event.author, author, 'author is correct')

    //   // Check that author received funds
    //   let newAuthorBalance
    //   newAuthorBalance = await web3.eth.getBalance(author)
    //   newAuthorBalance = new web3.utils.BN(newAuthorBalance)
      
    //   let tipImageOwner
    //   tipImageOwner = web3.utils.toWei('1', 'Ether')
    //   tipImageOwner = new web3.utils.BN(tipImageOwner)

    //   const expectedBalance = oldAuthorBalance.add(tipImageOwner)

    //   assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

    //   // FAILURE: Tries to tip an image that does not exist
    //   await decentragram.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    // })
  })
})