async function main() {
  const Macrofolio = await ethers.getContractFactory('MacrofolioNew');
  const macrofolio = await Macrofolio.deploy();
  await macrofolio.deployed();
  console.log('Contract deployed to:', macrofolio.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
