async function expectThrow(promise) {
  try {
    await promise;
  } catch(error) {
    return;
  }
  assert.fail('Expected throw not received');
};

async function compareBalances(promise, address) {
  const oldBalance = await web3.eth.getBalance(address);
  await promise;
  const newBalance = await web3.eth.getBalance(address);
  return newBalance - oldBalance;
};

async function verifyEthersWereLost(promise, address) {
  const balanceDifference = await compareBalances(promise, address);
  return assert(balanceDifference < 0);
};

async function verifyEthersWereEarned(promise, address) {
  const balanceDifference = await compareBalances(promise, address);
  return assert(balanceDifference > 0);
};

async function verifyAntWasCreatedSuccessfully(contract, account, antIndex) {
  const antId = await contract.antsOwner(account, antIndex);
  const ant = await contract.ants(antId - 1);
  assert(ant.timeOfLastEgg.toNumber() > 0);
  assert(ant.totalEggsAvailable.toNumber() > 0);
  assert(ant.percentageOfDying.toNumber() > 0 && ant.percentageOfDying.toNumber() < 100);
}

async function getAnt(contract, account, antIndex) {
  const antId = await contract.antsOwner(account, antIndex);
  return await contract.ants(antId - 1);
}

async function verifyAntNoLongerExists(contract, account, antIndex) {
  const antId = await contract.antsOwner(account, antIndex);
  await expectThrow(contract.ants(antId - 1));
}

async function verifyAntIsTheTransferedAnt(transferedAnt, contract, account, antIndex) {
  const ant = await getAnt(contract, account, antIndex);
  assert(ant.timeOfLastEgg.toNumber() == transferedAnt.timeOfLastEgg.toNumber());
  assert(ant.totalEggsAvailable.toNumber() == transferedAnt.totalEggsAvailable.toNumber());
  assert(ant.percentageOfDying.toNumber() == transferedAnt.percentageOfDying.toNumber());
}

async function catchAntDeathException(promise) {
  try {
    await promise;
  } catch(error) {
    assert.equal(error.reason, "The ant died");
  }
}

module.exports = {
  expectThrow,
  verifyEthersWereEarned,
  verifyEthersWereLost,
  verifyAntWasCreatedSuccessfully,
  getAnt,
  verifyAntNoLongerExists,
  verifyAntIsTheTransferedAnt,
  catchAntDeathException
}