// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFT.sol";

contract NFTrade is NFT, ReentrancyGuard {
  address payable public immutable feeAccount; // The account that recieves fees   
  uint public immutable feePercent; // The fee percentage on sales
  uint public itemCount = 0;

  constructor(uint _feePercent) {
    feeAccount = payable(msg.sender);
    feePercent = _feePercent;
  }

  // List items
  mapping(uint => Item) public items;

  struct Item {
    uint itemId;
    string hash;
    IERC721 nft;
    uint tokenId;
    string description;
    uint price;
    address payable seller;
    bool sold;
  }

  event Offered(
    uint itemId,
    string hash,
    address indexed nft,
    uint tokenId,
    string description,
    uint price,
    address indexed seller
  );

  event Bought(
    uint itemId,
    string hash,
    address indexed nft,
    uint tokenId,
    uint price,
    address indexed seller,
    address indexed buyer
  );

  // Create NFT item
  function listItem(IERC721 _nft, string memory _hash, string memory _description, uint _tokenId, uint _price) external nonReentrant {
    require(_price > 0, "Price must be greater than 0");

    // Make sure item hash exists
    require(bytes(_hash).length > 0, "Item must have hash");

    // Make sure item description exists
    require(bytes(_description).length > 0, "Item must have description");

    // Make sure upploader address exists
    require(msg.sender != address(0x0), "Initiator'a address can not be 0x0");
    
    // Increment item id
    itemCount ++;

    // Transfer nft 
    _nft.transferFrom(msg.sender, address(this), _tokenId);

    // Add new item to items mapping
    items[itemCount] = Item(
        itemCount,
        _hash,
        _nft,
        _tokenId,
        _description,
        _price,
        payable(msg.sender),
        false
    );

    // Trigger an event
    emit Offered(itemCount, _hash, address(this), _tokenId, _description, _price, msg.sender);
  }

  function getFeePercent() public view returns(uint) {
    return(feePercent);
  }
  
  function purchaseItem(uint _itemId) external payable nonReentrant {
    uint _totalPrice = getTotalPrice(_itemId);
    Item storage item = items[_itemId];
    require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");
    require(msg.value >= _totalPrice, "not enough ether to cover item price with fee");
    require(!item.sold, "item already sold");

    // Pay seller and feeAccount
    item.seller.transfer(item.price);
    feeAccount.transfer(_totalPrice - item.price);

    // Update item to sold
    item.sold = true;

    // Transfer nft to buyer
    item.nft.transferFrom(address(this), msg.sender, item.tokenId);
  }

  function getTotalPrice(uint _itemId) public returns(uint) {
    return(items[_itemId].price = (100 + feePercent)/100);
  }
}