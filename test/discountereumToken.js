const DiscountereumToken = artifacts.require("./DiscountereumToken.sol");

contract('DiscountereumToken', async ([owner, recipient, anotherAccount]) => {

  const decimals      = 18;
  const cap           = 800000000 * Math.pow(10,decimals);
  const initialSupply = cap * 0.05;
  const defaultPaused  = false;
  let token;

  beforeEach(async function () {
    token = await DiscountereumToken.new();
  });

  describe('onlyOwner', function () {
    it("pause", async () => {
      let err = '';
      try { await token.pause({from: anotherAccount}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });

    it("unpause", async () => {
      let err = '';
      await token.pause();
      try { await token.unpause({from: anotherAccount}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });

    it("addToWhitelistAccount", async () => {
      let err = '';
      try { await token.addToWhitelistAccount(anotherAccount, {from: anotherAccount}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });

    it("removeFromWhitelistAccount", async () => {
      let err = '';
      try { await token.removeFromWhitelistAccount(anotherAccount, {from: anotherAccount}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });

    it("mint", async () => {
      let err = '';
      try { await token.mint(anotherAccount, 100, {from: anotherAccount}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });

    it("finishMinting", async () => {
      let err = '';
      try { await token.finishMinting({from: anotherAccount}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });

    it("setSaleAgent", async () => {
      let err = '';
      try { await token.setSaleAgent(anotherAccount, {from: anotherAccount}); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });
  });

  describe('check decimals', function () {
    it("decimals is "+decimals, async () => {
      let _decimals = await token.decimals.call();
      assert.equal(_decimals.valueOf(), decimals);
    });
  });

  describe('check cap', function () {
    it("cap is 800000000**"+decimals+" DSCT", async () => {
       let _cap = await token.cap.call();
       assert.equal(_cap.valueOf(), cap);
    });
  });

  describe('initial supply', function () {
    it("owner have 5% DSCT from cap", async () => {
       let balance = await token.balanceOf.call(owner);
       assert.equal(balance.valueOf(), initialSupply);
    });

    it("anotherAccount have 0 DSCT", async () => {
       let balance = await token.balanceOf.call(anotherAccount);
       assert.equal(balance.valueOf(), 0);
    });
  });

  describe('check pause', function () {
    it("default paused is "+defaultPaused, async () => {
      let _paused = await token.paused.call();
      assert.equal(_paused.valueOf(), defaultPaused);
    });

    it("owner switch pause", async () => {
      await token.pause();
      let _paused = await token.paused.call();
      assert.equal(_paused.valueOf(), true);
    });

    it("switch pause and owner is unpause, because he is whitelistAccount", async () => {
      await token.pause();
      let _getPaused = await token.getPaused.call();
      assert.equal(_getPaused.valueOf(), false);
    });

    it("switch pause and anotherAccount is pause", async () => {
      await token.pause();
      let _getPaused = await token.getPaused.call({from: anotherAccount});
      assert.equal(_getPaused.valueOf(), true);
    });

    it("owner switch unpause", async () => {
      await token.pause();
      await token.unpause();
      let _paused = await token.paused.call();
      assert.equal(_paused.valueOf(), false);
    });
  });

  describe('check whitelistAccount', function () {
    it("owner is whitelist", async () => {
      let isWhitelist = await token.isWhitelistedAccount.call(owner);
      assert.equal(isWhitelist, true);
    });

    it("anotherAccount is not whitelist", async () => {
      let isWhitelist = await token.isWhitelistedAccount.call(anotherAccount);
      assert.equal(isWhitelist, false);
    });

    it("anotherAccount add and remove whitelist", async () => {
      await token.addToWhitelistAccount(anotherAccount);
      let isWhitelistAdd = await token.isWhitelistedAccount.call(anotherAccount);
      assert.equal(isWhitelistAdd, true);

      await token.removeFromWhitelistAccount(anotherAccount);
      let isWhitelistRemove = await token.isWhitelistedAccount.call(anotherAccount);
      assert.equal(isWhitelistRemove, false);
    });
  });

  describe('check transfer', function () {
    it('when the sender does not have enough balance', async function () {
      let err = '';
      try { await token.transfer(recipient, 100, { from: anotherAccount }); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });

    it('when the sender has enough balance', async function () {
      const amount = 100;
      const senderBalance    = await token.balanceOf.call(owner);
      const recipientBalance = await token.balanceOf.call(recipient);

      await token.transfer(recipient, amount);

      const newSenderBalance    = await token.balanceOf.call(owner);
      const newRecipientBalance = await token.balanceOf.call(recipient);

      assert.equal(newSenderBalance.valueOf(), senderBalance.valueOf()/1 - amount);
      assert.equal(newRecipientBalance.valueOf(), recipientBalance.valueOf()/1 + amount);
    });

    it('when pause and sender is not whitelist', async function () {
      const amount = 100;

      await token.transfer(anotherAccount, amount);
      await token.pause();

      let err = '';
      try { await token.transfer(recipient, amount, { from: anotherAccount }); } catch (error) { err = error; }
      assert.ok(err instanceof Error);
    });

    it('when pause and sender is whitelist', async function () {
        const amount = 100;

        await token.transfer(anotherAccount, amount);
        await token.pause();
        await token.addToWhitelistAccount(anotherAccount);

        await token.transfer(recipient, amount, { from: anotherAccount });

        const senderBalance    = await token.balanceOf.call(anotherAccount);
        const recipientBalance = await token.balanceOf.call(recipient);

        assert.equal(senderBalance.valueOf(), 0);
        assert.equal(recipientBalance.valueOf(), amount);
    });
  });

  describe('check mint', function () {
    it('mint owner', async function () {
      await token.mint(anotherAccount, 150);

      const balance = await token.balanceOf.call(anotherAccount);
      assert.equal(balance.valueOf(), 150);
    });

    it('mint saleAgent', async function () {
      await token.setSaleAgent(anotherAccount);
      await token.mint(anotherAccount, 150, {from: anotherAccount});

      const balance = await token.balanceOf.call(anotherAccount);
      assert.equal(balance.valueOf(), 150);
    });

    it('finishMinting owner', async function () {
      await token.finishMinting();

        const mintingFinished = await token.mintingFinished.call();
        assert.equal(mintingFinished, true);
    });

    it('finishMinting saleAgent', async function () {
      await token.setSaleAgent(anotherAccount);
      await token.finishMinting({from: anotherAccount});

        const mintingFinished = await token.mintingFinished.call();
        assert.equal(mintingFinished, true);
    });
  });

});