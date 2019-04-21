const EggToken = artifacts.require("EggToken");
const { expectThrow, verifyEthersWereLost, verifyEthersWereEarned } = require("./testUtils");

contract('EggToken', function(accounts) {

  describe('buy eggs tests', function () {
    beforeEach(async function() {
      this.eggToken = await EggToken.new();
    })
  
    it('buy one egg', async function() {
      const buyEggsPromise = this.eggToken.buyEggs({value: 10000000000000000});
      await verifyEthersWereLost(buyEggsPromise, accounts[0]);
      const eggs = await this.eggToken.eggsOwner(accounts[0]);
      assert.equal(eggs.toNumber(), 1);
    });

    it('buy more than one egg', async function() {
      const buyEggsPromise = this.eggToken.buyEggs({value: 30000000000000000});
      await verifyEthersWereLost(buyEggsPromise, accounts[0]);
      const eggs = await this.eggToken.eggsOwner(accounts[0]);
      assert.equal(eggs.toNumber(), 3);
    });

    it('buy an egg without enough ethers', async function() {
      await expectThrow(this.eggToken.buyEggs({value: 10}));
    });

  });

  describe('sell eggs tests', function () {
    beforeEach(async function() {
      this.eggToken = await EggToken.new();
      await this.eggToken.buyEggs({value: 10000000000000000});
    })
  
    it('sell one egg', async function() {
      const sellEggsPromise = this.eggToken.sellEggs(1);
      await verifyEthersWereEarned(sellEggsPromise, accounts[0]);
      const eggs = await this.eggToken.eggsOwner(accounts[0]);
      assert.equal(eggs.toNumber(), 0);
    });

    it('try to sell, but not enough eggs', async function() {
      await expectThrow(this.eggToken.sellEggs(3));
    });
  });

  describe('transfer eggs tests', function () {
    beforeEach(async function() {
      this.eggToken = await EggToken.new();
      await this.eggToken.buyEggs({value: 20000000000000000, from: accounts[0]});
      await this.eggToken.buyEggs({value: 10000000000000000, from: accounts[1]});
    })

    it('transfer one egg', async function() {
      await this.eggToken.transferEggs(1, accounts[1]);
      const eggsAccountFrom = await this.eggToken.eggsOwner(accounts[0]);
      const eggsAccountTo = await this.eggToken.eggsOwner(accounts[1]);
      assert.equal(eggsAccountFrom.toNumber(), 1);
      assert.equal(eggsAccountTo.toNumber(), 2);
    });

    it('try to transfer, but not enough eggs', async function() {
      await expectThrow(this.eggToken.transferEggs(3, accounts[1]));
    });

    it('transfer to non existing account', async function() {
      await this.eggToken.transferEggs(1, accounts[2]);
      const eggsAccountFrom = await this.eggToken.eggsOwner(accounts[0]);
      const eggsAccountTo = await this.eggToken.eggsOwner(accounts[2]);
      assert.equal(eggsAccountFrom.toNumber(), 1);
      assert.equal(eggsAccountTo.toNumber(), 1);
    });
  });
});