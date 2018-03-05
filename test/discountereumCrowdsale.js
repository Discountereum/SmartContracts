var DiscountereumToken = artifacts.require("./DiscountereumToken.sol");
var DiscountereumCrowdsale = artifacts.require("./DiscountereumCrowdsale.sol");

const BigNumber = web3.BigNumber;

contract('DiscountereumCrowdsale', async function ([owner, investor, wallet, purchaser]) {

  let token;
  let crowdsale;
  const decimals      = 18;
  const cap           = 800000000 * Math.pow(10,decimals);
  const initialSupply = cap * 0.05;

  beforeEach(async function () {
    token = await DiscountereumToken.new();
    crowdsale = await DiscountereumCrowdsale.new(wallet, token.address);
    await token.setSaleAgent(crowdsale.address);
  });

  describe('check saleAgent', function () {
    it("saleAgent is crowdsale address", async () => {
      const saleAgent = await token.saleAgent.call();
      assert.equal(saleAgent, crowdsale.address);
    });
  });

  describe('accepting payments', function () {
    let ether = 2.5;

    it('send', async function () {
      const value = ether * Math.pow(10,18);
      const rate = await crowdsale.rate.call();
      let preBalanceOwner = await token.balanceOf.call(owner);

      await crowdsale.send(value, {from: owner});
      let balance = await token.balanceOf.call(owner);

      assert.equal(balance.valueOf()/1, preBalanceOwner.valueOf()/1 + rate.mul(value)/1);
    });

    it('buyTokens', async function () {
      const value = ether * Math.pow(10,18);
      const rate = await crowdsale.rate.call();
      let preBalanceInvestor = await token.balanceOf.call(investor);

      await crowdsale.buyTokens(investor, {value: value, from: investor});
      let balance = await token.balanceOf.call(investor);

      assert.equal(balance.valueOf()/1, preBalanceInvestor.valueOf()/1 + rate.mul(value)/1);
    });

    it('totalSupply', async function () {
      const value = ether * Math.pow(10,18);
      const rate = await crowdsale.rate.call();

      await crowdsale.buyTokens(investor, {value: value, from: investor});
      let totalSupply = await token.totalSupply.call();

      assert.equal(totalSupply.valueOf(), initialSupply/1 + rate.mul(value)/1);
    });

    it('wallet ether', async function () {
      const value = ether * Math.pow(10,18);
      const rate = await crowdsale.rate.call();
      const preBalanceWei = web3.eth.getBalance(wallet);

      await crowdsale.buyTokens(investor, {value: value, from: investor});

      assert.equal(web3.eth.getBalance(wallet) - preBalanceWei, value);
    });
  });
});