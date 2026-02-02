import { ethers } from 'ethers';

// Contract ABI (from Remix after compilation)
export const MACROFOLIO_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function getUserBalance(address user) external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  "function totalDeposits() external view returns (uint256)",
  "function balances(address) external view returns (uint256)",
  "function owner() external view returns (address)",
  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)"
];

export const getContract = (provider) => {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('Contract address not configured');
  }
  return new ethers.Contract(contractAddress, MACROFOLIO_ABI, provider);
};

export const deposit = async (contract, amount) => {
  const tx = await contract.deposit({ value: amount });
  await tx.wait();
  return tx;
};

export const withdraw = async (contract, amount) => {
  const tx = await contract.withdraw(amount);
  await tx.wait();
  return tx;
};
