const P2PInsurance = artifacts.require("P2PInsurance");

const item = "iPhone 11";
const coverage = 1000;
const premium = 100;
const duration = 30;

module.exports = function (deployer) {
  deployer.deploy(P2PInsurance, item, coverage, premium, duration);
};
