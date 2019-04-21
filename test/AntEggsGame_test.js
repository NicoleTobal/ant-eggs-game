const AntEggsGame = artifacts.require("AntEggsGame");
const {
  expectThrow,
  verifyAntWasCreatedSuccessfully,
  getAnt,
  catchAntDeathException,
  verifyAntNoLongerExists,
  verifyAntIsTheTransferedAnt
} = require("./testUtils");

contract('AntEggsGame', function(accounts) {

  describe('create ant tests', function () {
    beforeEach(async function() {
      this.antEggsGame = await AntEggsGame.new({from: accounts[0]});
      await this.antEggsGame.buyEggs({value: 10000000000000000, from: accounts[1]});
    })

    it('create one ant', async function() {
      const eggsBefore = await this.antEggsGame.eggsOwner(accounts[1]);
      assert.equal(eggsBefore, 1);
      await this.antEggsGame.createNewAnt({from: accounts[1]});
      const eggs = await this.antEggsGame.eggsOwner(accounts[1]);
      assert.equal(eggs, 0);
      verifyAntWasCreatedSuccessfully(this.antEggsGame, accounts[1], 0);
    });

    it('create more than one ant', async function() {
      await this.antEggsGame.buyEggs({value: 20000000000000000, from: accounts[1]});
      const eggsBefore = await this.antEggsGame.eggsOwner(accounts[1]);
      assert.equal(eggsBefore, 3);
      await this.antEggsGame.createNewAnt({from: accounts[1]});
      await this.antEggsGame.createNewAnt({from: accounts[1]});
      await this.antEggsGame.createNewAnt({from: accounts[1]});
      const eggs = await this.antEggsGame.eggsOwner(accounts[1]);
      assert.equal(eggs, 0);
      verifyAntWasCreatedSuccessfully(this.antEggsGame, accounts[1], 0);
      verifyAntWasCreatedSuccessfully(this.antEggsGame, accounts[1], 1);
      verifyAntWasCreatedSuccessfully(this.antEggsGame, accounts[1], 2);
    });

    it('try to create an ant, but have no eggs', async function() {
      await expectThrow(this.antEggsGame.createNewAnt());
    });

  });

  describe('create egg from ant tests', function () {
    beforeEach(async function() {
      this.antEggsGame = await AntEggsGame.new({from: accounts[0]});
      await this.antEggsGame.buyEggs({value: 10000000000000000, from: accounts[1]});
      await this.antEggsGame.createNewAnt({from: accounts[1]});
    })

    it('create egg from ant', async function() {
      catchAntDeathException(async function() {
        const antBefore = await getAnt(this.antEggsGame, accounts[1], 0);
        await this.antEggsGame.createEggFromAnt(0, {from: accounts[1]});
        const eggs = await this.antEggsGame.eggsOwner(accounts[1]);
        const ant = await getAnt(this.antEggsGame, accounts[1], 0);
        assert.equal(eggs, 1);
        assert.equal(ant.totalEggsAvailable, antBefore.totalEggsAvailable - 1);
      });
    });

    it('try to create an egg from ant, but it no longer exists', async function() {
      await this.antEggsGame.transferAnt(0, accounts[2], {from: accounts[1]});
      await expectThrow(this.antEggsGame.createEggFromAnt(0, {from: accounts[1]}));
    });

    it('try to create an egg from ant, but not ready to reproduce again', async function() {
      catchAntDeathException(async function() {
        await this.antEggsGame.createEggFromAnt(0, {from: accounts[1]});
        await expectThrow(this.antEggsGame.createEggFromAnt(0, {from: accounts[1]}));
      });
    });

    it('try to create an egg from ant, but have no ants', async function() {
      await expectThrow(this.antEggsGame.createEggFromAnt(0, {from: accounts[2]}));
    });

  });

  describe('transfer ants tests', function () {
    beforeEach(async function() {
      this.antEggsGame = await AntEggsGame.new({from: accounts[0]});
      await this.antEggsGame.buyEggs({value: 10000000000000000, from: accounts[1]});
      await this.antEggsGame.createNewAnt({from: accounts[1]});
    })

    it('transfer one ant', async function() {
      const antToBeTransfered = await getAnt(this.antEggsGame, accounts[1], 0);
      await this.antEggsGame.transferAnt(0, accounts[2], {from: accounts[1]});
      await verifyAntNoLongerExists(this.antEggsGame, accounts[1], 0);
      await verifyAntIsTheTransferedAnt(antToBeTransfered, this.antEggsGame, accounts[2], 0);
    });

    it('try to transfer an ant, but not enough ants', async function() {
      await expectThrow(this.antEggsGame.transferAnt(0, accounts[0], {from: accounts[2]}));
    });

    it('try to transfer an ant, but it no longer exists', async function() {
      await this.antEggsGame.transferAnt(0, accounts[2], {from: accounts[1]});
      await expectThrow(this.antEggsGame.transferAnt(0, accounts[2], {from: accounts[1]}));
    });

  });
});