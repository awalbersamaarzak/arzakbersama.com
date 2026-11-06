# arzakbersama.com

Situs profil ARZAK — perusahaan induk milik keluarga. Satu halaman statis, tanpa build, ditayangkan lewat GitHub Pages ke domain `arzakbersama.com`.

## Isi

| File | Fungsi |
|---|---|
| `index.html` | Halaman utama (HTML + CSS dalam satu file) |
| `404.html` | Halaman bila alamat tidak ditemukan |
| `favicon.svg`, `apple-touch-icon.png` | Ikon tab browser dan ikon layar utama HP |
| `og.png` | Gambar pratinjau saat tautan dibagikan (1200×630) |
| `foto/` | Foto situs. Diisi otomatis oleh `.github/workflows/foto.yml` (unduh, kecilkan, buang metadata). Untuk menambah foto, ubah daftar di file itu |
| `brand/` | Logo ARZAK: tanda dan logo lengkap, versi utama, negatif, dan satu warna (konsep vektor, belum final) |
| `plus-jakarta-sans.woff2` | Huruf Plus Jakarta Sans (lisensi SIL OFL, lihat `OFL-Plus-Jakarta-Sans.txt`) |
| `CNAME` | Domain kustom GitHub Pages — jangan dihapus |
| `CLAUDE.md` | Aturan kerja untuk Claude Code di repo ini |

## Mengubah situs

1. Ubah `index.html`.
2. Buka file itu di browser untuk memeriksa tampilan, termasuk lebar HP.
3. Commit ke `main`. GitHub Pages menayangkan ulang dalam 1–2 menit.

Palet: burgundy `#6E1E2B`, anggur gelap `#2A0B12`, emas `#C9A24B` / `#E6C980`, gading `#F7F1EA`.

Foto: Jembatan Suroboyo (Rizki Oceano), Jembatan Suramadu (Ahmad Nabili), fasad gedung (Amir Hosseini), meja kerja (Anna Spoljar) — semuanya Unsplash License. Foto ruang klinik milik Klinik Utama INTRO Dental.
