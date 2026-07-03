# 15. Penilaian Akademik - MPHM Lirboyo

Dokumen ini menjelaskan rumus-rumus resmi penilaian akademik di Madrasah Putri Hidayatul Mubtadi'at (MPHM) Lirboyo Kediri sesuai buku pedoman resmi dan cetak biru final modul penilaian.

---

## Batasan & Rentang Nilai

1. **Mata Pelajaran / Kitab (Tamrin & Ujian Semester)**:
   - Rentang nilai yang sah: **0 hingga 10** (integer bulat).
   - Nilai 1, 2, 3, dan 10 diperbolehkan.
2. **Nilai Akhlaq (Perilaku/Sikap)**:
   - Diinput menggunakan angka dengan nilai maksimal **8** (rentang **4 hingga 8**).
   - Nilai default awal sistem adalah **8**.

---

## Rumus Nilai Khosh ( نتيجة الخصوصي )

Nilai Khosh (nilai akhir rapor siswi per mata pelajaran/kitab) dihitung secara otomatis oleh sistem dengan menggabungkan Nilai Tamrin dan Nilai Ujian Semester:

$$\text{Khosh} = \text{Pembulatan}\left(\frac{\text{Tamrin} + \text{Ujian Semester}}{2}\right)$$

### Batasan Nilai Khosh (Clamping)
Nilai Khosh yang ditampilkan pada rapor **wajib dibatasi** di rentang:
- **Minimal = 4**
- **Maksimal = 9**

*Jika hasil perhitungan rata-rata bulat $< 4$, maka otomatis diset menjadi $4$. Jika $> 9$, maka otomatis diset menjadi $9$.*

### Contoh Perhitungan Nilai Khosh
- **Kasus 1**: Nilai Tamrin = 10, Ujian Semester = 10 $\rightarrow (10+10)/2 = 10 \rightarrow$ Dibatasi (clamped) menjadi **9**.
- **Kasus 2**: Nilai Tamrin = 2, Ujian Semester = 2 $\rightarrow (2+2)/2 = 2 \rightarrow$ Dibatasi (clamped) menjadi **4**.
- **Kasus 3**: Nilai Tamrin = 8, Ujian Semester = 7 $\rightarrow (8+7)/2 = 7.5 \rightarrow$ Dibulatkan menjadi **8**.

---

## Rumus Nilai 'Am / نتيجة العام (Rata-rata Kelas)

Nilai 'Am dihitung secara otomatis setelah status kelas diubah menjadi **FINAL** oleh Admin/Operator:

$$\text{Nilai 'Am} = \text{Pembulatan}\left(\frac{\sum \text{Nilai Khos Seluruh Siswi Aktif}}{\text{Jumlah Siswi Aktif dalam Kelas}}\right)$$

### Ketentuan Siswi & Perhitungan:
- Hanya menghitung siswi dengan status **ACTIVE** yang masih berada dalam kelas.
- Siswi mutasi keluar atau yang sudah dikeluarkan dari kelas **tidak dihitung** (dikeluarkan dari pembagi & pembilang).
- Siswi yang belum mengikuti Her Ujian tetap dihitung menggunakan nilai **4** dalam penjumlahan rata-rata kelas.

---

## Perhitungan Nilai Rapor & Pembulatan MPHM

Sistem pembulatan desimal untuk Nilai Khosh dan Rata-rata Kelas mengikuti standar MPHM:
- Pecahan `x.0` s/d `x.4` dibulatkan ke bawah (misal: $7.4 \rightarrow 7$).
- Pecahan `x.5` s/d `x.9` dibulatkan ke atas (misal: $7.5 \rightarrow 8$).

---

## Perhitungan Nilai Prestasi (Al-Bayan) & Pengurangan Absensi

Nilai Prestasi akhir dihitung dengan menggabungkan nilai kedua semester (Semester I & II) dan dikurangi poin pelanggaran absensi:

1. **Langkah 1 (Total Nilai)**:
   $$\text{Total Nilai Khos} = \sum \text{Nilai Khos Sem I} + \sum \text{Nilai Khos Sem II}$$
2. **Langkah 2 (Rata-rata)**:
   $$\text{Rata-rata} = \frac{\text{Total Nilai Khos}}{\text{Jumlah Mata Pelajaran Sem I} + \text{Jumlah Mata Pelajaran Sem II}}$$
3. **Langkah 3 (Pembulatan Awal)**:
   Bulatkan nilai rata-rata ke integer terdekat menggunakan aturan pembulatan MPHM.
   *Penting: Pembulatan dilakukan terlebih dahulu sebelum pengurangan absensi.*
4. **Langkah 4 (Pengurangan Izin)**:
   $$\text{Pengurang Izin} = \text{floor}\left(\frac{\text{Jumlah Izin}}{15}\right)$$
5. **Langkah 5 (Pengurangan Alpa / Tanpa Izin)**:
   $$\text{Pengurang Alpa} = \text{floor}\left(\frac{\text{Jumlah Bighoiri Izin}}{5}\right)$$
6. **Rumus Akhir Nilai Prestasi**:
   $$\text{Nilai Prestasi} = \text{Rata-rata Bulat} - \text{Pengurang Izin} - \text{Pengurang Alpa}$$

### Klasifikasi Predikat Prestasi (Al-Bayan)
Berdasarkan Nilai Prestasi akhir:
* **9**: **الجيد الأول** (Jayyid Awwal)
* **8**: **الجيد الثاني** (Jayyid Tsani)
* **7**: **المتوسط الأول** (Mutawassith Awwal)
* **6**: **المتوسط الثاني** (Mutawassith Tsani)
* **$\le$ 5**: **الرديء** (Rodi') (Tidak Naik Kelas)
