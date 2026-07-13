# @repo/blockchain — Smart Contracts (Hardhat 3 + Solidity)

Kontrak pintar GovernanceFund — **lapisan yang melindungi DANA**. Semua otoritas finansial
(multi-sig, voting, freeze) ditegakkan di sini, on-chain dan tak bisa di-bypass.

> Bagian dari monorepo [`governancefund`](../../README.md). ABI hasil compile disalin ke
> `packages/shared` untuk dipakai FE (Wagmi) & BE (webhook). Solidity `pragma 0.8.35`.

## Kontrak

| File | Peran |
|---|---|
| `IRupiahToken.sol` | Interface `mint()`, `burn()`, ERC-20 standar |
| `RupiahToken.sol` | ERC-20 e-IDR **non-transferable** (transfer hanya ke gateway); `onlyGovernance` mint, `onlyGateway` burn |
| `Web3Governance.sol` | Inti governance (nama file `GovernanceAntiCorruption`) — 5 lapisan |
| `TrustedGatewayBurner.sol` | `depositAndBurnToken()` — burn token + emit event pencairan fiat (Opsi C) |

**Lima lapisan `Web3Governance`:**
1. Governance admin BFT — grant/demote role (voting 67%), grant/revoke `PIC_ROLE` (satu admin).
2. Voting proposal validator — `submitProposal` (`onlyRole(PIC_ROLE)`, min 3 validator) → `APPROVED` (67%, deadline 7 hari).
3. Rilis milestone — `ecrecover ×3` EIP-712 + validasi role + `historyOfSigners` (anti-kolusi) + cumulative budget guard → `DRAWABLE`.
4. Micro-withdrawal — `executePicWithdrawal`, `finalizeMilestone`, riwayat penarikan (mint-on-demand).
5. Freeze/unfreeze — `forceFreezeProgram` (auditor), banding **dua-arah** (approve → `DRAWABLE`, reject → `FRAUD_CONFIRMED`, deadline lewat → tetap `FROZEN`).

> Kompilasi butuh `viaIR: true`. Konsensus BFT: `threshold = ⌊(2 × N) / 3⌋ + 1`.

## EIP-712

Domain `GovernanceAntiCorruption` v`1`, chainId `84532`. Struct `MilestoneApproval(uint256 programId,
uint256 milestoneIndex, uint256 milestoneBudget, bytes32 evidenceHash)` — **harus identik** dengan
`packages/shared/src/constants/eip712.ts`. `verifyingContract` = alamat `Web3Governance` yang live.

## Struktur

```
contracts/    # 4 file .sol di atas
scripts/      # deploy.ts (urutan deploy), test-scenario.ts (skenario end-to-end Fase 1–11)
tests/        # test Hardhat
hardhat.config.ts   # Hardhat 3: defineConfig(), network base_sepolia (type "http")
```

## Perintah

```bash
pnpm --filter @repo/blockchain compile          # hardhat compile
pnpm --filter @repo/blockchain test             # hardhat test
pnpm --filter @repo/blockchain test-scenario    # skenario end-to-end
pnpm --filter @repo/blockchain deploy-base       # deploy ke Base Sepolia
```

**Urutan deploy (kritikal):** `RupiahToken` → `TrustedGatewayBurner(token)` →
`Web3Governance(token, rootAdmin)` → `token.setGovernance(gov)` → `token.setGateway(gateway)`.

> Setiap redeploy: perbarui alamat di `packages/shared` (`contract.ts` **dan** `verifyingContract`
> di `eip712.ts`), atau semua tanda tangan milestone gagal diam-diam.

## Environment (`.env`)

`DEPLOYER_PRIVATE_KEY`, RPC Base Sepolia. **Jangan commit.** Ethers.js hanya dipakai di sini
(script Hardhat) — jangan diimpor ke `apps/*`.

## Alamat Ter-deploy (Base Sepolia, 84532)

```
RupiahToken            0xECfa4Bde55D1EA9408e07948fDf0f8df04d1623a
TrustedGatewayBurner   0x6be4bB45658Eb844Ff3685Ea7E25fc51Ab1cd332
Web3Governance         0x1D4e8fD4F037830f463C3dCB0272DAcDD8dc7766
Deployer               0x3ff8C245C6499062A98Ed214EA606Ec5fa2627Dd
```
