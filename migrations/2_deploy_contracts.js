var DiscountereumToken = artifacts.require("DiscountereumToken");

module.exports = function(deployer) {
  deployer.deploy(DiscountereumToken);
};