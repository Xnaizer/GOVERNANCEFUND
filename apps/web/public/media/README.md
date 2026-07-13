# Media manifest — Landing page

Semua aset di sini bebas komersial (Unsplash license). Ganti file dengan nama sama untuk swap tanpa ubah kode.

## Gambar
| File | Slot pemakaian |
|---|---|
| `1.svg` – `5.svg` | HeroShowcase — panel galeri scroll horizontal (5 slide) |
| `hero-aurora.webp` | Background LandingHero |
| `hero-dune.webp` | Panel pemandangan halaman Tukar Token (Redeem) |
| `hero-finance.webp` | HoverFeature — kartu fitur |
| `purple-sky.webp` | HoverFeature — kartu fitur |
| `person-phone.webp` | HoverFeature — kartu fitur |

## Video (opsional — belum di-fetch)
Slot `hero.webm` + `hero.mp4` + `hero-poster.webp` bila ingin hero pakai video loop.
Sumber gratis: Coverr (coverr.co), Mixkit (mixkit.co), Pexels Video. Optimize:
```
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 0 -crf 33 -an -vf scale=1920:-2 hero.webm
ffmpeg -i input.mp4 -c:v libx264 -crf 24 -preset slow -an -vf scale=1920:-2 hero.mp4
ffmpeg -i input.mp4 -vframes 1 -q:v 3 hero-poster.jpg   # lalu convert ke webp
```
Bila `hero.webm` ada, LandingHero otomatis prefer video (lihat komponen); jika tidak, fallback ke `hero-aurora.webp` + Aurora.

## Logo (public/logos/, brand-colored SVG dari Simple Icons)
react, vite, typescript, javascript, solidity, prisma, express, ethereum, tailwindcss,
postgresql, redis, nodedotjs, supabase, vercel, walletconnect, coinbase.
