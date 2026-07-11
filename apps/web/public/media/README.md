# Media manifest — Landing page

Semua aset di sini bebas komersial (Unsplash license). Ganti file dengan nama sama untuk swap tanpa ubah kode.

## Gambar (webp, sudah di-fetch dari Unsplash)
| File | Slot pemakaian |
|---|---|
| `hero-dune.webp` | Background utama LandingHero (gurun dreamy) |
| `hero-desert.webp` | Alternatif hero / parallax layer |
| `moon.webp` | Aksen "bulan" mengambang di hero (ala Decagon) |
| `purple-sky.webp` | Overlay langit ungu / CtaBand |
| `person-phone.webp` | HoverFeature / section omnichannel |
| `abstract-1.webp` | StickyInfo — gambar kanan |
| `abstract-2.webp` | ProgramFlow — gambar kanan (glow) |
| `dark-abstract.webp` | ProgramFlow — latar section hitam |

## Video (opsional — belum di-fetch)
Slot `hero.webm` + `hero.mp4` + `hero-poster.webp` bila ingin hero pakai video loop.
Sumber gratis: Coverr (coverr.co), Mixkit (mixkit.co), Pexels Video. Optimize:
```
ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 0 -crf 33 -an -vf scale=1920:-2 hero.webm
ffmpeg -i input.mp4 -c:v libx264 -crf 24 -preset slow -an -vf scale=1920:-2 hero.mp4
ffmpeg -i input.mp4 -vframes 1 -q:v 3 hero-poster.jpg   # lalu convert ke webp
```
Bila `hero.webm` ada, LandingHero otomatis prefer video (lihat komponen); jika tidak, fallback ke `hero-dune.webp` + Aurora.

## Logo (public/logos/, brand-colored SVG dari Simple Icons)
react, vite, typescript, javascript, solidity, prisma, express, ethereum, tailwindcss,
postgresql, redis, nodedotjs, supabase, vercel, walletconnect, coinbase.
