import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import NFTrade from '../abis/NFTrade.json'
import Navbar from './Navbar'
import Main from './Main'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

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
      const imagesCount = await nftrade.methods.itemCount().call()
      this.setState({ imagesCount })

      // Load images
      for (var i = 1; i <= imagesCount; i++) {
        const image = await nftrade.methods.images(i).call()
        this.setState({
          images: [...this.state.images, image]
        })
      }

      this.setState({ loading: false })
    } else {
      window.alert('NFTrade contract is not deployed to detected network')      
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
    }
  }

  uploadImage = description => {
    console.log('Submitting file to ipfs...')

    // Adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
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
  //   id = this.state.image.id
  //   const _seller = this.state.image.author
  //   const _buyer = this.state.account
  //   this.setState({ loading: true })
  //   this.state.nftrade.methods.safeTransferFrom(_seller, _buyer, id)
  //   this.state.nftrade.methods.approve(_seller, id)
  //   console.log(this.state.nftrade.methods.ownerOf(images.id))
      
  //     this.setState({ loading: false })
  // }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      nftrade: null,
      images: [],
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
              images={this.state.images}
              captureFile={this.captureFile}
              uploadImage={this.uploadImage}
            />
          }
      </div>
    );
  }
}

export default App;