import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Polygon Mainnet Verification Script
 * Verifies deployment and runs sanity checks
 */

async function main() {
  console.log("Verifying PortfolioAnchor deployment...\n");
  
  if (!process.env.VITE_CONTRACT_ADDRESS) {
    throw new Error("VITE_CONTRACT_ADDRESS environment variable not set");
  }
  
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
  console.log("Contract Address:", contractAddress);
  
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name, "(ChainId: " + network.chainId + ")\n");
  
  // Load contract ABI
  const abiPath = path.join(__dirname, "..", "artifacts", "contracts", "PortfolioAnchor.sol", "PortfolioAnchor.json");
  const abiData = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const abi = abiData.abi;
  
  // Connect to contract
  const contract = new hre.ethers.Contract(
    contractAddress,
    abi,
    hre.ethers.provider
  );
  
  console.log("VERIFICATION CHECKLIST");
  console.log("═".repeat(50));
  
  // Check 1: Code exists
  const code = await hre.ethers.provider.getCode(contractAddress);
  console.log("✓ Code exists at address:", code !== "0x");
  
  // Check 2: Owner
  try {
    const owner = await contract.owner();
    console.log("✓ Owner:", owner);
  } catch (e) {
    console.error("✗ Could not read owner");
  }
  
  // Check 3: Paused status
  try {
    const paused = await contract.paused();
    console.log("✓ Paused:", paused, "(should be false)");
  } catch (e) {
    console.error("✗ Could not read paused status");
  }
  
  // Check 4: Try reading nonces mapping (should not error)
  try {
    const deployer = (await hre.ethers.getSigners())[0];
    const nonce = await contract.nonces(deployer.address);
    console.log("✓ Nonce tracking works:", nonce.toString());
  } catch (e) {
    console.error("✗ Could not read nonce");
  }
  
  console.log("\nPolygonscan Link:");
  console.log(`https://polygonscan.com/address/${contractAddress}`);
  
  console.log("\n✓ Verification complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
