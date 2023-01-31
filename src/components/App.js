import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import NFTrade from '../abis/NFTrade.json'
import Navbar from './Navbar'
import Main from './Main'
// import * as fs from 'fs';
import { fs } from 'fs'
import mime from 'mime-types'
import { basename } from 'path'
// import { NFTStorage, File, Blob } from 'nft.storage'
import { NFTStorage, File } from "nft.storage/dist/bundle.esm.min.js";
import { PassThrough } from 'stream';


// Connecting with nft.storage pinning provider to ipfs
const NFT_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGJCNGRjMDRBMzk3NTI2MUEyNWZDOEViOTZhRUE1ZTRENzUzNTc2YjYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY3MjI0NzkyMzE2MywibmFtZSI6Ik5GVHJhZGUifQ.EuKJm0iEVAZEteu8Pf_rRbReSuLu0z9h19xoif9f2Z0'
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = NFTrade.networks[networkId]
    if(networkData) {
      const nftrade = web3.eth.Contract(NFTrade.abi, networkData.address)
      this.setState({ nftrade })
      const itemCount = await nftrade.methods.itemCount().call()
      this.setState({ itemCount })

      // Load images
      for (var i = 1; i <= itemCount; i++) {
        const item = await nftrade.methods.items(i).call()
        this.setState({
          items: [...this.state.items, item]
        })
      }

      this.setState({ loading: false })
    } else {
      window.alert('NFTrade contract is not deployed to detected network.')      
    }
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
  
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
      console.log('file', file)
    }
  }

  uploadImage = (fileData, imageFilename, name, description) => {
    console.log('Submitting file to ipfs...')

    // Adding file to the IPFS
    const type = mime.lookup(imageFilename)
    const metadata = client.store({
      name, 
      description, 
      image: new File([ fileData ], basename(imageFilename), { type })
  }, (error, result) => {
      console.log('Ipfs result', result)
      console.log('IPFS URL', metadata.url)
      console.log('metadata.json contents:\n', metadata.data)
      console.log('metadata.json th IPFS gateway URLs:\n', metadata.embed())

      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.nftrade.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  buyItem = (id) => {
    this.setState({ loading: true })
    console.log(id)
    this.state.nftrade.methods.buyItem(id).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
  })
  }

  // buyItem = (id) => {
  //   id = this.state.item.id
  //   const _seller = this.state.item.seller
  //   const _buyer = this.state.account
  //   this.setState({ loading: true })
  //   this.state.nftrade.methods.safeTransferFrom(_seller, _buyer, id)
  //   this.state.nftrade.methods.approve(_seller, id)
  //   console.log(this.state.nftrade.methods.ownerOf(items.id))
      
  //     this.setState({ loading: false })
  // }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      nftrade: null,
      items: [],
      itemsBalance: [],
      loading: true
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              buyItem={this.buyItem}
              items={this.state.items}
              captureFile={this.captureFile}
              uploadImage={this.uploadImage}
            />
          }
      </div>
    );
  }
}

export default App;