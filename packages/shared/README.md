# @repo/shared: Kode & Konstanta Bersama

Sumber tunggal untuk artefak yang **harus identik** antara frontend (`apps/web`), backend
(`apps/api`), dan seed database (`packages/database`): ABI kontrak, alamat, konstanta EIP-712,
konstanta voting, dan algoritma hash program.

> Bagian dari monorepo [`governancefund`](../../README.md). Diimpor sebagai `@repo/shared`.
> Paket pustaka murni (`main`/`types` menunjuk langsung ke `src/index.ts`), tanpa langkah build;
> satu-satunya script adalah `typecheck`.

## Isi (`src/`)

```
abi/
  Web3Governance.json         # artifact Hardhat (ABI + bytecode)
  RupiahToken.json
  TrustedGatewayBurner.json
constants/
  contract.ts                 # CONTRACT_ADDRESS (rupiahToken, trustedGatewayBurner, web3Governance, deployerAddress)
  eip712.ts                   # EIP712_DOMAIN + EIP712_TYPES (MilestoneApproval)
  voting.ts                   # VOTE_DURATION_DAYS (7) + VOTE_DURATION_MS
utils/
  programHash.ts              # computeProgramHash() + tipe ProgramHashInput
index.ts                      # barrel export + Web3GovernanceABI / RupiahTokenABI / TrustedGatewayBurnerABI
```

Ekspor utama: `CONTRACT_ADDRESS`, `EIP712_DOMAIN`, `EIP712_TYPES`, `VOTE_DURATION_DAYS`,
`VOTE_DURATION_MS`, `computeProgramHash`, `Web3GovernanceABI`, `RupiahTokenABI`,
`TrustedGatewayBurnerABI`.

### Alamat kontrak (`constants/contract.ts`)

Base Sepolia (84532):

| Kunci | Alamat |
|---|---|
| `rupiahToken` | `0x7dc8b7C37ecDA42328105d00ae23cBD9239db0A9` |
| `trustedGatewayBurner` | `0x76070Ce481c088B219FDef8F6ef0CcF91391C0A0` |
| `web3Governance` | `0x89AB7D9EBefa836F44c50f51F7d2c2831188421a` |
| `deployerAddress` | `0x3ff8C245C6499062A98Ed214EA606Ec5fa2627Dd` |

### File ABI

Tiga file di `abi/` adalah **artifact Hardhat lengkap** (berisi `abi`, `bytecode`,
`deployedBytecode`, dst.), bukan ABI murni; `index.ts` hanya mengekspos properti `.abi`. File
disalin **manual** dari `packages/blockchain/artifacts/` setelah compile/redeploy (tidak ada script
sinkronisasi). Catatan: `TrustedGatewayBurner.json` diawali BOM UTF-8; parser JSON biasa (mis.
`json.load` Python) perlu `encoding="utf-8-sig"`.

## `computeProgramHash`: Kontrak Kritikal

`programHash = "0x" + sha256(join(15 field, "|"))`, dipakai di **tiga tempat yang WAJIB sepakat**:
backend saat membuat program (`createProgram` / `onchain-payload`), PIC sebelum submit ke kontrak,
dan webhook/rekonsiliasi saat verifikasi (juga oleh seed database).

**15 field (urutan tetap):** `programId, title, description, totalBudget, picWallet, milestoneCount,
province, regency, district, locationAddress, executorName, executorRegistration, category,
institutionName, fiscalYear`.

**Aturan kanonikalisasi:** `null`/`undefined` → `""`, tiap nilai `String(x).trim()`, `picWallet`
di-`toLowerCase()`, gabung dengan `"|"`, hash dengan **`js-sha256`** (bukan `node:crypto`, karena
harus jalan di browser juga). Hasilnya dibandingkan **lowercase**.

> Mengubah urutan atau isi field akan merusak deteksi orphan/hash-mismatch di semua komponen.
> Jangan diubah.

### Test Vector untuk Implementasi Ulang (mis. Go)

Gunakan vektor berikut untuk memastikan implementasi lain (Go, Vue, mobile) menghasilkan hash yang
identik dengan versi TypeScript:

Input (15 field, `district` kosong):

| Field | Nilai |
|---|---|
| `programId` | `1` |
| `title` | `Pembangunan Jembatan Desa` |
| `description` | `Jembatan penghubung dua desa` |
| `totalBudget` | `1000000000` |
| `picWallet` | `0xAbC0000000000000000000000000000000000001` (dikecilkan menjadi `0xabc0…0001`) |
| `milestoneCount` | `2` |
| `province` | `Jawa Barat` |
| `regency` | `Bandung` |
| `district` | *(kosong)* |
| `locationAddress` | `Jl. Merdeka No. 1` |
| `executorName` | `PT Contoh Karya` |
| `executorRegistration` | `AHU-0001` |
| `category` | `Infrastruktur` |
| `institutionName` | `Dinas Pekerjaan Umum` |
| `fiscalYear` | `2026` |

String yang di-hash:

```
1|Pembangunan Jembatan Desa|Jembatan penghubung dua desa|1000000000|0xabc0000000000000000000000000000000000001|2|Jawa Barat|Bandung||Jl. Merdeka No. 1|PT Contoh Karya|AHU-0001|Infrastruktur|Dinas Pekerjaan Umum|2026
```

Hasil yang diharapkan (SHA-256 standar atas string UTF-8 di atas):

```
0xb6cf5803eb3e82fe8254603f2075a3d5dae3cf516f6af51136a6637c003e0bc2
```

## EIP-712

`EIP712_DOMAIN.name` harus `GovernanceAntiCorruption`, `version` `1`, `chainId` `84532`,
`verifyingContract` = alamat `Web3Governance` yang live. Type `MilestoneApproval` memiliki 4 field:
`programId (uint256)`, `milestoneIndex (uint256)`, `milestoneBudget (uint256)`,
`evidenceHash (bytes32)`. Nama field `evidenceHash` harus persis cocok dengan `TYPEHASH` kontrak.

## Konsumen

| Konsumen | Memakai |
|---|---|
| `apps/web` | ABI + alamat (Wagmi), `EIP712_*` (`useSignTypedData`), `computeProgramHash` |
| `apps/api` | ABI (decode event + read call), alamat (allowlist webhook), `EIP712_*` (`recoverTypedDataAddress`), `computeProgramHash` |
| `packages/database` | `computeProgramHash` (seed) |

## Catatan

Setiap redeploy kontrak, perbarui `constants/contract.ts` **dan** `verifyingContract` di
`constants/eip712.ts`, lalu salin ulang artifact ABI. Lihat
[`packages/blockchain/README.md`](../blockchain/README.md).
