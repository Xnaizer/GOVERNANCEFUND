# @repo/database — Prisma Schema + Client

Lapisan data GovernanceFund: skema Prisma, Prisma Client ter-generate, dan seed. Diimpor oleh
`apps/api` untuk semua operasi DB.

> Bagian dari monorepo [`governancefund`](../../README.md). Diimpor sebagai `@repo/database`
> (mengekspor singleton `prisma` + re-export tipe `@prisma/client`).

## Database

**Supabase PostgreSQL** via **session pooler** (koneksi langsung `db.<ref>…:5432` gagal `P1001`).
Datasource mendeklarasikan `url` (transaction pooler `:6543?pgbouncer=true`) dan `directUrl`
(session pooler `:5432`). **Prisma 5.20.0** (Prisma 7 belum kompatibel di setup ini).

## Skema (`prisma/schema.prisma`)

**12 enum** + **15 model**. Enum utama: `Role`, `ProposalStatus` (7 nilai, termasuk
`FRAUD_CONFIRMED`), `Integrity`, `DisplayTab`, `MilestoneStatus`, `SignerRole`, `ReputationReason`
(5), `FreezeResult`, `RedemptionStatus`, `RoleChangeType`.

Model inti: `User`, `Program` (+ lokasi/executor/kategori, semua nullable untuk orphan),
`Milestone`, `MilestoneSignature`, `WithdrawalRecord`, `RoleVote`/`RoleVoteBallot`,
`UnfreezeVote`/`UnfreezeVoteBallot`, `FreezeOutcome`, `ReputationLog`, `RoleChangeLog`,
`VerificationToken`.

**Trigger imutabilitas** (`lock_sealed_program_fields`): baris `Program` ber-status terkunci
(`APPROVED`/`DRAWABLE`/…/`FRAUD_CONFIRMED`/`COMPLETED`) menolak UPDATE field tersegel & DELETE —
lapisan anti-fraud tingkat DB.

## Struktur

```
prisma/
  schema.prisma   # 12 enum + 15 model
  seed.ts         # seed variatif (@faker-js/faker, locale id_ID)
src/
  index.ts        # export singleton `prisma` + re-export tipe Prisma
generated/        # Prisma Client ter-generate
```

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
pnpm --filter @repo/database db:seed        # isi data contoh (faker)
```

> Jalankan `db:generate` setiap habis `pnpm install` (client ter-generate ikut terhapus saat
> node_modules dibersihkan) atau setelah mengubah `schema.prisma`.
