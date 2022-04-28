pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTrade is ReentrancyGuard {
  address payable public immutable feeAcount; // The account that recieves fees   
  uint public immutable feePercent; // The fee percentage on sales
  uint public itemCount;

  constructor(uint _feePercent) {
      feeAcount = payable(msg.sender);
      feePercent = _feePercent;
    }

  // function mint(address _to, string memory _tokenURI) public returns(bool) {
  //   uint _tokenId = totalSupply().add(1);
  //   _mint(_to, _tokenId);
  //   _setTokenURI(_tokenId, _tokenURI);
  //   return true;
  // }

  // Store Images
  mapping(uint => Image) public images;

  struct Image {
    uint itemId;
    string hash;
    IERC721 nft;
    string description;
    uint price;
    address payable seller;
    bool sold;
  }

  event Offered(
    uint itemId, 
    address indexed nft, 
    uint tokenId, 
    uint price, 
    address indexed seller
  );

  event Bought(
    uint itemId, 
    address indexed nft, 
    uint tokenId, 
    uint price, 
    address indexed seller,
    address indexed buyer
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
    itemCount ++;

    // Add Image to contract
    images[itemCount] = Image(itemCount, _imgHash, _description, 1, msg.sender, msg.sender);
    
    // Trigger an event
    emit ImageCreated(itemCount, _imgHash, _description, 1, msg.sender, msg.sender);
  }

  // in development

  function buyItem(uint _itemId, address payable _buyer) public payable {
    // Make sure the id is valid
    require(_itemId > 0 && _itemId <= itemCount);
    
    // Fetch the image
    Image memory _image = images[_itemId];

    // Fetch the owner
    address payable _owner = _image.imgOwner;

    // Pay the owner, obtain Item
    transferFromERC20(_buyer, _owner, _image.price);
    safeTransferFrom(_owner, _buyer, _itemId);

    emit ImageBought(itemCount, _image.hash, _image.description, 1, _image.author, _buyer);
  }
}