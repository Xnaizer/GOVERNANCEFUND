# @repo/shared — Kode & Konstanta Bersama

Sumber tunggal untuk artefak yang **harus identik** antara frontend (`apps/web`) dan backend
(`apps/api`): ABI kontrak, alamat, konstanta EIP-712, dan algoritma hash program.

> Bagian dari monorepo [`governancefund`](../../README.md). Diimpor sebagai `@repo/shared`.

## Isi (`src/`)

```
abi/
  Web3Governance.json         # ABI hasil compile Hardhat
  RupiahToken.json
  TrustedGatewayBurner.json
constants/
  contract.ts                 # CONTRACT_ADDRESS (rupiahToken, gateway, governance, deployer)
  eip712.ts                   # EIP712_DOMAIN + EIP712_TYPES (MilestoneApproval)
utils/
  programHash.ts              # computeProgramHash() — SHA-256 atas 15 field
index.ts                      # barrel export
```

## `computeProgramHash` — Kontrak Kritikal

`programHash = "0x" + sha256(join(15 field, "|"))`, dipakai di **3 tempat yang WAJIB sepakat**:
backend saat membuat program, PIC sebelum submit ke kontrak, dan webhook saat verifikasi.

**15 field (urutan tetap):** `programId, title, description, totalBudget, picWallet, milestoneCount,
province, regency, district, locationAddress, executorName, executorRegistration, category,
institutionName, fiscalYear`.

**Aturan kanonikalisasi:** `null/undefined → ""`, tiap nilai `String().trim()`, `picWallet`
`.toLowerCase()`, gabung dengan `"|"`, library **`js-sha256`** (bukan `node:crypto` — harus jalan di
browser juga).

> Mengubah urutan/isi field akan merusak deteksi orphan/hash-mismatch di semua komponen. Jangan diubah.

## EIP-712

`EIP712_DOMAIN.name` harus `GovernanceAntiCorruption`, `version` `1`, `chainId` `84532`,
`verifyingContract` = alamat `Web3Governance` yang live. Field `evidenceHash` (bukan "evidanceHash")
harus persis cocok dengan `TYPEHASH` kontrak.

## Catatan

Package murni pustaka (tanpa script build sendiri) — dikonsumsi langsung oleh apps via workspace.
Setiap redeploy kontrak, perbarui `contract.ts` **dan** `verifyingContract` di `eip712.ts`.
