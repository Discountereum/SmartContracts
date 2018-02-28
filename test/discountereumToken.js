var DiscountereumToken = artifacts.require("./DiscountereumToken.sol");

contract('DiscountereumToken', function(accounts) {
  it("should put 40000000**18 DiscountereumToken owner account", function() {
    return DiscountereumToken.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 40000000 * Math.pow(10,18), "40000000**18 wasn't in the first account");
    });
  });
});