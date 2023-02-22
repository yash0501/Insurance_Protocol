const P2PInsurance = artifacts.require("P2PInsurance");

contract("P2PInsurance", (accounts) => {
  let p2pInsurance;

  const owner = accounts[0];
  const policyholder1 = accounts[1];
  const policyholder2 = accounts[2];
  const policyholder3 = accounts[3];

  const itemName = "Smartphone";
  const coverageAmount = 1000;
  const premiumAmount = 50;
  const duration = 30;

  before(async () => {
    p2pInsurance = await P2PInsurance.new(
      itemName,
      coverageAmount,
      premiumAmount,
      duration,
      { from: owner },
    );
  });

  it("should set the correct values in the constructor", async () => {
    const item = await p2pInsurance.item();
    assert.equal(item, itemName, "Item name was not set correctly");

    const coverage = await p2pInsurance.coverage();
    assert.equal(
      coverage,
      coverageAmount,
      "Coverage amount was not set correctly",
    );

    const premium = await p2pInsurance.premium();
    assert.equal(
      premium,
      premiumAmount,
      "Premium amount was not set correctly",
    );

    const policyDuration = await p2pInsurance.duration();
    assert.equal(
      policyDuration,
      duration,
      "Policy duration was not set correctly",
    );

    const isOpen = await p2pInsurance.isPolicyOpen();
    assert.equal(isOpen, true, "Policy should be open by default");

    const poolBalance = await p2pInsurance.poolBalance();
    assert.equal(
      poolBalance,
      0,
      "Initial pool balance should be zero by default",
    );
  });

  describe("joinPolicy", () => {
    it("should allow policyholders to join the policy", async () => {
      await p2pInsurance.joinPolicy({
        from: policyholder1,
        value: premiumAmount,
      });
      const policyholders = await p2pInsurance.policyholders(0);
      assert.equal(
        policyholders,
        policyholder1,
        "Policyholder was not added correctly",
      );

      await p2pInsurance.joinPolicy({
        from: policyholder2,
        value: premiumAmount,
      });
      const policyholderCount = await p2pInsurance.getPolicyholderCount();
      assert.equal(
        policyholderCount,
        2,
        "Policyholder count was not incremented correctly",
      );
    });

    it("should not allow policyholders to join the policy without paying the premium", async () => {
      try {
        await p2pInsurance.joinPolicy({
          from: policyholder3,
          value: premiumAmount - 10,
        });
        assert.fail("Premium was not paid");
      } catch (error) {
        assert.include(
          error.message,
          "Premium amount required",
          "Premium was not paid",
        );
      }
    });

    it("should not allow policyholders to join the policy after it has been closed", async () => {
      await p2pInsurance.closePolicy({ from: owner });
      try {
        await p2pInsurance.joinPolicy({
          from: policyholder3,
          value: premiumAmount,
        });
        assert.fail("Policy was still open");
      } catch (error) {
        assert.include(
          error.message,
          "Policy is closed",
          "Policy was still open",
        );
      }
    });
  });
});
