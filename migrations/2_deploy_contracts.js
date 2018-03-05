var DiscountereumToken = artifacts.require("DiscountereumToken");
var DiscountereumCrowdsale = artifacts.require("DiscountereumCrowdsale");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(DiscountereumToken).then(function(){
    const openingTime = 1592611200; // 20.06.2020 (http://www.onlineconversion.com/unix_time.htm)
    const closingTime = 1624147200; // 20.06.2021
    deployer.deploy(DiscountereumCrowdsale, accounts[0], DiscountereumToken.address, openingTime, closingTime);
  });
};