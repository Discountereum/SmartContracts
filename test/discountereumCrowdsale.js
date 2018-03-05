var DiscountereumToken = artifacts.require("./DiscountereumToken.sol");
var DiscountereumCrowdsale = artifacts.require("./DiscountereumCrowdsale.sol");

contract('DiscountereumCrowdsale', async function ([owner, investor, wallet, purchaser]) {

  let token;
  let crowdsale;

  beforeEach(async function () {
    token = await DiscountereumToken.new();
    crowdsale = await DiscountereumCrowdsale.new(wallet, token.address);
    await token.transferOwnership(crowdsale.address);
    await crowdsale.claimOwnership();
  });

  describe('check owner', function () {
    it("old owner is correct", async () => {
      const oldOwner = await crowdsale.oldOwnerToken.call();
      assert.equal(oldOwner.valueOf(), owner);
    });

    it("owner token is change", async () => {
      const tokenOwner = await token.owner.call();
      assert.equal(tokenOwner.valueOf(), crowdsale.address);
    });
  });
});