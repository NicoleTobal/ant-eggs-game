const AntToken = artifacts.require("AntToken");
const EggToken = artifacts.require("EggToken");
const SafeMath = artifacts.require("SafeMath");
const AntEggsGame = artifacts.require("AntEggsGame");

module.exports = function(deployer) {
  deployer.deploy(AntToken);
  deployer.deploy(SafeMath);
  deployer.deploy(EggToken);
  deployer.deploy(AntEggsGame);
};
