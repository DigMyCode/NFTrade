pragma solidity ^0.5.0;

contract NFTrade {
  string public name = "NFTrade";

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
    images[imageCount] = Image(imageCount, _imgHash, _description, 0, msg.sender);
    
    // Trigger an event
    emit ImageCreated(imageCount, _imgHash, _description, 0, msg.sender);
  }

  // Buy Images
  function buyImage(uint _id) public payable {
    // Make sure the id is valid
    require(_id > 0 && _id <= imageCount);
    
    // Fetch the image
    Image memory _image = images[_id];
    
    // Fetch the author
    address payable _author = _image.author;
    
    // Pay the author by sending them Ether
    address(_author).transfer(msg.value);
    
//     // Increment the tip amount - no needed, md
//     _image.tipAmount = _image.tipAmount + msg.value;
    
    // Update the image
    images[_id] = _image;
    
    // Trigger an event
    emit ImageBought(_id, _image.hash, _image.description, _image.imgPrice, _author);
  }
}