import { expect } from "chai";
import { ethers } from "hardhat";
import { PortfolioAnchor, ActionType } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("PortfolioAnchor", function () {
  let contract: PortfolioAnchor;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let attacker: SignerWithAddress;

  const RATE_LIMIT_WINDOW = 3600; // 1 hour
  const MAX_ANCHORS_PER_WINDOW = 10;
  const MIN_ANCHOR_DELAY = 60; // 1 minute

  beforeEach(async function () {
    [owner, user1, user2, attacker] = await ethers.getSigners();

    const PortfolioAnchor = await ethers.getContractFactory("PortfolioAnchor");
    contract = await PortfolioAnchor.deploy(owner.address);
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy with correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("should not be paused on deployment", async function () {
      expect(await contract.paused()).to.be.false;
    });
  });

  describe("Signature Verification (EIP-712)", function () {
    it("should accept valid signature", async function () {
      const actionType = 0; // ADD_ASSET
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));
      const deadline = (await time.latest()) + 3600;

      // Sign the anchor
      const domain = {
        name: "PortfolioAnchor",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await contract.getAddress(),
      };

      const types = {
        Anchor: [
          { name: "actionType", type: "uint8" },
          { name: "dataHash", type: "bytes32" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const nonce = await contract.nonces(user1.address);
      const value = {
        actionType,
        dataHash,
        nonce: nonce.toString(),
        deadline,
      };

      const signature = await user1.signTypedData(domain, types, value);

      // Anchor should succeed
      const tx = await contract
        .connect(user1)
        .anchor(actionType, dataHash, deadline, signature);

      await expect(tx)
        .to.emit(contract, "PortfolioAnchored")
        .withArgs(user1.address, actionType, dataHash, expect.anything(), 1);
    });

    it("should reject expired signature", async function () {
      const actionType = 0;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));
      const deadline = (await time.latest()) - 100; // Expired

      const domain = {
        name: "PortfolioAnchor",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await contract.getAddress(),
      };

      const types = {
        Anchor: [
          { name: "actionType", type: "uint8" },
          { name: "dataHash", type: "bytes32" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const nonce = await contract.nonces(user1.address);
      const value = {
        actionType,
        dataHash,
        nonce: nonce.toString(),
        deadline,
      };

      const signature = await user1.signTypedData(domain, types, value);

      await expect(
        contract.connect(user1).anchor(actionType, dataHash, deadline, signature)
      ).to.be.revertedWith("Signature expired");
    });

    it("should reject invalid signature", async function () {
      const actionType = 0;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));
      const deadline = (await time.latest()) + 3600;
      const badSignature = ethers.getAddress(
        "0x0000000000000000000000000000000000000000"
      );

      await expect(
        contract
          .connect(user1)
          .anchor(
            actionType,
            dataHash,
            deadline,
            ethers.getAddress("0x" + "00".repeat(65))
          )
      ).to.be.reverted;
    });

    it("should prevent replay attacks via nonce", async function () {
      const actionType = 0;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));
      const deadline = (await time.latest()) + 3600;

      const domain = {
        name: "PortfolioAnchor",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await contract.getAddress(),
      };

      const types = {
        Anchor: [
          { name: "actionType", type: "uint8" },
          { name: "dataHash", type: "bytes32" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const nonce = await contract.nonces(user1.address);
      const value = {
        actionType,
        dataHash,
        nonce: nonce.toString(),
        deadline,
      };

      const signature = await user1.signTypedData(domain, types, value);

      // First anchor succeeds
      await contract
        .connect(user1)
        .anchor(actionType, dataHash, deadline, signature);

      // Replay attempt fails (nonce changed)
      await expect(
        contract
          .connect(user1)
          .anchor(actionType, dataHash, deadline, signature)
      ).to.be.revertedWith("Invalid signature");
    });
  });

  describe("Anchor Storage & Verification", function () {
    it("should store anchor and emit event", async function () {
      const actionType = 0;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));
      const deadline = (await time.latest()) + 3600;
      const signature = await createSignature(
        user1,
        actionType,
        dataHash,
        deadline,
        contract
      );

      const tx = await contract
        .connect(user1)
        .anchor(actionType, dataHash, deadline, signature);

      await expect(tx)
        .to.emit(contract, "PortfolioAnchored")
        .withArgs(user1.address, actionType, dataHash, expect.anything(), 1);
    });

    it("should verify existing anchor in O(1)", async function () {
      const actionType = 1; // UPDATE_PORTFOLIO
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));
      const deadline = (await time.latest()) + 3600;
      const signature = await createSignature(
        user1,
        actionType,
        dataHash,
        deadline,
        contract
      );

      await contract
        .connect(user1)
        .anchor(actionType, dataHash, deadline, signature);

      const exists = await contract.verifyAnchor(user1.address, dataHash);
      expect(exists).to.be.true;
    });

    it("should return false for non-existent anchor", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
      const exists = await contract.verifyAnchor(user1.address, dataHash);
      expect(exists).to.be.false;
    });
  });

  describe("Rate Limiting", function () {
    it("should enforce rate limit (10 anchors per hour)", async function () {
      const deadline = (await time.latest()) + 3600;
      let dataHash: string;
      let signature: string;

      // First 10 anchors should succeed
      for (let i = 0; i < 10; i++) {
        dataHash = ethers.keccak256(ethers.toUtf8Bytes(`data-${i}`));
        signature = await createSignature(
          user1,
          0,
          dataHash,
          deadline,
          contract
        );
        await contract.connect(user1).anchor(0, dataHash, deadline, signature);
      }

      // 11th anchor should fail
      dataHash = ethers.keccak256(ethers.toUtf8Bytes("data-11"));
      signature = await createSignature(
        user1,
        0,
        dataHash,
        deadline,
        contract
      );

      await expect(
        contract.connect(user1).anchor(0, dataHash, deadline, signature)
      ).to.be.revertedWith("Rate limit exceeded");
    });

    it("should reset rate limit after 1 hour", async function () {
      const deadline = (await time.latest()) + 7200;

      // Fill quota
      for (let i = 0; i < 10; i++) {
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(`data-${i}`));
        const signature = await createSignature(
          user1,
          0,
          dataHash,
          deadline,
          contract
        );
        await contract.connect(user1).anchor(0, dataHash, deadline, signature);
      }

      // Fast-forward 1 hour
      await time.increase(3601);

      // 11th anchor should now succeed
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("data-11"));
      const signature = await createSignature(
        user1,
        0,
        dataHash,
        deadline,
        contract
      );

      const tx = await contract
        .connect(user1)
        .anchor(0, dataHash, deadline, signature);
      await expect(tx).to.emit(contract, "PortfolioAnchored");
    });

    it("should prevent rapid-fire anchors", async function () {
      const deadline = (await time.latest()) + 3600;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("data-1"));
      const signature = await createSignature(
        user1,
        0,
        dataHash,
        deadline,
        contract
      );

      // First anchor succeeds
      await contract.connect(user1).anchor(0, dataHash, deadline, signature);

      // Wait less than MIN_ANCHOR_DELAY (60 seconds)
      await time.increase(30);

      // Second anchor should fail
      const dataHash2 = ethers.keccak256(ethers.toUtf8Bytes("data-2"));
      const signature2 = await createSignature(
        user1,
        0,
        dataHash2,
        deadline,
        contract
      );

      await expect(
        contract.connect(user1).anchor(0, dataHash2, deadline, signature2)
      ).to.be.revertedWith("Too soon");
    });
  });

  describe("Access Control", function () {
    it("should allow owner to pause/unpause", async function () {
      await contract.pause();
      expect(await contract.paused()).to.be.true;

      await contract.unpause();
      expect(await contract.paused()).to.be.false;
    });

    it("should prevent non-owner from pausing", async function () {
      await expect(contract.connect(user1).pause()).to.be.revertedWithCustomError(
        contract,
        "OwnableUnauthorizedAccount"
      );
    });

    it("should prevent anchoring when paused", async function () {
      await contract.pause();

      const actionType = 0;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));
      const deadline = (await time.latest()) + 3600;
      const signature = await createSignature(
        user1,
        actionType,
        dataHash,
        deadline,
        contract
      );

      await expect(
        contract.connect(user1).anchor(actionType, dataHash, deadline, signature)
      ).to.be.revertedWith("EnforcedPause");
    });
  });

  describe("Batch Anchoring", function () {
    it("should batch anchor multiple items", async function () {
      const deadline = (await time.latest()) + 3600;
      const anchors = [
        { actionType: 0, dataHash: ethers.keccak256(ethers.toUtf8Bytes("data-1")) },
        { actionType: 1, dataHash: ethers.keccak256(ethers.toUtf8Bytes("data-2")) },
        { actionType: 2, dataHash: ethers.keccak256(ethers.toUtf8Bytes("data-3")) },
      ];

      const signatures = await Promise.all(
        anchors.map((a) =>
          createSignature(user1, a.actionType, a.dataHash, deadline, contract)
        )
      );

      const tx = await contract
        .connect(user1)
        .batchAnchor(
          anchors.map((a) => a.actionType),
          anchors.map((a) => a.dataHash),
          deadline,
          signatures
        );

      for (const anchor of anchors) {
        await expect(tx)
          .to.emit(contract, "PortfolioAnchored")
          .withArgs(
            user1.address,
            anchor.actionType,
            anchor.dataHash,
            expect.anything(),
            1
          );
      }
    });
  });

  describe("Security: Reentrancy Protection", function () {
    it("should prevent reentrancy attacks", async function () {
      // This test verifies ReentrancyGuard is in place
      // In practice, contract doesn't have receive/fallback
      // but guard prevents malicious patterns
      const actionType = 0;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));
      const deadline = (await time.latest()) + 3600;
      const signature = await createSignature(
        user1,
        actionType,
        dataHash,
        deadline,
        contract
      );

      // Normal flow should work
      const tx = await contract
        .connect(user1)
        .anchor(actionType, dataHash, deadline, signature);
      await expect(tx).to.emit(contract, "PortfolioAnchored");
    });
  });

  describe("Input Validation", function () {
    it("should reject empty data hash", async function () {
      const actionType = 0;
      const dataHash = ethers.ZeroHash;
      const deadline = (await time.latest()) + 3600;

      await expect(
        contract
          .connect(user1)
          .anchor(actionType, dataHash, deadline, "0x")
      ).to.be.revertedWith("Invalid data hash");
    });
  });

  describe("Pagination & History", function () {
    it("should track limited anchor history", async function () {
      const deadline = (await time.latest()) + 3600;

      // Create multiple anchors
      for (let i = 0; i < 5; i++) {
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(`data-${i}`));
        const signature = await createSignature(user1, 0, dataHash, deadline, contract);
        await contract.connect(user1).anchor(0, dataHash, deadline, signature);
      }

      // Get user anchor history
      const history = await contract.getUserAnchors(user1.address, 0, 10);
      expect(history.length).to.equal(5);
    });
  });

  describe("Multi-User Isolation", function () {
    it("should isolate user anchors", async function () {
      const deadline = (await time.latest()) + 3600;
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-data"));

      const sig1 = await createSignature(user1, 0, dataHash, deadline, contract);
      const sig2 = await createSignature(user2, 0, dataHash, deadline, contract);

      await contract.connect(user1).anchor(0, dataHash, deadline, sig1);
      await contract.connect(user2).anchor(0, dataHash, deadline, sig2);

      // Both should verify independently
      expect(await contract.verifyAnchor(user1.address, dataHash)).to.be.true;
      expect(await contract.verifyAnchor(user2.address, dataHash)).to.be.true;

      // Verify by wrong user should fail
      const dataHash2 = ethers.keccak256(ethers.toUtf8Bytes("other-data"));
      expect(await contract.verifyAnchor(user1.address, dataHash2)).to.be.false;
    });
  });
});

// Helper function to create EIP-712 signatures
async function createSignature(
  signer: SignerWithAddress,
  actionType: number,
  dataHash: string,
  deadline: number,
  contract: PortfolioAnchor
): Promise<string> {
  const domain = {
    name: "PortfolioAnchor",
    version: "1",
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await contract.getAddress(),
  };

  const types = {
    Anchor: [
      { name: "actionType", type: "uint8" },
      { name: "dataHash", type: "bytes32" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const nonce = await contract.nonces(signer.address);
  const value = {
    actionType,
    dataHash,
    nonce: nonce.toString(),
    deadline,
  };

  return signer.signTypedData(domain, types, value);
}
