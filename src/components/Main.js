import React, { Component } from 'react';
import Identicon from 'identicon.js';
import NFTrade from '../abis/NFTrade.json';
import App from './App.js'

class Main extends Component {

  onSubmitForm(event) {
    event.preventDefault()
    const fileInput = document.getElementById('upload');   
    const name = fileInput.files[0].name
    const description = this.description.value
    this.props.listItem(this.props.buffer, name, 'NFTname', description)
  }

  render() {
    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
      
              <h2>Sell image</h2>
      
              <form onSubmit={ (event) => this.onSubmitForm(event) }>
                <input multiple type='file' id='upload' accept='image/*' onChange={this.props.captureFile} />
                <div className='form-group mr-sm-2'>
                  <br></br>
                    <input
                      id='description'
                      type='text'
                      ref={(input) => { this.description = input }}
                      className='form-control'
                      placeholder='Item description...'
                      required />
                  </div>
                  <button type='submit' className='btn btn-primary btn-block btn-lg'>Upload!</button>
              </form>

              <p>&nbsp;</p>
              { this.props.items.map((item, key) => {
              return(
              <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <img
                        className='mr-2'
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(item.imgOwner, 30).toString()}`}
                      />
                      <small className="text-muted">{item.author}</small>
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${item.hash}`} style={{ maxWidth: '420px' }}/></p>
                        <p>{item.description}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <small className="float-left mt-1 text-muted">
                          Price: {window.web3.utils.fromWei(item.price.toString(), 'Ether')} ETH
                        </small>
                        <button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={item.id}
                          onClick={(event) => {
                            let price = window.web3.utils.toWei(item.price.toString(), 'Ether')
                            console.log(event.target.name, item.seller, price)
                            this.props.purchaseItem(event.target.name)
                          }}
                        >
                          Buy
                        </button>
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Main;
