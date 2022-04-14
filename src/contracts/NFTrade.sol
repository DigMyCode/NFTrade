pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract NFTrade is ERC721Full {
  constructor() ERC721Full("NFTrade Token", "NFTRADE") public {
  }

  function mint(address _to, string memory _tokenURI) public returns(bool) {
    uint _tokenId = totalSupply().add(1);
    _mint(_to, _tokenId);
    _setTokenURI(_tokenId, _tokenURI);
    return true;
  }  

  // Store Images
  uint public imageCount = 0;
  mapping(uint => Image) public images;


  struct Image {
    uint id;
    string hash;
    string description;
    uint imgPrice;
    address payable author;
  }

  event ImageCreated(
    uint id,
    string hash,
    string description,
    uint imgPrice,
    address payable author
  );

  event ImageBought(
    uint id,
    string hash,
    string description,
    uint imgPrice,
    address payable author
  );

  // Create NFT image
  function uploadImage(string memory _imgHash, string memory _description) public {
    // Make sure image hash exists
    require(bytes(_imgHash).length > 0);

    // Make sure image description exists
    require(bytes(_description).length > 0);
    
    // Make sure upploader address exists
    require(msg.sender != address(0x0));
    
    // Increment image id
    imageCount ++;

    // Add Image to contract
    images[imageCount] = Image(imageCount, _imgHash, _description, 1, msg.sender);
    
    // Trigger an event
    emit ImageCreated(imageCount, _imgHash, _description, 1, msg.sender);
  }

//   // Buy Images
//   function buyImage(uint _id) public payable {
//     // Make sure the id is valid
//     require(_id > 0 && _id <= imageCount);
    
//     // Fetch the image
//     Image memory _image = images[_id];
    
//     // Fetch the author
//     address payable _author = _image.author;
    
//     // Pay the author by sending them Ether
//     address(_author).transfer(msg.value);
    
//     // Increment the tip amount - no needed, md
//     _image.tipAmount = _image.tipAmount + msg.value;
    
//     // Update the image
//     images[_id] = _image;
    
//     // Trigger an event
//     emit ImageBought(_id, _image.hash, _image.description, _image.imgPrice, _author);
//   }
}