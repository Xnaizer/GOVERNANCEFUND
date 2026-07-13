# @repo/api — Backend (Express.js + TypeScript)

REST API GovernanceFund: autentikasi, endpoint baca program/vote/user publik, **ingesti webhook
Alchemy** (sinkronisasi event on-chain → Supabase), reputasi, pengumpulan tanda tangan EIP-712,
upload (Cloudinary/IPFS), dan infrastruktur asinkron (BullMQ).

> Bagian dari monorepo [`governancefund`](../../README.md). Mengimpor `@repo/database` (Prisma) &
> `@repo/shared` (ABI, EIP-712, `computeProgramHash`).

## Prinsip Inti

- **Blockchain = sumber kebenaran.** Aksi finansial (submit/vote/approve/freeze/withdraw/grant/burn)
  **tidak punya endpoint** — semua on-chain via Wagmi; backend menyerapnya lewat webhook.
- Setiap event on-chain **di-cross-check** ke Supabase; anomali diklasifikasikan (`ORPHAN`/`HASH_MISMATCH`),
  tidak pernah didiam-diamkan.
- Jangan percaya data Supabase untuk keputusan on-chain — verifikasi ulang via `ecrecover`/view call.

## Tech Stack

Express 4.21 · **tsx** (dev watch) · **tsup** (bundle prod) · Prisma 5.20 · BullMQ (Upstash Redis via
ioredis) · JWT (cookie httpOnly + fallback Bearer) · bcryptjs · Nodemailer (EJS) · **Pino** (log
terstruktur, redaksi rahasia) · **Sentry** · Alchemy SDK · Cloudinary + **Pinata** (IPFS) · Multer ·
helmet · express-rate-limit · sanitize-html · **Cloudflare Turnstile** (anti-bot pada auth).

## Struktur (`src/`)

```
index.ts        # entrypoint (connect DB retry, start server + workers, graceful shutdown)
instrument.ts   # inisialisasi Sentry (diimpor PALING awal)
app.ts          # susunan middleware Express
config/         # env (validasi Zod), pinata, cloudinary, dll.
middleware/     # auth, requireRole, rateLimiter, turnstile, webhookVerify, upload, errorHandler
routes/         # auth, users, programs, signatures, uploads, public, webhook
controllers/    # handler tiap route
services/       # logika bisnis (auth, program, webhook, reputation, signature, ipfs, ...)
validators/     # skema Zod + helper sanitasi
queues/         # definisi BullMQ (webhook-ingestion, reconciliation)
workers/        # worker BullMQ + scheduler rekonsiliasi
templates/      # email EJS (verify, reset password)
lib/            # prisma, redis, logger
utils/          # AppError, asyncHandler, response envelope
```

## Alur Penting

- **Webhook Alchemy** (`routes/webhook.ts`) pakai `express.raw()` + verifikasi HMAC → **enqueue** ke
  BullMQ → balas 200 cepat. Worker men-decode event (viem `decodeEventLog`, dedup `txHash:logIndex`)
  lalu memperbarui Supabase (status, orphan, reputasi, withdrawal).
- **Rekonsiliasi** periodik (1 jam) mengaudit seluruh program on-chain vs Supabase (deteksi
  tampering/penghapusan).
- **Turnstile** (`middleware/turnstile.ts`) hanya ditegakkan di production; dev/test dilewati.

## Environment (`apps/api/.env`) — inti

`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` (≥32), `UPSTASH_REDIS_URL` (`rediss://…`),
`ALCHEMY_BASE_SEPOLIA_RPC_URL`, `ALCHEMY_WEBHOOK_SECRET`, `SMTP_*`, `FRONTEND_URL`,
`QUEUE_ADMIN_USER/PASS`, `CLOUDINARY_*`, `PINATA_JWT/GATEWAY`, `TURNSTILE_SECRET_KEY` (opsional),
`SENTRY_DSN` (opsional), `ENABLE_WORKERS` (`false` untuk hemat kuota Redis saat dev).

> **Jangan commit `.env`.** Alamat kontrak + ABI + alamat deployer aman publik (fitur transparansi).

## Perintah

```bash
pnpm --filter @repo/api dev       # tsx watch  → http://localhost:4000
```

Endpoint kesehatan: `GET /health` (cek DB + Redis). BullBoard: `/admin/queues` (basic-auth).
Deploy target: **Railway**.
