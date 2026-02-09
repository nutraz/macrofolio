// Create test file: src/components/TestContract.jsx
import { getContract } from '../lib/contracts/macrofolio';
import { ethers } from 'ethers'; // Import ethers for parsing ether values

const TestContract = ({ provider }) => {
  const testDeposit = async () => {
    try {
      const contract = getContract(provider);
      const tx = await contract.deposit({ 
        value: ethers.parseEther("0.01") 
      });
      await tx.wait();
      console.log("Deposit successful!");
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  return (
    <button onClick={testDeposit}>
      Test Deposit 0.01 MATIC
    </button>
  );
};

export default TestContract;