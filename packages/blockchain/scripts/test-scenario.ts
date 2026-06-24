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
        auditor2,
        pic1,
        hacker,
        fakePIC
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
    // PHASE 1: DEPLOYMENT & SET INTER-CONTRACT PERMISSIONS
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
    const governanceAddress = await web3Governance.getAddress();

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
    // PHASE 2: MULTI ADMIN ONBOARDING AND DYNAMIC BFT THRESHOLD CHECK
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

    // Onboarding Admin 5 (Total Admin = 4, Threshold BFT = 3 Vote)
    await (await web3Governance.connect(rootAdmin).proposeRoleGrant(admin5.address, ADMIN_ROLE)).wait();
    await (await web3Governance.connect(rootAdmin).voteRoleProposal(voteId)).wait();
    logTest("Root Admin", "Vote for Admin 5 Grant Admin (Progress: 1/3 Vote)", true);
    
    // Admin 2, 3 will vote (Admin 4 abstain/rejects by ignoring)
    await (await web3Governance.connect(admin2).voteRoleProposal(voteId)).wait();
    logTest("Admin 2", "Vote for Admin 5 Grant Admin (Progress: 2/3 Vote)", true);
    
    await (await web3Governance.connect(admin3).voteRoleProposal(voteId)).wait();
    voteId++;
    logTest("Admin 3", "Vote for Admin 5 Grant Admin (Progress: 3/3 Vote)", true, "- Admin 5 Active. Total Admins = 5");

    // Revoking Admin 5 (Total Admin = 5, Threshold BFT = 4 Vote)
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

    // =================================================================
    // PHASE 3: MULTI ADMIN VOTE FOR VALIDATOR & AUDITOR (Threshold = 3 of 4 Admins)
    // =================================================================

    // Onboard Validator 1.
    await(await web3Governance.connect(rootAdmin).proposeRoleGrant(validator1.address,VALIDATOR_ROLE)).wait();
    await(await web3Governance.connect(rootAdmin).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin2).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin3).voteRoleProposal(voteId)).wait();
    logTest("Admin 1,2,3", "Vote for Validator 1 Grant Validator (3/4 Vote)", true, "- Validator 1 Active");
    voteId++;

    // Onboard Validator 2.
    await(await web3Governance.connect(admin2).proposeRoleGrant(validator2.address,VALIDATOR_ROLE)).wait();
    await(await web3Governance.connect(rootAdmin).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin3).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin4).voteRoleProposal(voteId)).wait();
    logTest("Admin 1,3,4", "Vote for Validator 2 Grant Validator (3/4 Vote)", true, "- Validator 2 Active");
    voteId++;
    
    // Onboard Validator 3.
    await(await web3Governance.connect(admin3).proposeRoleGrant(validator3.address,VALIDATOR_ROLE)).wait();
    await(await web3Governance.connect(rootAdmin).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin2).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin4).voteRoleProposal(voteId)).wait();
    logTest("Admin 1,2,4", "Vote for Validator 3 Grant Validator (3/4 Vote)", true, "- Validator 3 Active");
    voteId++;

    // Onboard Auditor 1.
    await(await web3Governance.connect(rootAdmin).proposeRoleGrant(auditor1.address, AUDITOR_ROLE)).wait();
    await(await web3Governance.connect(admin2).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin3).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin4).voteRoleProposal(voteId)).wait();
    logTest("Admin 2,3,4", "Vote for Auditor 1 Grant Auditor (3/4 Vote)", true, "- Auditor 1 Active");
    voteId++;

    // Onboard Auditor 2.
    await(await web3Governance.connect(rootAdmin).proposeRoleGrant(auditor2.address, AUDITOR_ROLE)).wait();
    await(await web3Governance.connect(admin2).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin3).voteRoleProposal(voteId)).wait();
    await(await web3Governance.connect(admin4).voteRoleProposal(voteId)).wait();
    logTest("Admin 2,3,4", "Vote for Auditor 2 Grant Auditor (3/4 Vote)", true, "- Auditor 2 Active");
    voteId++;


    // =================================================================
    // PHASE 4: PIC REGISTRATION & BYPASS ATTEMPT BY HACKER
    // =================================================================

    // Hacker trying to register his self as PIC via voting proposal
    try {
        await web3Governance.connect(rootAdmin).proposeRoleGrant(hacker.address, PIC_ROLE);
        logTest("Root Admin", "Trying to grant Fake PIC to proposal role", false);
    } catch (e) {
        logTest("Root Admin", "Trying to grant Fake PIC to proposal role", true, "- Revert cannot propose PIC role");
    }

    // Direct grant from Admin
    await(await web3Governance.connect(rootAdmin).grantPicRole(pic1.address)).wait();
    logTest("Root Admin", "Execute direct grant PIC role to PIC 1", true, "- PIC 1 Active");

    // Hacker try direct grant PIC role
    try {
        await web3Governance.connect(hacker).grantPicRole(hacker.address);
        logTest("Hacker", "Trying to directly execute grantPicRole to himself", false);
    } catch (e) {
        logTest("Hacker", "Trying to directly execute grantPicRole to himself", true, "- Revert (Not Admin)");
    }

    // Admin smuggle Fake PIC (Hacker)
    await(await web3Governance.connect(admin3).grantPicRole(fakePIC.address)).wait();
    logTest("Admin 3", "Execute direct grant PIC role to fake PIC", true, "- fake PIC Active but cannot bypass voting from Multi Validator and Auditor");


    // =================================================================
    // PHASE 5: PROPOSAL LIFECYCLE & VALIDATOR VOTING (BFT N=3, THRESHOLD=3)
    // =================================================================

    const programId = 1;
    const programHash = ethers.id("Proposal_Anti_Korupsi_IDR_2026");
    const totalBudget = ethers.parseEther("5000000");
    const milestoneCount = 2;

    // PIC 1 asked proposal.
    await(await web3Governance.connect(pic1).submitProposal(programId, programHash, totalBudget, milestoneCount)).wait();
    logTest("PIC 1", "Submit Funding Proposal  (ID: 1, Budget: 5 Mill, 2 Milestone)", true, "- Status: PENDING");

    // Multi Validator vote to approve the program (BFT 67% dari 3 Node = 3 Vote)
    await(await web3Governance.connect(validator1).voteProposal(programId)).wait();
    await(await web3Governance.connect(validator2).voteProposal(programId)).wait();
    logTest("Validator 1,2", "Approve PIC 1 Program (Progress: 2/3)", true);
    
    // Hacker trying to vote program.
    try {
        await(await web3Governance.connect(hacker).voteProposal(programId)).wait();
        logTest("Hacker", "Trying to vote program", false);
    } catch (e) {
        logTest("Hacker", "Trying to vote program", true, "- Revert (Not Validator)");
    }
    
    // validator 3 vote for pic 1 program
    await(await web3Governance.connect(validator3).voteProposal(programId)).wait();
    logTest("Validator 3", "Approve PIC 1 Program (Progress: 3/3)", true, "- Program Approved");

    // Fake PIC create proposal program
    const fakeprogramId = 2;
    const fakeprogramHash = ethers.id("Proposal_Anti_Korupsi_IDR_2026 FAKE");
    const faketotalBudget = ethers.parseEther("1000000");
    const fakemilestoneCount = 3;
    
    await(await web3Governance.connect(fakePIC).submitProposal(fakeprogramId, fakeprogramHash, faketotalBudget, fakemilestoneCount)).wait();
    logTest("Fake PIC", "Submit Funding Proposal  (ID: 2, Budget: 1 Mill, 2 Milestone)", true, "- Status: PENDING but no one vote");

    // Root Admin notice Admin 3 grant role to fake PIC so he revoked it.
    await(await web3Governance.connect(rootAdmin).revokePicRole(fakePIC.address)).wait();
    logTest("Root Admin", "Revoke fake PIC role after suspicious proposal", true, "- Proposal ID 2 stuck PENDING, no validator votes");

    // PIC 1 create another program but not one vote until 7 days
    const anotherprogramId = 3;
    const anotherprogramHash = ethers.id("Proposal_Anti_Korupsi_IDR_2026 Another");
    const anothertotalBudget = ethers.parseEther("1000000");
    const anothermilestoneCount = 3;

    await(await web3Governance.connect(pic1).submitProposal(anotherprogramId, anotherprogramHash, anothertotalBudget,anothermilestoneCount)).wait();
    logTest("PIC 1", "Submit Another Funding Proposal  (ID: 3, Budget: 1 Mill, 3 Milestone)", true, "- Status: PENDING");

    // Blocktime stamp passed 7 days
    await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 30]);
    await ethers.provider.send("evm_mine", []);

    // code revert karna validator tidak boleh vote lagi
    try {
        await(await web3Governance.connect(validator1).voteProposal(anotherprogramId)).wait();
        logTest("Validator 1", "Trying to vote program that already expired", false);
    } catch (e) {
        logTest("Validator 1", "Trying to vote program that already expired", true, "- Revert (Program vote phase is expired)");
    }

    
    // =================================================================
    // PHASE 6: CRYPTOGRAPHY DATA STRUCTURE EIP-712
    // =================================================================

    const milestoneIndex = 0;
    const milestoneBudget = ethers.parseEther("2500000");
    const evidenceHash = ethers.id("Proof_Sign_Actor_With_EIP712_Technique");

    const domain = {
        name: "GovernanceAntiCorruption",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: governanceAddress
    };

    const types = {
        MilestoneApproval: [
            { name: "programId", type: "uint256" },
            { name: "milestoneIndex", type: "uint256" },
            { name: "milestoneBudget", type: "uint256" },
            { name: "evidenceHash", type: "bytes32" }
        ]
    };

    const payload = { programId, milestoneIndex, milestoneBudget, evidenceHash };

    // Signing Multi Structure in off-chain.
    const sigAdmin = await rootAdmin.signTypedData(domain, types, payload);
    const sigValidator = await validator1.signTypedData(domain, types, payload);
    const sigAuditor = await auditor1.signTypedData(domain, types, payload);
    const sigHacker = await hacker.signTypedData(domain, types, payload);

    // Hacker trying to false authentication sign data
    try {
        await web3Governance.connect(pic1).executeMilestoneRelease(
            programId,
            milestoneIndex,
            milestoneBudget,
            evidenceHash,
            sigHacker,
            sigValidator,
            sigAuditor
        );
        logTest("PIC 1", "Trying to release fund quota with incorrect role signature", false);
    } catch (e) {
        logTest("PIC 1", "Trying to release fund quota with incorrect role signature", true, "- Revert (Role validation refused)");
    }

    // PIC 1 try to manipulate milestone 1 budget
    try {
        await web3Governance.connect(pic1).executeMilestoneRelease(
            programId,
            milestoneIndex,
            ethers.parseEther("5000000"),
            evidenceHash,
            sigAdmin, sigValidator, sigAuditor
        );
        logTest("PIC 1", "Trying to release with tampered milestoneBudget", false);
    } catch (e) {
        logTest("PIC 1", "Trying to release with tampered milestoneBudget", true, "- Revert (signature no longer matches altered data)");
    }

    // PIC 1 Claim 3 verified sign to release fund
    await(await web3Governance.connect(pic1).executeMilestoneRelease(
        programId,
        milestoneIndex,
        milestoneBudget,
        evidenceHash,
        sigAdmin,
        sigValidator,
        sigAuditor
    )).wait();
    logTest("PIC 1", "Milestone 1 release fund with 3 verified signature EIP 712", true, "- Milestone now is DRAWABLE");

    // milestone release, checking state
    const prop = await web3Governance.proposals(programId);

    logTest("System", "Verify program state after milestone release", true, 
        `- Status: ${prop.status} (2=DRAWABLE), Allocated: ${ethers.formatEther(prop.currentAllocatedBalance)} eIDR`
    );

    // =================================================================
    // PHASE 7: WITHDRAWAL WITH FORENSIC ON-CHAIN DATA (MINT-ON-DEMAND)
    // =================================================================

    // hacker trying to withdraw fund in program id 1
    try {
        await web3Governance.connect(hacker).executePicWithdrawal(programId, ethers.parseEther("1500000"), "Hacker corp", "Hijack Fund");
        logTest("Hacker", "Trying to withdraw fund in program id 1", false);
    } catch (e) {
        logTest("Hacker", "Trying to withdraw fund in program id 1", true, "- Revert (Not same PIC wallet)");
    }

    // PIC trying to withdraw fund excess the limit
    try {
        await web3Governance.connect(pic1).executePicWithdrawal(programId, ethers.parseEther("999999999"), "PIC Fraud", "HAHA GOT YOU");
        logTest("PIC 1", "Trying to withdraw fund excess the limit", false);
    } catch (e) {
        logTest("PIC 1", "Trying to withdraw fund excess the limit", true, "- Revert (Amount excess the limit)");
    }

    // PIC withdraw fund in correct ways
    await(await web3Governance.connect(pic1).executePicWithdrawal(programId, ethers.parseEther("1000000"), "Bahan Baku Tbk", "Membeli Bahan Baku")).wait();
    logTest("PIC 1", "Withdraw 1 Mill eIDR from milestone", true, "- 1 Mill eIDR send to PIC Wallet");

    // System checking PIC's wallet
    const pic1Balance = await rupiahToken.connect(pic1).balanceOf(pic1.address);
    logTest("System", "Checking PIC's eIDR Amount", true, `- PIC's eIDR : ${ethers.formatEther(pic1Balance)} eIDR`);
    
    // System checking amount withdrawal left from programId 1
    const prop1 = await web3Governance.proposals(programId);
    logTest("System", "Checking remaining balance to withdraw in program id 1", true, `- Status: ${prop1.status} (2=DRAWABLE), Total Allocated Fund = ${ethers.formatEther(prop1.totalAllocatedSoFar)} eIDR, Remaining Fund = ${ethers.formatEther(prop1.currentAllocatedBalance)} eIDR`);

    // PIC withdraw all remaining fund
    await(await web3Governance.connect(pic1).executePicWithdrawal(programId, ethers.parseEther("1500000"), "Dana Berkah Tbk", "Membeli Sembako")).wait();
    logTest("PIC 1", "Withdraw 1.5 Mill eIDR from milestone", true, "- 1.5 Mill eIDR send to PIC Wallet");

    // System checking PIC's wallet
    const pic1Balance2 = await rupiahToken.connect(pic1).balanceOf(pic1.address);
    logTest("System", "Checking PIC's eIDR Amount", true, `- PIC's eIDR : ${ethers.formatEther(pic1Balance2)} eIDR`);
    const prop2 = await web3Governance.proposals(programId);
    logTest("System", "Checking remaining balance to withdraw in program id 1", true, `- Status: ${prop2.status} (3=MILESTONE_ACHIEVED), Total Allocated Fund = ${ethers.formatEther(prop2.totalAllocatedSoFar)} eIDR, Remaining Fund = ${ethers.formatEther(prop2.currentAllocatedBalance)} eIDR`);

    // =================================================================
    // PHASE 8: ANTI COLLUSION ACTOR MILESTONE SIGNATURE
    // =================================================================

    // Milestone index 1, after milestone 0 finished.
    const milestoneIndex1 = 1;
    const evidenceHash1 = ethers.id("Evidance_Milestone_1_Proposal_1");
    const payload1Bad = { programId, milestoneIndex: milestoneIndex1, milestoneBudget: ethers.parseEther("2500000"), evidenceHash: evidenceHash1}

    const sigAdminBad = await rootAdmin.signTypedData(domain, types, payload1Bad);
    const sigValidatorBad = await validator2.signTypedData(domain, types, payload1Bad);
    const sigAuditorBad = await auditor1.signTypedData(domain, types, payload1Bad);

    try {
        await web3Governance.connect(pic1).executeMilestoneRelease(
            programId, milestoneIndex1, ethers.parseEther("2500000"), evidenceHash1, sigAdminBad, sigValidatorBad, sigAuditorBad
        );
        logTest("PIC 1", "Trying to release milestone 1 with few same signers (collusion)", false);
    } catch (e) {
        logTest("PIC 1", "Trying to release milestone 1 with few same signers (collusion)", true, "- Revert (Anti-Collusion: signer already signed before)");
    }

    // Milestone 1, Different admin/validator/auditor
    const sigAdmin1 = await admin2.signTypedData(domain, types, payload1Bad);
    const sigValidator1 = await validator2.signTypedData(domain, types, payload1Bad);
    const sigAuditor1 = await auditor2.signTypedData(domain, types, payload1Bad);  

    await(await web3Governance.connect(pic1).executeMilestoneRelease(
        programId, milestoneIndex1, ethers.parseEther("2500000"), evidenceHash1,
        sigAdmin1, sigValidator1, sigAuditor1
    )).wait();
    logTest("PIC 1", "Release milestone 1 with different signers", true, "- Milestone 1 DRAWABLE");

    // =================================================================
    // PHASE 9: EMERGENCY INTERVENTION - AUDITOR FORCE FREEZE BLOCK
    // =================================================================

    // Auditor smell something wrongs
    await(await web3Governance.connect(auditor1).forceFreezeProgram(programId)).wait();
    logTest("Auditor 1", "Detected anomali on system", true, "- Status: FROZEN");

    // system checking status program
    const prop3 = await web3Governance.proposals(programId);
    logTest("System", "Checking status program with id 1", true, `- Status: ${prop3.status}  (4 = FROZEN)`);

    try {
        await web3Governance.connect(pic1).executePicWithdrawal(programId, ethers.parseEther("500000"), "Vendor A", "Buy a item");
        logTest("PIC 1", "Trying to force withdrawal fund with Frozen status condition", false);
    } catch (e) {
        logTest("PIC 1", "Trying to force withdrawal fund with Frozen status condition", true, "- Revert (Status: FROZEN)");
    }
}   

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});