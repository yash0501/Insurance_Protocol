// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract P2PInsurance {
    address owner;
    string public item;
    uint256 public coverage;
    uint256 public premium;
    uint256 public duration;
    uint256 public poolBalance;
    bool public isPolicyOpen;
    address[] public policyholders;
    mapping(address => uint256) public policyholderBalances;

    // Define the struct for claims
    struct Claim {
        address claimant;
        uint256 amount;
        bool approved;
        bool exists;
    }

    // Define the list of claims
    mapping(uint256 => Claim) public claims;
    uint256 public numClaims;

    // Define the constructor function
    constructor(
        string memory _item,
        uint256 _coverage,
        uint256 _premium,
        uint256 _duration
    ) {
        owner = msg.sender;
        item = _item;
        coverage = _coverage;
        premium = _premium;
        duration = _duration;
        isPolicyOpen = true;
    }

    // Define the function for joining the policy
    function joinPolicy() public payable {
        require(isPolicyOpen, "Policy is closed");
        require(msg.value == premium, "Premium amount required");
        policyholders.push(msg.sender);
        policyholderBalances[msg.sender] = msg.value;
        poolBalance += msg.value;
    }

    // Define the function for submitting a claim
    function submitClaim(uint256 _amount) public {
        require(msg.sender != owner, "Owner cannot submit a claim");
        require(_amount <= coverage, "Claim amount exceeds coverage");
        require(
            policyholderBalances[msg.sender] >= _amount,
            "Insufficient funds"
        );
        require(poolBalance >= _amount, "Insufficient funds in the pool");

        // Create a new claim
        Claim memory newClaim = Claim({
            claimant: msg.sender,
            amount: _amount,
            approved: false,
            exists: true
        });

        // Add the claim to the list
        claims[numClaims] = newClaim;
        numClaims++;

        // Update the pool balance
        poolBalance -= _amount;
    }

    // Define the function for approving a claim
    function approveClaim(uint256 _claimId) public {
        require(msg.sender == owner, "Only the owner can approve claims");
        require(_claimId < numClaims, "Invalid claim ID");
        require(claims[_claimId].exists, "Claim does not exist");
        require(!claims[_claimId].approved, "Claim has already been approved");
        claims[_claimId].approved = true;
        payable(claims[_claimId].claimant).transfer(claims[_claimId].amount);
    }

    // Define the function for closing the policy
    function closePolicy() public {
        require(msg.sender == owner, "Only the owner can close the policy");
        isPolicyOpen = false;
    }

    // Define the function for withdrawing excess funds
    function withdrawExcess() public {
        require(
            msg.sender == owner,
            "Only the owner can withdraw excess funds"
        );
        require(
            !isPolicyOpen,
            "Policy must be closed to withdraw excess funds"
        );
        payable(owner).transfer(poolBalance);
    }

    // define function to get the count of policyholders
    function getPolicyholderCount() public view returns (uint256) {
        return policyholders.length;
    }
}
