import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Balance: ",
    (await ethers.provider.getBalance(deployer.address)).toString(),
  );

  // ============================================
  // STEP 1: Deploy RupiahToken
  // ============================================
  const RupiahToken = await ethers.getContractFactory("RupiahToken");
  const rupiahToken = await RupiahToken.deploy();
  await rupiahToken.waitForDeployment();
  const tokenAddress = await rupiahToken.getAddress();
  console.log("1. RupiahToken deployed to: ", tokenAddress);

  // ============================================
  // STEP 2: Deploy TrustedGateway
  // ============================================
  const Gateway = await ethers.getContractFactory("TrustedGatewayBurner");
  const gateway = await Gateway.deploy(tokenAddress);
  await gateway.waitForDeployment();
  const gatewayAddress = await gateway.getAddress();
  console.log("2. TrustedGatewayBurner deployed to: ", gatewayAddress);

  // ============================================
  // STEP 3: Deploy Web3Governance
  // ============================================
  const Web3Governance = await ethers.getContractFactory("Web3Governance");
  const web3Governance = await Web3Governance.deploy(rupiahToken, deployer);
  await web3Governance.waitForDeployment();
  const web3GovernanceAddress = await web3Governance.getAddress();
  console.log("3. Web3Governace deployed to: ", web3GovernanceAddress);

  // ============================================
  // STEP 4: SetGovernance in RupiahToken
  // ============================================
  const tx4 = await rupiahToken.setGovernance(web3GovernanceAddress);
  await tx4.wait();
  console.log("4. setGovernance() done");

  // ============================================
  // STEP 5: SetGateway in RupiahToken
  // ============================================
  const tx5 = await rupiahToken.setGateway(gatewayAddress);
  await tx5.wait();
  console.log("5. setGateway() done");

  // ============================================
  // SUMMARY DEPLOYMENTS
  // ============================================
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("RupiahToken                 : ", tokenAddress);
  console.log("TrustedGatewayBurner        : ", gatewayAddress);
  console.log("Web3Governance              : ", web3GovernanceAddress);
  console.log("Deployer Address            : ", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
