# @repo/web: Frontend (Vite + React SPA)

Frontend GovernanceFund: **Public Budget Explorer** (tanpa login) dan dashboard per-role dengan
aksi on-chain. Single-Page App tanpa SSR (cukup untuk cakupan akademik).

> Bagian dari monorepo [`governancefund`](../../README.md). Mengimpor `@repo/shared` untuk ABI,
> alamat kontrak, konstanta EIP-712, dan `computeProgramHash`; jangan menduplikasinya.

## Tech Stack

- **Vite 6 + React 18.3** (SPA). Variabel lingkungan lewat `import.meta.env.VITE_*`.
- **React Router 7** (`react-router-dom`): routing sisi klien, semua halaman dimuat `lazy()` +
  `Suspense` dengan indikator progres rute.
- **Tailwind CSS v4** (CSS-first, tanpa `tailwind.config`, lewat `@tailwindcss/vite`) +
  **shadcn/ui** (Radix primitives) + `tw-animate-css`.
- **Wagmi v2 + Viem v2 + RainbowKit v2**: koneksi wallet (butuh Reown/WalletConnect `projectId`);
  `useWriteContract` untuk transaksi dan `useSignTypedData` untuk EIP-712. Tidak memakai ethers.js.
- **@tanstack/react-query v5**: server-state + polling eventual-consistency
  (default `staleTime` 30 dtk, `retry` 1, tanpa refetch saat window focus).
- **react-hook-form + Zod** (form dan validasi), **Axios** (`withCredentials`) ke Express,
  **@tanstack/react-table**, **date-fns**, **sonner** (toast), **lucide-react**.
- **@marsidev/react-turnstile**: Cloudflare Turnstile pada form auth (aktif hanya di build production).
- **framer-motion + GSAP + Lenis + lottie-react**: **hanya** untuk landing/immersive; dashboard tetap
  minim animasi.
- **Fonts:** Space Grotesk (display), Inter (body), JetBrains Mono (hash/wallet).
- **TypeScript 7** mode `strict` (`noUnusedLocals`, `noUnusedParameters`). Alias impor `@/` → `src/`.

## Halaman dan Rute

| Rute | Akses | Keterangan |
|---|---|---|
| `/`, `/about` | publik | Landing dan penjelasan sistem |
| `/programs`, `/programs/:id` | publik | **Explorer** dengan tab `ACTIVE`, `FINISHED`, `FLAGGED`, `FRAUD`; detail: milestone, tanda tangan, penarikan, freeze/banding |
| `/users`, `/users/:id` | publik | Direktori dan profil publik (reputasi) |
| `/governance/roles` | publik | Log perubahan role |
| `/governance/votes`, `/governance/votes/:id` | publik | Voting role (admin) |
| `/governance/program-votes` | publik | Siapa memilih program apa (proposal dan unfreeze) |
| `/gateway/redemptions` | publik | Penebusan eIDR di gateway |
| `/register`, `/login`, `/forgot-password` | hanya tamu | Auth (Turnstile di production) |
| `/reset-password`, `/verify-email`, `/resend-verification` | publik | Tindak lanjut email |
| `/profile` | login | Profil, avatar/banner, ikat wallet |
| `/dashboard` | login | Beranda per-role (`PicPanel`, `ValidatorPanel`, `AuditorPanel`, `AdminPanel`, checklist onboarding) |
| `/dashboard/programs`, `/dashboard/create-program`, `/dashboard/programs/:id/manage`, `/dashboard/redeem` | **PIC** | Program saya, buat program, kelola (bukti milestone, rilis, tarik dana, finalisasi, banding), tebus token |
| `/dashboard/proposals`, `/dashboard/appeals` | **VALIDATOR** | Voting proposal dan banding unfreeze |
| `/dashboard/audit` | **AUDITOR** | Freeze program + bukti |
| `/dashboard/governance` | **ADMIN** | Usul/voting role, grant/revoke PIC, verifikasi identitas user |
| `/dashboard/sign` | **ADMIN / VALIDATOR / AUDITOR** | Tanda tangan EIP-712 milestone |
| `/dashboard/gateway` | login | Konsol operator gateway; aksi hanya aktif bila wallet = `gatewayOwner` |

Pembatasan role dilakukan oleh `RoleRoute` di sisi UI hanya demi UX; otoritas sebenarnya ada di
backend dan kontrak.

## Struktur (`src/`)

```
config/       # env (VITE_*), wagmi, alamat+ABI kontrak, roles
providers/    # AppProviders (Wagmi + React Query + RainbowKit + tooltip + toast), SmoothScroll (landing)
lib/          # instance axios (+ interceptor 401), store progres rute
services/     # modul pemanggil API (authApi, programApi, votesApi, signatureApi, ...) membuka envelope
hooks/        # React Query + hook on-chain (lihat tabel di bawah)
schemas/      # skema Zod (auth, program, profile, withdraw)
types/        # tipe domain (plain .ts, bukan .d.ts)
utils/        # format, cn, error, bft (threshold), poll (pollUntil)
routes/       # AppRoutes (semua halaman lazy)
pages/        # landing, explorer, auth, public/*, dashboard/*
components/   # backgrounds, charts, dashboard, landing, layout, motion, ui (shadcn + komponen kustom)
```

## Pola Aksi On-Chain

Tulis via Wagmi `writeContract` (**bukan** API) → tunggu receipt → *poll* endpoint baca
(`pollUntil`, interval 2,5 dtk, batas 90 dtk) sampai webhook memperbarui backend → tampilkan state
"menunggu sinkronisasi" (tidak pernah optimistic-success). Diabstraksi di `hooks/useTxThenSync.ts`
dengan state `idle → wallet → mining → syncing → success/error`.

`hooks/useWalletGuard.ts` memastikan wallet terhubung, **sama dengan wallet yang diikat ke akun**,
dan berada di jaringan Base Sepolia (otomatis meminta ganti jaringan) sebelum transaksi atau
penandatanganan.

| Hook | Fungsi kontrak / aksi |
|---|---|
| `useSubmitProposal` | `submitProposal` (memakai `/programs/:id/onchain-payload`) |
| `useVoteProposal` | `voteProposal` |
| `useSignMilestone` | Tanda tangan EIP-712 `MilestoneApproval` → `POST /signatures` |
| `useReleaseMilestone` | `executeMilestoneRelease` |
| `usePicActions` | `executePicWithdrawal`, `finalizeMilestone`, `proposeUnfreezeAppeal` |
| `useFreezeProgram` | `forceFreezeProgram` |
| `useVoteUnfreeze` | `voteUnfreezeAppeal` |
| `useAdmin` | `proposeRoleGrant`, `proposeRoleDevote`, `voteRoleProposal`, `grantPicRole`, `revokePicRole` |
| `useRedeemToken` | `approve`, `requestRedemption`, `cancelRedemption` + baca `allowance`, `balanceOf`, `getRedemption`, `RECLAIM_TIMEOUT` |
| `useGatewayActions` / `useGatewayOwner` | `confirmRedemption`, `cancelRedemption` / baca `gatewayOwner` |
| `useGovReads` | Baca `totalAdminsCount`, `totalValidatorsCount`, `proposalVotes`, `hasVotedProposal`, `roleVotes`, `unfreezeAppeals` |

> **Sesi login:** JWT disimpan sebagai cookie `token` `httpOnly` (tak terbaca JS); Axios dipanggil
> dengan `withCredentials: true` ke `${VITE_API_URL}/api/v1`, tanpa token di `localStorage`.
> `useMe()` (`hooks/useAuth.ts`) memanggil `GET /auth/me` (cache 60 dtk); respons 401 selain untuk
> `/auth/me`, `/auth/login`, `/auth/register` memicu toast "Sesi berakhir" dan redirect ke `/login`.

## Environment (`apps/web/.env`)

| Var | Wajib | Keterangan |
|---|---|---|
| `VITE_WC_PROJECT_ID` | ✓ | WalletConnect/Reown project id (aplikasi melempar error saat boot bila kosong) |
| `VITE_API_URL` | – | URL Express (default `http://localhost:4000`) |
| `VITE_CHAIN_ID` | – | Default `84532` (Base Sepolia) |
| `VITE_ALCHEMY_RPC` | – | RPC Alchemy absolut; kosong/tidak valid → fallback RPC publik yang di-rate-limit |
| `VITE_TURNSTILE_SITE_KEY` | – | Site key Turnstile (kosong → widget nonaktif) |

## Perintah

```bash
pnpm --filter @repo/web dev        # vite dev  → http://localhost:3000
pnpm --filter @repo/web build      # tsc --noEmit && vite build
pnpm --filter @repo/web preview    # pratinjau hasil build
pnpm --filter @repo/web typecheck  # tsc --noEmit
```

Tidak ada script `lint`/ESLint di paket ini; pengecekan kualitas dilakukan lewat `typecheck`.

## Catatan

- **Turnstile** nonaktif penuh di dev (`import.meta.env.PROD`) dan hanya aktif di build production
  bila site key diisi.
- Landing di-`lazy()` sehingga dependensi immersive (framer/gsap/lenis) masuk chunk terpisah;
  dashboard tetap ringan.
- `vite.config.ts` menetapkan `server.port = 3000` dan daftar `allowedHosts` untuk tunnel ngrok
  (dipakai saat uji webhook/wallet seluler). Ganti atau hapus host tersebut di lingkungan Anda.
- **Deploy: Vercel** (`vercel.json` me-*rewrite* semua path ke `index.html` untuk SPA). Daftarkan
  domain Vercel di Reown (WalletConnect) dan Turnstile. Karena API berada di domain berbeda, cookie
  sesi memakai `SameSite=None; Secure` di production.
