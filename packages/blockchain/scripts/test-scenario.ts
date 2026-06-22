import { network } from "hardhat";

async function main() {
    const { ethers } = await network.create();

    // Setup Test Scenario Actors.
    const [
        rootAdmin,
        admin2,
        admin3,
        admin4,
        admin5,
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
        console.log(`[ ${actor.padEnd(12)}]: ${action.padEnd(65)} ${status} ${note}`);
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

    // =================================================================
    // FASE 2: MULTI ADMIN ONBOARDING AND DYNAMIC BFT THRESHOLD CHECK
    // =================================================================

    let voteId = 0;

    // Root Admin grant user to Admin 2 -- (Total Admin = 1, Threshold BFT = 1 Vote).
    await (await web3Governance.connect(rootAdmin).proposeRoleGrant(admin2.address, ADMIN_ROLE)).wait();
    await (await web3Governance.connect(rootAdmin).voteRoleProposal(voteId)).wait();
    voteId++;
    logTest("Root Admin", "Propose & vote ADMIN_ROLE for Admin 2 (BFT Threshold 1/1)", true, "- Admin 2 Active");

    // Admin 2 grant user to Admin 3 -- (Total Admin = 2, Threshold BFT = 2 Vote).
    await (await web3Governance.connect(admin2).proposeRoleGrant(admin3.address, ADMIN_ROLE)).wait();
    await (await web3Governance.connect(admin2).voteRoleProposal(voteId)).wait();
    logTest("Admin 2", "Vote for Admin 3 Grant Admin (Progress: 1/2 Vote)", true);

    // Root Admin also vote for Admin 3 to achieve Threshold 2/2.
    await (await web3Governance.connect(rootAdmin).voteRoleProposal(voteId)).wait();
    voteId++;
    logTest("Root Admin", "Vote for Admin 3 Grant Admin (Progress: 2/2 Vote)", true, "- Admin 3 Active");

    // Admin 3 grant user to Admin 4 -- (Total Admin = 3, Threshold BFT = 3 Vote).
    await (await web3Governance.connect(admin3).proposeRoleGrant(admin4.address, ADMIN_ROLE)).wait();
    await (await web3Governance.connect(admin3).voteRoleProposal(voteId)).wait();
    logTest("Admin 3", "Vote for Admin 4 Grant Admin (Progress: 1/3 Vote)", true);

    // Root Admin and Admin 2 Also vote for Admin 4.
    await (await web3Governance.connect(rootAdmin).voteRoleProposal(voteId)).wait();
    logTest("Root Admin", "Vote for Admin 4 Grant Admin (Progress: 2/3 Vote)", true);

    try {
        await web3Governance.connect(hacker).voteRoleProposal(voteId);
        logTest("Hacker", "Trying to inject ilegal vote for Admin 4", false);
    } catch (e) {
        logTest("Hacker", "Trying to inject ilegal vote for Admin 4", true, "- Revert (Not Admin)");
    }
    
    await (await web3Governance.connect(admin2).voteRoleProposal(voteId)).wait();
    voteId++;
    logTest("Admin 2", "Vote for Admin 4 Grant Admin (Progress: 3/3 Vote)", true, "- Admin 4 Active");

    // =================================================================
    // ONBOARDING ADMIN 5 (Total Admin = 4, Threshold BFT = 3 Vote)
    // =================================================================
    await (await web3Governance.connect(rootAdmin).proposeRoleGrant(admin5.address, ADMIN_ROLE)).wait();
    await (await web3Governance.connect(rootAdmin).voteRoleProposal(voteId)).wait();
    logTest("Root Admin", "Vote for Admin 5 Grant Admin (Progress: 1/3 Vote)", true);
    
    // Admin 2, 3 will vote (Admin 4 abstain/rejects by ignoring)
    await (await web3Governance.connect(admin2).voteRoleProposal(voteId)).wait();
    logTest("Admin 2", "Vote for Admin 5 Grant Admin (Progress: 2/3 Vote)", true);
    
    await (await web3Governance.connect(admin3).voteRoleProposal(voteId)).wait();
    voteId++;
    logTest("Admin 3", "Vote for Admin 5 Grant Admin (Progress: 3/3 Vote)", true, "- Admin 5 Active. Total Admins = 5");

    // =================================================================
    // REVOKING ADMIN 5 (Total Admin = 5, Threshold BFT = 4 Vote)
    // =================================================================
    
    await (await web3Governance.connect(rootAdmin).proposeRoleDevote(admin5.address, ADMIN_ROLE)).wait();
    await (await web3Governance.connect(rootAdmin).voteRoleProposal(voteId)).wait();
    logTest("Root Admin", "Vote for Admin 5 Revoke Admin (Progress: 1/4 Vote)", true);
    
    await (await web3Governance.connect(admin2).voteRoleProposal(voteId)).wait();
    logTest("Admin 2", "Vote for Admin 5 Revoke Admin (Progress: 2/4 Vote)", true);
    
    await (await web3Governance.connect(admin3).voteRoleProposal(voteId)).wait();
    logTest("Admin 3", "Vote for Admin 5 Revoke Admin (Progress: 3/4 Vote)", true);
    
    await (await web3Governance.connect(admin4).voteRoleProposal(voteId)).wait();
    voteId++;
    logTest("Admin 4", "Vote for Admin 5 Revoke Admin (Progress: 4/4 Vote)", true, "- Admin 5 Revoked. Total Admins returns to 4");



}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});