import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying PortfolioAnchor to Polygon Mainnet");
  console.log("Deployer:", deployer.address);
  
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "POL");
  
  // Ensure sufficient balance
  if (balance < hre.ethers.parseEther("1")) {
    throw new Error("Insufficient balance for deployment. Minimum 1 POL required.");
  }
  
  // Deploy PortfolioAnchor
  console.log("\n1. Deploying PortfolioAnchor contract...");
  const PortfolioAnchor = await hre.ethers.getContractFactory("PortfolioAnchor");
  const contract = await PortfolioAnchor.deploy(deployer.address);
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("✓ PortfolioAnchor deployed to:", contractAddress);
  
  // Verify deployment
  console.log("\n2. Verifying deployment...");
  const code = await hre.ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("Contract deployment failed - no code at address");
  }
  console.log("✓ Contract code verified");
  
  // Check owner
  const owner = await contract.owner();
  console.log("✓ Contract owner:", owner);
  
  if (owner !== deployer.address) {
    throw new Error("Owner mismatch!");
  }
  
  // Save deployment info
  console.log("\n3. Saving deployment info...");
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    contractAddress: contractAddress,
    deployer: deployer.address,
    owner: owner,
    deploymentBlock: await hre.ethers.provider.getBlockNumber(),
    deploymentTime: new Date().toISOString(),
    txHash: contract.deploymentTransaction()?.hash,
    gasUsed: contract.deploymentTransaction()?.gasLimit,
  };
  
  const deploymentDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const filename = `${network.chainId}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✓ Deployment info saved to:", filename);
  
  // Verify on Polygonscan (optional)
  if (process.env.VERIFY_CONTRACT === "true") {
    console.log("\n4. Verifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address],
        contract: "contracts/PortfolioAnchor.sol:PortfolioAnchor",
      });
      console.log("✓ Contract verified on Polygonscan");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("✓ Contract already verified");
      } else {
        console.warn("⚠ Verification failed (this is optional):", error.message);
      }
    }
  }
  
  // Post-deployment checks
  console.log("\n5. Post-deployment checks...");
  const paused = await contract.paused();
  console.log("✓ Contract paused:", paused, "(should be false)");
  
  if (paused) {
    throw new Error("Contract should not be paused after deployment!");
  }
  
  console.log("\n✓ Deployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update .env with CONTRACT_ADDRESS=" + contractAddress);
  console.log("2. Update frontend Netlify environment variables");
  console.log("3. Run E2E tests on mainnet");
  console.log("4. Monitor contract activity");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
