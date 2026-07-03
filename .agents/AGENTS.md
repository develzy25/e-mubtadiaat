# Mubtadi'at Project Rules

## Excel Import Template Standards

Setiap kali membuat fungsi generate/download template Excel import untuk proyek ini, WAJIB mengikuti standar berikut tanpa perlu diminta ulang:

### 1. Gunakan ExcelJS (bukan SheetJS/xlsx) untuk Generate Template

Selalu gunakan `exceljs` (sudah terpasang di `package.json`) untuk menghasilkan template karena mendukung proteksi sheet dan komentar sel.

`ts
import ExcelJS from 'exceljs';
`

### 2. Header Kolom Harus Terkunci (Protected)

Setiap sheet dalam template import HARUS:
- Baris pertama (header row) diproteksi sehingga tidak bisa diedit oleh pengguna.
- Sel data (baris 2 ke bawah) tetap bisa diedit bebas.
- Gunakan kombinasi `worksheet.protect()` + properti `locked: true` pada sel header dan `locked: false` pada sel data.

Contoh pola implementasi:
`ts
await worksheet.protect('mubtadiat-template', {
  selectLockedCells: true,
  selectUnlockedCells: true,
  formatCells: false,
  insertRows: true,
  deleteRows: true,
});

// Kunci sel header (baris 1)
worksheet.getRow(1).eachCell((cell) => {
  cell.protection = { locked: true };
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
});

// Bebaskan sel data (baris 2 ke bawah)
for (let rowNum = 2; rowNum <= 100; rowNum++) {
  worksheet.getRow(rowNum).eachCell({ includeEmpty: true }, (cell) => {
    cell.protection = { locked: false };
  });
}
`

### 3. Komentar/Informasi Kolom Wajib Ada

Setiap sel header HARUS memiliki komentar (note) yang menjelaskan:
- Tipe data yang diharapkan (teks, angka, tanggal, dll.)
- Format yang benar
- Contoh nilai yang valid
- Keterangan apakah kolom wajib diisi atau opsional

Contoh pola:
`ts
headerCell.note = {
  texts: [
    { font: { bold: true, size: 10 }, text: 'NAMA KOLOM\n' },
    { font: { size: 9 }, text: 'Tipe: Teks | Wajib: Ya\n' },
    { font: { size: 9 }, text: 'Contoh: Ibtidaiyyah' }
  ]
};
`

### 4. Format Visual Header yang Konsisten

- Background: Biru gelap (#1E40AF)
- Teks: Putih, tebal (bold)
- Border: Semua sisi dengan warna biru medium
- Lebar kolom: minimal 20 karakter

### 5. Konvensi Nama File Template

Format: Template_[NamaFitur]_Mubtadiat.xlsx

### 6. Export dengan ExcelJS juga

Untuk export, gunakan ExcelJS agar format konsisten. Untuk import/parsing data masuk tetap boleh menggunakan xlsx (SheetJS) karena lebih cepat.

---

## Struktur Jenjang Akademik Pesantren

| Jenjang       | Tingkat Kelas          | Ujian Praktek           |
|---------------|------------------------|-------------------------|
| I'dadiyah     | I, II, III             | Tidak ada               |
| Ibtida'iyyah  | I, II, III, IV, V, VI  | Hanya di Tingkat VI     |
| Tsanawiyah    | I, II, III             | Hanya di Tingkat III    |
| Aliyah        | I, II, III             | Hanya di Tingkat III    |

---

## Hierarki Role/Hak Akses

| Role ID | Nama Role  | Portal             |
|---------|------------|--------------------|
| 1       | Admin      | Web Desktop        |
| 2       | Mundzir    | Web Desktop        |
| 3       | Mufatish   | Web Desktop        |
| 4       | Mustahiq   | PWA Mobile Android |
