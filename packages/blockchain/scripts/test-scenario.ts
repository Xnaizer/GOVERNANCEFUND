import { network } from "hardhat";

async function main() {
    const { ethers } = await network.create();

    // Setup Test Scenario Actors.
    const [
        rootAdmin,
        admin2,
        admin3,
        admin4,
        validator1,
        validator2,
        validator3,
        auditor1,
        pic1,
        hacker
    ] = await ethers.getSigners();

    // Custom logger format.
    function logTest(actor: string, action: string, isSuccess: boolean, note: string = "") {
        const status = isSuccess ? "(1) Berhasil" : "(0) Gagal";
        console.log(`[${actor.padEnd(12)}]: ${action.padEnd(65)} ${status} ${note}`);
    }

    console.log("\n======================================================================================");
    console.log("GOVERNANCEFUND: COMPLETE END-TO-END BFT GOVERNANCE & ANTI-CORRUPTION SYSTEM AUDIT");
    console.log("======================================================================================\n");

    // =================================================================
    // FASE 1: DEPLOYMENT & SET INTER-CONTRACT PERMISSIONS
    // =================================================================

    const RupiahToken = await ethers.getContractFactory("RupiahToken");
    const rupiahToken = await RupiahToken.deploy();
    await rupiahToken.waitForDeployment();
    const tokenAddress = await rupiahToken.getAddress();

    const Gateway = await ethers.getContractFactory("TrustedGatewayBurner");
    const gateway = await Gateway.deploy(tokenAddress);
    await gateway.waitForDeployment();
    const gatewayAddress = await gateway.getAddress();

    const Web3Governance = await ethers.getContractFactory("Web3Governance");
    const web3Governance = await Web3Governance.deploy(tokenAddress, rootAdmin.address);
    await web3Governance.waitForDeployment();
    const governanceAddress = web3Governance.getAddress();

    await(await rupiahToken.setGovernance(governanceAddress)).wait();
    await(await rupiahToken.setGateway(gatewayAddress)).wait();

    logTest("System", "Deploy RupiahToken, TrustedGatewayBurner, and Web3Governance", true);
    logTest("System", "Lock contract links (setGovernace and setGateway) permanently", true);

    // Get hash role from Web3Governance.
    const ADMIN_ROLE = await web3Governance.ADMIN_ROLE();
    const VALIDATOR_ROLE = await web3Governance.VALIDATOR_ROLE();
    const AUDITOR_ROLE = await web3Governance.AUDITOR_ROLE();
    const PIC_ROLE = await web3Governance.PIC_ROLE();


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});