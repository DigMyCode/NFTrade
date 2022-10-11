const NFT = artifacts.require("NFT");
const NFTrade = artifacts.require("NFTrade");

module.exports = function(deployer) {
  deployer.deploy(NFT);
  deployer.deploy(NFTrade, 1);
};