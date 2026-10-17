# @repo/database: Prisma Schema + Client

Lapisan data GovernanceFund: skema Prisma, Prisma Client ter-generate, seed data contoh, dan trigger
imutabilitas PostgreSQL. Diimpor oleh `apps/api` untuk semua operasi database.

> Bagian dari monorepo [`governancefund`](../../README.md). Diimpor sebagai `@repo/database`
> (mengekspor singleton `prisma`, klien tambahan `prismaDirect`, dan me-*re-export* seluruh tipe
> `@prisma/client`). Titik masuk paket: `src/index.ts` (tanpa langkah build).

## Database

**Supabase PostgreSQL** lewat pooler. Datasource mendeklarasikan `url` (transaction pooler
`:6543?pgbouncer=true`) dan `directUrl` (session pooler `:5432`). Koneksi langsung
`db.<ref>…:5432` gagal (`P1001`) pada setup ini, sehingga selalu gunakan URL pooler.
**Prisma 5.20.0** (Prisma 7 belum kompatibel di setup ini; VS Code dikonfigurasi di
`.vscode/settings.json` agar memakai `prisma-fmt` lokal).

Skema dikelola dengan **`prisma db push`** (tidak ada folder `prisma/migrations/`).

## Skema (`prisma/schema.prisma`)

**12 enum** dan **18 model**.

### Enum

| Enum | Nilai |
|---|---|
| `Role` | `USER`, `ADMIN`, `VALIDATOR`, `AUDITOR`, `PIC` |
| `TokenType` | `ACTIVATION`, `RESET_PASSWORD` |
| `ProposalStatus` | `PENDING`, `APPROVED`, `DRAWABLE`, `MILESTONE_ACHIEVED`, `FROZEN`, `COMPLETED`, `FRAUD_CONFIRMED` (urutan sama dengan enum kontrak) |
| `Integrity` | `VERIFIED`, `HASH_MISMATCH`, `ORPHAN` |
| `DisplayTab` | `ACTIVE`, `FINISHED`, `FLAGGED`, `FRAUD` |
| `MilestoneStatus` | `PLANNED`, `RELEASED`, `ACHIEVED` |
| `SignerRole` | `ADMIN`, `VALIDATOR`, `AUDITOR` |
| `ReputationReason` | `PROGRAM_COMPLETED`, `MILESTONE_FINALIZED`, `FRAUD_PROVEN`, `FALSE_FREEZE`, `VALID_FREEZE` |
| `FreezeResult` | `PENDING`, `CLEARED`, `FRAUD_PROVEN`, `UNRESOLVED` |
| `RoleChangeType` | `PIC_GRANTED`, `PIC_REVOKED`, `ROLE_GRANTED`, `ROLE_REVOKED` |
| `RedemptionStatus` | `PENDING`, `SETTLED`, `CANCELLED` |
| `OutboxStatus` | `PENDING`, `PROCESSING`, `DONE`, `FAILED` |

> `FreezeResult.UNRESOLVED` dicadangkan untuk banding yang kedaluwarsa tanpa ambang, tetapi
> **belum ditulis oleh kode** saat ini: hasil freeze tetap `PENDING`, sementara kontrak membiarkan
> program `FROZEN` permanen (lihat *Known Limitations* di README root).

### Model (18)

| Kelompok | Model | Isi |
|---|---|---|
| Akun | `User`, `VerificationToken` | Akun, profil identitas (NIK/NIP unik), `walletAddress` unik, `reputationScore` (default 75), token aktivasi/reset (disimpan sebagai hash) |
| Program | `Program`, `ProgramImage`, `Milestone`, `MilestoneSignature`, `WithdrawalRecord` | Data program (kolom lokasi/pelaksana/kategori nullable agar bisa menampung program `ORPHAN`), `programHash`, `integrity`, `displayTab`, `isOnChain`, `isOrphan`, `ipfsCid`; milestone unik per `(programId, milestoneIndex)`; tanda tangan unik per wallet **dan** per role pada satu milestone |
| Governance | `RoleVote`, `RoleVoteBallot`, `UnfreezeVote`, `UnfreezeVoteBallot`, `ProposalVoteLog`, `RoleChangeLog` | Cermin voting on-chain (suara, surat suara per pemilih), log suara proposal (siapa memilih program apa), dan jejak perubahan role |
| Freeze & reputasi | `FreezeOutcome`, `ReputationLog` | Hasil freeze per program (auditor, alasan, bukti, hasil) dan riwayat perubahan skor |
| Gateway | `Redemption` | Cermin penebusan dua fase (`redemptionId` unik, status, hash tx request/settle/cancel, `cancelledByPic`) |
| Infrastruktur | `OutboxEvent`, `JobRun` | Antrean event on-chain terdekode (unik `(txHash, logIndex)`, status, jumlah percobaan, backoff) yang **diproses worker API**; penanda waktu terakhir job terjadwal (mis. rekonsiliasi) |

Catatan desain: seluruh nilai uang disimpan sebagai **string** (rupiah utuh, eIDR 0 desimal) untuk
menghindari kehilangan presisi; alamat wallet disimpan **lowercase**.

## Trigger Imutabilitas (WAJIB diterapkan manual)

File: [`scripts/program_immutability_trigger.sql`](scripts/program_immutability_trigger.sql). Fungsi
`lock_sealed_program_fields()` + trigger `check_program_immutability` (`BEFORE UPDATE OR DELETE` pada
`"Program"`):

- Baris `Program` ber-status terkunci (`APPROVED`, `DRAWABLE`, `MILESTONE_ACHIEVED`, `FROZEN`,
  `FRAUD_CONFIRMED`, `COMPLETED`) **tidak dapat dihapus**.
- Pada baris terkunci, field tersegel **tidak dapat diubah**: `programId`, `title`, `description`,
  `totalBudget`, `picWallet`, `milestoneCount`, `province`, `regency`, `district`,
  `locationAddress`, `executorName`, `executorRegistration`, `category`, `institutionName`,
  `fiscalYear`, `programHash`. Field operasional (status, tab, integritas, dll.) tetap bisa berubah.
- Baris `PENDING` masih bebas diubah (belum tersegel).

> **`prisma db push` tidak menjalankan SQL ini.** Terapkan sekali per database lewat Supabase SQL
> Editor (atau `psql`) setelah `db:push`. Skrip bersifat idempoten (`CREATE OR REPLACE` +
> `DROP TRIGGER IF EXISTS`).

## Dua Klien Prisma (`src/index.ts`)

- **`prisma`**: klien default, memakai `DATABASE_URL` (transaction pooler `:6543?pgbouncer=true`).
  Dipakai untuk hampir semua query.
- **`prismaDirect`**: klien kedua, memakai `DIRECT_URL` (session pooler `:5432`). **Wajib** untuk
  `$transaction(async (tx) => ...)` multi-statement (di API dibungkus helper `txDirect`), karena
  PgBouncer transaction-mode melepas koneksi fisik di antar-statement dan tidak kompatibel dengan
  asumsi Prisma bahwa satu koneksi dipegang sepanjang `BEGIN…COMMIT` (berujung latensi tinggi atau
  error `prepared statement does not exist`).

## Seed (`prisma/seed.ts`)

Mengisi data contoh yang bervariasi dan **deterministik** (`@faker-js/faker` locale `id_ID`,
`faker.seed(2026)`): user per role, program dengan beragam status/integritas/tab (hash dihitung
dengan `computeProgramHash` dari `@repo/shared`), voting role, log audit, redemption, dan token
verifikasi.

- **Menghapus (truncate) tabel** sebelum mengisi; jangan dijalankan di database berisi data penting.
- **Menolak berjalan bila `NODE_ENV=production`.**
- Semua user seed memakai kata sandi **`password123`**.

## Struktur

```
prisma/
  schema.prisma   # 12 enum + 18 model
  seed.ts         # seed variatif (@faker-js/faker, id_ID, seed 2026)
scripts/
  program_immutability_trigger.sql   # trigger imutabilitas Program (diterapkan manual)
src/
  index.ts        # ekspor singleton prisma + prismaDirect + re-export tipe Prisma
```

Prisma Client hasil `generate` berada di lokasi default (`node_modules/.prisma/client`), bukan di
folder `generated/` pada paket ini.

## Environment (`packages/database/.env`)

```
DATABASE_URL=postgresql://…pooler.supabase.com:6543/postgres?pgbouncer=true   # transaction pooler
DIRECT_URL=postgresql://…pooler.supabase.com:5432/postgres                    # session pooler
```

**Jangan commit `.env`.**

## Perintah

```bash
pnpm --filter @repo/database db:generate    # prisma generate (WAJIB setelah install / ubah schema)
pnpm --filter @repo/database db:push        # push schema ke Supabase
pnpm --filter @repo/database db:seed        # isi data contoh (dilarang di production)
pnpm --filter @repo/database typecheck      # tsc --noEmit
```

> Jalankan `db:generate` setiap habis `pnpm install` (client ter-generate ikut terhapus saat
> `node_modules` dibersihkan) atau setelah mengubah `schema.prisma`. Pipeline Turborepo
> (`build`/`typecheck`) sudah memanggil `db:generate` otomatis.
