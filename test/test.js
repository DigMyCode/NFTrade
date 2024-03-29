const { assert } = require('chai')

const NFT = artifacts.require('./NFT.sol')
const NFTrade = artifacts.require('./NFTrade.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

  let toWei = (number) => web3.utils.toWei(number, 'ether')

  contract('NFT', (accounts) => {
    let nft
    
  
    before(async () => {
      nft = await NFT.deployed()
    })

    describe('NFT deployment', async () => {
      it('NFT deploys successfully', async () => {
        const address = nft.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
      })
      
      it('has a name', async () => {
        const name = await nft.name()
        assert.equal(name, 'NFTrade NFT')
      })
  
      it('has a symbol', async () => {
        const symbol = await nft.symbol()
        assert.equal(symbol, 'NFTRADE')
      })
    })
  
    describe('token distribution', async () => {
      let result
  
      it('mints tokens', async () => {
        await nft.mint(accounts[0], 'https://www.token-uri.com/nft')
        // It should increase the total supply
        result = await nft.totalSupply()
        assert.equal(result.toString(), '1', 'total supply is correct')
  
        // It increments owner balance
        result = await nft.balanceOf(accounts[0])
        assert.equal(result.toString(), '1', 'balanceOf is correct')
  
        // Token should belong to owner
        result = await nft.ownerOf('1')
        assert.equal(result.toString(), accounts[0].toString(), 'ownerOf is correct')
        result = await nft.tokenOfOwnerByIndex(accounts[0], 0)
  
        // Owner can see all tokens
        let balanceOf = await nft.balanceOf(accounts[0])
        let tokenIds = []
        for (let i = 0; i < balanceOf; i++) {
          let id = await nft.tokenOfOwnerByIndex(accounts[0], i)
          tokenIds.push(id.toString())
        }
        let expected = ['1']
        assert.equal(tokenIds.toString(), expected.toString(), 'tokenIds is correct')
  
        // Token URI is correct
        let tokenURI = await nft.tokenURI('1')
        assert.equal(tokenURI, 'https://www.token-uri.com/nft')
      })
    })
  })

  contract('NFTrade', ([author, buyer]) => {
    const hash = 'abc123'

    before(async () => {
      marketplace = await NFTrade.deployed()
    })
  
    describe('NFTrade deployment', async () => {
      it('NFTrade deploys successfully', async () => {
        const address = marketplace.address
        const feePercent = await marketplace.getFeePercent()
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
        assert.equal(feePercent, 1, 'Fee percent is correct')
      })
  
    })
  
    describe('items', async () => {
      let result, itemCount

      before(async () => {
        // Author mints nft
        await marketplace.mint(author, 'https://www.token-uri.com/nft', { from: author } )
        // Author approves marketplace to spend nft
        await marketplace.setApprovalForAll(marketplace.address, true)
        result = await marketplace.listItem(marketplace.address, hash, 'Item description', 1, toWei('0.1'), { from: author })
        itemCount = await marketplace.itemCount()
      })
  
      // Check event
      it('creates an item', async () => {
        // SUCCESS
        assert.equal(itemCount, 1)
        // Fetching the listItem() output arguments
        const event = result.logs[1].args
        assert.equal(event.itemId.toNumber(), itemCount, 'Item id is correct')
        assert.equal(event.hash, hash, 'Hash is correct')
        assert.equal(event.description, 'Item description', 'Item description is correct')
        assert.equal(event.tokenId.toNumber(), itemCount, 'Token id is correct')
        assert.equal(event.price, toWei('0.1'), 'Price is correct')
        assert.equal(event.seller, author, 'Owner is correct')

        // FAILURE: Image must have hash
        await marketplace.listItem('', 'Image description', { from: author }).should.be.rejected;
      
        // FAILURE: Image must have hash
        await marketplace.listItem('Image hash', '', { from: author }).should.be.rejected;
      })
  
      // Check from Struct
      it('lists item', async () => {
        const item = await marketplace.items(itemCount)
        assert.equal(item.itemId.toNumber(), itemCount.toNumber(), 'id is correct')
        assert.equal(item.hash, hash, 'Hash is correct')
        assert.equal(item.tokenId.toNumber(), itemCount.toNumber(), 'id is correct')
        assert.equal(item.price, toWei('0.1'), 'price is correct')
        assert.equal(item.seller, author, 'author is correct')
      })
    })
  
    describe('market', async () => {
      let result, itemCount

      before(async () => {
        // Author mints nft
        await marketplace.mint(author, 'https://www.token-uri.com/nft', { from: author } )
        // Author approves marketplace to spend nft
        await marketplace.setApprovalForAll(marketplace.address, true)
        // Author litst nft
        await marketplace.listItem(marketplace.address, hash, 'Item description', 2, toWei('0.1'), { from: author })
        itemCount = await marketplace.itemCount() 
        // Buyer tries to buy nft
        result = await marketplace.purchaseItem(itemCount, { from: buyer, value: toWei('0.101') })
      })
      
      it('able to buy item', async () => {
        // Check from event Bought
        assert.equal(itemCount, 2)
        const event = result.logs[1].args
        console.log(event)
        // Check whether the itemId, hash and tokenId are correct
        assert.equal(event.itemId.toNumber(), itemCount.toNumber(), 'Item id is correct')
        assert.equal(event.hash, hash, 'Hash is correct')
        assert.equal(event.tokenId.toNumber(), itemCount.toNumber(), 'Token id is correct')
        // Check the total price is correct
        assert.equal(event.price, toWei('0.101'), 'Price is correct')
        // Check the seller is correct
        assert.equal(event.seller, author, 'Author is correct')
        // Check the buyer is correct
        assert.equal(event.buyer, buyer, 'Owner is correct')
        // Check the item is sold
        assert.equal(event.sold, true, 'Item is sold')
      })
    })
  })
