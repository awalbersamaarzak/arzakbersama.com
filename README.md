# arzakbersama.com

Situs profil ARZAK — perusahaan induk milik keluarga. Satu halaman statis, tanpa build, ditayangkan lewat GitHub Pages ke domain `arzakbersama.com`.

## Isi

| File | Fungsi |
|---|---|
| `index.html` | Halaman utama bergaya "Arsip Keluarga" (HTML + CSS + sedikit JS dalam satu file) |
| `404.html` | Halaman bila alamat tidak ditemukan |
| `favicon.svg`, `apple-touch-icon.png` | Ikon tab browser dan ikon layar utama HP |
| `og.jpg` | Gambar pratinjau saat tautan dibagikan (1200×630) |
| `foto/` | Foto situs. Diisi otomatis oleh `.github/workflows/foto.yml` (unduh, potong, kecilkan, buang metadata). Untuk menambah atau mengganti foto, ubah daftar di file itu |
| `brand/` | Logo ARZAK: tanda dan logo lengkap, versi utama, negatif, dan satu warna (konsep vektor, belum final) |
| `plus-jakarta-sans.woff2`, `instrument-serif.woff2` | Huruf (SIL Open Font License, lihat file `OFL-*.txt`) |
| `CNAME` | Domain kustom GitHub Pages — jangan dihapus |
| `CLAUDE.md` | Aturan kerja untuk Claude Code di repo ini |

## Mengubah situs

1. Ubah `index.html`.
2. Buka file itu di browser untuk memeriksa tampilan, termasuk lebar HP.
3. Commit ke `main`. GitHub Pages menayangkan ulang dalam 1–2 menit.

Palet: kertas `#F7F1EA`, burgundy `#6E1E2B`, anggur gelap `#2A0B12`, emas `#C9A24B` (emas untuk teks di atas kertas: `#85621F`, papan nama: `#A58131`). Huruf: Plus Jakarta Sans untuk teks, Instrument Serif hanya untuk judul utama, angka tahun, huruf awal, dan pernyataan prinsip.

Foto: Jembatan Suramadu oleh Sakurai Midori (Wikimedia Commons, CC BY 3.0, dipotong dan warnanya disesuaikan). Foto ruang klinik milik Klinik Utama INTRO Dental.
