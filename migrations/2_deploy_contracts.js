var DiscountereumToken = artifacts.require("DiscountereumToken");
var DiscountereumCrowdsale = artifacts.require("DiscountereumCrowdsale");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(DiscountereumToken);
  deployer.deploy(DiscountereumCrowdsale, accounts[0], DiscountereumToken.address);
  // deployer.deploy(DiscountereumToken).then(function(){
  //   deployer.deploy(DiscountereumCrowdsale, accounts[0], DiscountereumToken.address);
  // });
};