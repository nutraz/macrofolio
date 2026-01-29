import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Safe deployment script with pre-flight checks
 * Usage: npx hardhat run scripts/safe-deploy.ts --network polygon
 */

interface DeploymentChecks {
  networkCorrect: boolean;
  balanceSufficient: boolean;
  contractDeployed: boolean;
  ownerCorrect: boolean;
  notPaused: boolean;
  codeExists: boolean;
}

async function runPreFlightChecks(
  deployer: { address: string }
): Promise<DeploymentChecks> {
  const network = await hre.ethers.provider.getNetwork();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  const checks: DeploymentChecks = {
    networkCorrect: network.chainId === 137, // Polygon mainnet
    balanceSufficient: balance >= hre.ethers.parseEther("0.5"),
    contractDeployed: false,
    ownerCorrect: false,
    notPaused: false,
    codeExists: false,
  };
  
  return checks;
}

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  PORTFOLIO ANCHOR - SAFE DEPLOYMENT SCRIPT");
  console.log("═══════════════════════════════════════════════\n");
  
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  
  // Sanity checks
  console.log("STEP 1: Pre-flight checks");
  console.log("─────────────────────────────────────────────");
  
  if (network.chainId !== 137) {
    console.error(`❌ Wrong network! Connected to chainId ${network.chainId}.`);
    console.error("   Please set --network polygon");
    process.exit(1);
  }
  console.log("✓ Network: Polygon Mainnet (ChainId: 137)");
  
  console.log("✓ Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceEther = hre.ethers.formatEther(balance);
  
  if (balance < hre.ethers.parseEther("0.5")) {
    console.error(`❌ Insufficient balance: ${balanceEther} POL`);
    console.error("   Minimum 0.5 POL required for deployment and gas");
    process.exit(1);
  }
  console.log(`✓ Balance: ${balanceEther} POL (sufficient)`);
  
  // User confirmation
  console.log("\n" + "═".repeat(51));
  console.log("DEPLOYMENT SUMMARY");
  console.log("═".repeat(51));
  console.log("Network:     Polygon Mainnet");
  console.log("Deployer:   ", deployer.address);
  console.log("Balance:    ", balanceEther, "POL");
  console.log("─".repeat(51));
  
  // Ask for confirmation
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const answer = await new Promise<string>((resolve) => {
    rl.question(
      "Do you want to proceed with deployment? (yes/no) ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase());
      }
    );
  });
  
  if (answer !== "yes" && answer !== "y") {
    console.log("❌ Deployment cancelled");
    process.exit(1);
  }
  
  console.log("\nSTEP 2: Deploying PortfolioAnchor");
  console.log("─".repeat(51));
  
  try {
    const PortfolioAnchor = await hre.ethers.getContractFactory(
      "PortfolioAnchor"
    );
    
    console.log("Sending deployment transaction...");
    const contract = await PortfolioAnchor.deploy(deployer.address);
    const deploymentTx = contract.deploymentTransaction();
    
    if (!deploymentTx) {
      throw new Error("No deployment transaction");
    }
    
    console.log("Tx Hash:", deploymentTx.hash);
    console.log("Waiting for confirmation (this may take a few minutes)...");
    
    const receipt = await deploymentTx.wait(5); // Wait for 5 confirmations
    
    if (!receipt || receipt.status === 0) {
      throw new Error("Deployment transaction failed");
    }
    
    const contractAddress = await contract.getAddress();
    console.log("✓ Contract deployed:", contractAddress);
    
    // Verify code exists
    const code = await hre.ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error("Contract code not found at deployed address");
    }
    console.log("✓ Contract code verified");
    
    // Verify owner
    const owner = await contract.owner();
    if (owner !== deployer.address) {
      throw new Error("Owner mismatch");
    }
    console.log("✓ Owner set correctly");
    
    // Check if paused
    const paused = await contract.paused();
    if (paused) {
      throw new Error("Contract should not be paused");
    }
    console.log("✓ Contract is not paused");
    
    console.log("\nSTEP 3: Saving deployment info");
    console.log("─".repeat(51));
    
    const deploymentInfo = {
      version: "1.0",
      network: {
        name: network.name,
        chainId: network.chainId,
        rpc: hre.ethers.provider.connection.url,
      },
      contract: {
        name: "PortfolioAnchor",
        address: contractAddress,
        owner: owner,
        paused: paused,
        schemaVersion: 1,
      },
      deployment: {
        deployer: deployer.address,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        transactionHash: deploymentTx.hash,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: deploymentTx.gasPrice?.toString() || "N/A",
      },
    };
    
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const filename = `polygon-mainnet-${timestamp}.json`;
    const filepath = path.join(deploymentsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log("✓ Deployment info saved:", filename);
    
    // Generate .env update
    const envUpdate = `VITE_CONTRACT_ADDRESS=${contractAddress}\nVITE_CHAIN_ID=137\n`;
    console.log("\nSTEP 4: Environment variables to update");
    console.log("─".repeat(51));
    console.log("Add to .env:");
    console.log(envUpdate);
    
    // Save to .env.mainnet for reference
    const envFile = path.join(__dirname, "..", "..", "..", ".env.mainnet");
    fs.writeFileSync(envFile, envUpdate);
    console.log("Saved to .env.mainnet");
    
    console.log("\n" + "═".repeat(51));
    console.log("✓ DEPLOYMENT SUCCESSFUL");
    console.log("═".repeat(51));
    console.log("\nContract Address:", contractAddress);
    console.log("Polygonscan:     ", `https://polygonscan.com/address/${contractAddress}`);
    console.log("\nNEXT STEPS:");
    console.log("1. Update Netlify environment variables:");
    console.log("   - VITE_CONTRACT_ADDRESS=" + contractAddress);
    console.log("   - VITE_CHAIN_ID=137");
    console.log("2. Trigger Netlify redeployment");
    console.log("3. Run E2E tests on production");
    console.log("4. Verify on Polygonscan (optional):");
    console.log("   npx hardhat verify --network polygon " + contractAddress + " " + deployer.address);
    console.log("5. Monitor contract activity");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
