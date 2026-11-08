# CLAUDE.md — arzakbersama.com

## A. Aturan ARZAK (wajib; mengalahkan aturan lain di file ini)

### Konteks repo
- Fungsi repo: situs profil perusahaan induk ARZAK di arzakbersama.com, gaya "Arsip Keluarga". Satu halaman statis (HTML + CSS + sedikit JS dalam satu file), ditayangkan lewat GitHub Pages dari branch `main`, tanpa build. Pengecualian: peta 3D di `peta/` (sumber `peta/src/peta.js`, dibundel dengan esbuild; langkahnya di README).
- Pemilik situs: ARZAK — PT Arzak Selalu Bersama, dalam persiapan pendirian (nama sebelumnya: PT Mulai Bersama Arzak).
- Perintah tes: tidak ada runner tes. Verifikasi = buka `index.html` di browser pada lebar 390 px dan 1440 px, pastikan tidak ada scroll horizontal, gulir seluruh Peta ARZAK, periksa juga dengan "kurangi gerakan" (prefers-reduced-motion) menyala, dan periksa `404.html`.
- Penyetuju perubahan: Owner.

### Aturan
1. **Data.** Jangan pernah menaruh data pasien atau staf, ekspor sistem klinik, angka keuangan, maupun kredensial (`.env`, token, kunci) di repo ini. Repo ini publik.
2. **Status badan hukum.** Selama akta dan SK Kemenkumham belum terbit, nama "PT Arzak Selalu Bersama" hanya boleh tampil dengan keterangan "dalam persiapan pendirian". Brand yang tampil di halaman adalah ARZAK.
3. **Klinik.** Jangan menulis bahwa klinik dimiliki atau dinaungi holding sebelum Owner memutus peralihannya; tulis peran holding sebagai rencana setelah akta terbit. Kliniknya disebut "Klinik Utama INTRO Dental". Jangan pernah menyebut PT klinik "PT INTRO". Nama PT anak usaha yang belum final tidak ditampilkan.
4. **Kepemilikan dan investasi.** Pertahankan kalimat bahwa ARZAK tidak menawarkan saham dan tidak menghimpun dana dari masyarakat. Jangan menambahkan angka keuangan, target pendapatan, atau janji imbal hasil.
5. **Kontak dan alamat.** Jangan menambahkan alamat rumah, nomor pribadi, atau email pribadi. Email hanya memakai domain arzakbersama.com setelah Owner menyetujuinya.
6. **Jangan hapus `CNAME`.** File itu menghubungkan GitHub Pages dengan domain arzakbersama.com.
7. **Foto.** Jangan pakai foto orang yang wajahnya bisa dikenali, dan jangan memakai foto pasien atau staf. Setiap foto baru dicantumkan sumber dan lisensinya di footer, lalu ditambahkan ke `.github/workflows/foto.yml` supaya diunduh, dikecilkan, dan dibersihkan metadatanya.
8. **Pemeriksa kedua untuk desain.** Perubahan tampilan besar dinilai juri independen dengan rubrik `claude/RUBRIK_JURI_DESAIN_WEB.md` di project ARZAK OS (Content, Design, Usability, Creativity, Accessibility, Kepatuhan); lulus = rata-rata ≥ 8 dan tidak ada kriteria < 7.
9. **Bahasa.** Jelaskan rencana, temuan, dan hasil kepada Owner dalam Bahasa Indonesia. Kode, nama variabel, dan pesan commit boleh dalam bahasa Inggris.

## B. Karpathy-Inspired Guidelines
<!-- Sumber: github.com/multica-ai/andrej-karpathy-skills, commit 2c60614, lisensi MIT. Jangan diubah; perbarui hanya dari sumber. -->

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
