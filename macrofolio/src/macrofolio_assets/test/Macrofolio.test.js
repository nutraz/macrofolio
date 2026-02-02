const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Macrofolio", function () {
  let macrofolio;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const Macrofolio = await ethers.getContractFactory("Macrofolio");
    macrofolio = await Macrofolio.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await macrofolio.owner()).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {
    it("Should deposit ETH", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await macrofolio.connect(addr1).deposit({ value: depositAmount });
      
      expect(await macrofolio.getBalance(addr1.address)).to.equal(depositAmount);
    });
  });
});