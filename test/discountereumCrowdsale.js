import ether from '../node_modules/zeppelin-solidity/test/helpers//ether';
import { advanceBlock } from '../node_modules/zeppelin-solidity/test/helpers//advanceToBlock';
import { increaseTimeTo, duration } from '../node_modules/zeppelin-solidity/test/helpers//increaseTime';
import latestTime from '../node_modules/zeppelin-solidity/test/helpers/latestTime';
import EVMRevert from '../node_modules/zeppelin-solidity/test/helpers/EVMRevert';

var DiscountereumToken = artifacts.require("./DiscountereumToken.sol");
var DiscountereumCrowdsale = artifacts.require("./DiscountereumCrowdsale.sol");

const BigNumber = web3.BigNumber;

contract('DiscountereumCrowdsale', async function ([owner, investor, wallet, purchaser]) {

  let token;
  let crowdsale;
  let openingTime;
  let closingTime;
  let afterClosingTime;
  const decimals      = 18;
  const capToken      = 800000000 * Math.pow(10,decimals);
  const initialSupply = capToken * 0.05;
  const rate = 10000;
  const cap = 38000 * Math.pow(10,decimals);

  beforeEach(async function () {
    openingTime = latestTime() + duration.weeks(1);
    closingTime = openingTime + duration.weeks(1);

    token = await DiscountereumToken.new();
    crowdsale = await DiscountereumCrowdsale.new(wallet, token.address, openingTime, closingTime);
    await token.setSaleAgent(crowdsale.address);
  });

  describe('check cap', function () {
    it("cap is 38000 ether", async () => {
       let _cap = await crowdsale.cap.call();
       assert.equal(_cap.valueOf(), cap);
    });
  });

  describe('check rate', function () {
    it("cap is 10000 DSCT for 1 wei", async () => {
       let _rate = await crowdsale.rate.call();
       assert.equal(_rate.valueOf(), rate);
    });
  });

  describe('check reject before and end time', function () {
    it('before', async function () {
      let err = '';
      try { await crowdsale.send(2, {from: owner}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });

    it('before', async function () {
      await increaseTimeTo(closingTime + duration.seconds(1));
      let err = '';
      try { await crowdsale.send(2, {from: owner}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });
  });



  describe('check saleAgent', function () {
    it("saleAgent is crowdsale address", async () => {
      await increaseTimeTo(openingTime);
      const saleAgent = await token.saleAgent.call();
      assert.equal(saleAgent, crowdsale.address);
    });
  });

  describe('check payment', function () {
    let ether = 2.5;

    it('send', async function () {
      await increaseTimeTo(openingTime);
      const value = ether * Math.pow(10,18);
      const rate = await crowdsale.rate.call();
      let preBalanceOwner = await token.balanceOf.call(owner);

      await crowdsale.send(value, {from: owner});
      let balance = await token.balanceOf.call(owner);

      assert.equal(balance.valueOf()/1, preBalanceOwner.valueOf()/1 + rate.mul(value)/1);
    });

    it('buyTokens', async function () {
      await increaseTimeTo(openingTime);
      const value = ether * Math.pow(10,18);
      const rate = await crowdsale.rate.call();
      let preBalanceInvestor = await token.balanceOf.call(investor);

      await crowdsale.buyTokens(investor, {value: value, from: investor});
      let balance = await token.balanceOf.call(investor);

      assert.equal(balance.valueOf()/1, preBalanceInvestor.valueOf()/1 + rate.mul(value)/1);
    });

    it('totalSupply', async function () {
      await increaseTimeTo(openingTime);
      const value = ether * Math.pow(10,18);
      const rate = await crowdsale.rate.call();

      await crowdsale.buyTokens(investor, {value: value, from: investor});
      let totalSupply = await token.totalSupply.call();

      assert.equal(totalSupply.valueOf(), initialSupply/1 + rate.mul(value)/1);
    });

    it('wallet ether', async function () {
      await increaseTimeTo(openingTime);
      const value = ether * Math.pow(10,18);
      const rate = await crowdsale.rate.call();
      const preBalanceWei = web3.eth.getBalance(wallet);

      await crowdsale.buyTokens(investor, {value: value, from: investor});

      assert.equal(web3.eth.getBalance(wallet) - preBalanceWei, value);
    });

    it('without saleAgent', async function () {
      await increaseTimeTo(openingTime);
      await token.setSaleAgent(0x0);
      let err = '';
      try { await crowdsale.send(2, {from: owner}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });
  });
});