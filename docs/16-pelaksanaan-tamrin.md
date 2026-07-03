# 16. Pelaksanaan Tamrin - MPHM Lirboyo

# Blueprint Pelaksanaan Tamrin
## Pondok Pesantren Hidayatul Mubtadi'at Lirboyo

Version : 1.0
Status  : Final Blueprint
Source  : Pedoman MPHM Hidayatul Mubtadi'at

---

# Tujuan

Dokumen ini menjadi standar implementasi Modul Tamrin pada:

- Software Administrasi
- PWA Pengajar (Mustahiq)
- Dashboard Monitoring Mufatish
- Dashboard Monitoring Mundzir

Seluruh implementasi WAJIB mengikuti pedoman resmi MPHM.

Developer tidak diperbolehkan membuat logika sendiri apabila bertentangan dengan blueprint ini.

---

# Pengertian Tamrin

Tamrin merupakan ujian berkala setiap mata pelajaran yang dilaksanakan sebelum Ujian Semester.

Nilai Tamrin menjadi salah satu komponen pembentuk Nilai Khosh.

Rumus Nilai Khosh diatur pada dokumen Penilaian Akademik.

---

# Tujuan Sistem

Sistem harus mampu mengelola seluruh proses Tamrin mulai dari:

- Persiapan
- Penjadwalan
- Pelaksanaan
- Input Nilai
- Validasi
- HER Tamrin
- Penutupan
- Integrasi ke Penilaian Semester

---

# Alur Pelaksanaan

Persiapan
↓
Pembuatan Jadwal
↓
Pelaksanaan Tamrin
↓
Input Nilai
↓
Validasi
↓
HER Tamrin
↓
Input Nilai HER
↓
Penutupan Tamrin
↓
Masuk Perhitungan Nilai Khosh

---

# Persiapan Tamrin

Software Admin membuat data:

- Semester
- Nomor Tamrin
- Tanggal
- Jam
- Kelas
- Bagian
- Kitab
- Guru Pengampu
- Status

Status terdiri dari:

- Draft
- Terjadwal
- Berlangsung
- Selesai
- Ditutup

---

# Penjadwalan

Setiap jadwal minimal memiliki:

- Semester
- Tamrin Ke
- Tanggal
- Hari
- Jam Mulai
- Jam Selesai
- Kelas
- Bagian
- Kitab
- Mustahiq
- Ruangan
- Status

---

# Distribusi Jadwal ke PWA

Saat jadwal aktif maka PWA Mustahiq otomatis menampilkan:

- Tamrin Hari Ini
- Jam
- Kitab
- Kelas
- Bagian
- Jumlah Santri
- Status

*Tidak diperlukan sinkronisasi manual.*

---

# Pelaksanaan Tamrin

Mustahiq membuka menu:

Tamrin ➜ Memilih Jadwal ➜ Daftar Santri tampil ➜ Input Nilai ➜ Simpan ➜ Selesai

---

# Daftar Santri

Setiap santri menampilkan:

- Foto
- Nama
- Nomor Induk
- Kelas
- Bagian
- Status Kehadiran
- Kolom Nilai
- Catatan

---

# Status Kehadiran

Status yang tersedia:

- Hadir
- Izin
- Sakit
- Alpa
- Udzur Syar'i
- Belum Mengikuti

---

# Input Nilai

Nilai menggunakan angka:

- **0 hingga 10** (integer bulat)

*Angka 1, 2, 3, dan 10 diperbolehkan. Angka desimal tidak diperbolehkan.*

---

# Validasi Nilai

Sebelum Tamrin ditutup:
- Mustahiq dapat mengubah nilai, mengubah status kehadiran, dan menambah catatan.

Setelah status menjadi **Ditutup** maka seluruh nilai terkunci.
Perubahan hanya dapat dilakukan melalui Software Administrasi oleh Administrator yang memiliki hak akses khusus.

---

# HER Tamrin

Mengacu Pedoman MPHM:
- HER Tamrin dilaksanakan satu minggu setelah pelaksanaan Tamrin.
- Batas maksimal pelaksanaan: **9 hari**.

---

# Peserta HER

Sistem otomatis membuat daftar HER apabila:
- Belum mengikuti Tamrin
- Tidak hadir
- Nilai belum diinput
- Status mengikuti HER

---

# Nilai HER

Mengacu Pedoman MPHM:
- Nilai maksimal HER Tamrin adalah **7** dengan maksimal 7 soal.
- Apabila santri mengikuti HER maka Nilai Tamrin diganti dengan Nilai HER.

---

# Ketentuan Khusus

- Apabila santri tidak mengikuti Tamrin ➜ Wajib mengikuti HER.
- Apabila tidak mengikuti HER ➜ Tidak memperoleh nilai Tamrin.
- Apabila hanya hadir pada hari Tamrin tanpa mengikuti kegiatan belajar sebelumnya ➜ Nilai tidak boleh dimasukkan ke rapor (Status ditentukan sesuai pedoman MPHM).

---

# Integrasi Penilaian

Setelah seluruh nilai Tamrin selesai, sistem otomatis menghubungkan nilai Tamrin ke Modul Penilaian Akademik.

$$\text{Nilai Khosh} = \text{Pembulatan}\left(\frac{\text{Nilai Tamrin} + \text{Nilai Semester}}{2}\right)$$

*Perhitungan dilakukan otomatis oleh sistem dengan pembulatan MPHM (pecahan >=0.5 ke atas, <0.5 ke bawah) dan dibatasi (clamped) pada rentang minimal 4 dan maksimal 9. Mustahiq tidak menghitung manual.*

---

# Dashboard Mustahiq

Dashboard menampilkan:
- Jumlah Jadwal Tamrin Hari Ini
- Jumlah Santri
- Jumlah Nilai Sudah Diisi
- Jumlah Nilai Belum Diisi
- Jumlah HER
- Progress Pengisian & Persentase Penyelesaian

---

# Monitoring Mufatish

Mufatish hanya dapat melihat seluruh jadwal, melihat progres pengisian, melihat statistik, melihat persentase penyelesaian, dan melihat santri yang belum dinilai. 

*Mufatish tidak dapat mengubah, menghapus, atau menambah nilai.*

---

# Monitoring Mundzir

Mundzir dapat melihat seluruh tingkatan, melihat statistik seluruh kelas, melihat progres Tamrin, melihat rekap nilai, melihat grafik penyelesaian, dan melihat laporan akhir.

*Mundzir tidak dapat mengubah nilai.*

---

# Hak Akses

## Mustahiq
- Melihat jadwal Tamrin kelasnya.
- Menginput nilai.
- Mengedit nilai sebelum ditutup.
- Melihat rekap kelas.

## Mufatish
- Monitoring.
- Validasi progres.
- Melihat laporan.
- *Tidak dapat mengubah nilai.*

## Mundzir
- Monitoring seluruh madrasah.
- Melihat laporan keseluruhan.
- Approval akhir.
- *Tidak dapat mengubah nilai.*

---

# Warna Status

- **Draft**: Abu-abu
- **Terjadwal**: Biru
- **Berlangsung**: Hijau
- **Belum Lengkap**: Kuning
- **HER**: Oranye
- **Ditutup**: Merah

---

# Sinkronisasi

PWA menggunakan mekanisme Offline First.
- Saat internet tidak tersedia, data tetap disimpan di IndexedDB.
- Saat koneksi kembali, data otomatis dikirim ke server.
- Apabila terjadi konflik data, server menjadi sumber utama (Source of Truth).

---

# Audit Log

Setiap aktivitas wajib dicatat:
- Tanggal & Jam
- Pengguna
- Perangkat & Alamat IP
- Data Lama & Data Baru
- Jenis Perubahan

*Audit Log tidak boleh dihapus oleh pengguna.*

---

# Ketentuan Pengembangan

Developer tidak diperbolehkan:
- Mengubah alur Tamrin.
- Mengubah rumus penilaian.
- Mengubah batas nilai.
- Mengubah aturan HER.
- Menambahkan aturan baru tanpa dokumen resmi MPHM.

Seluruh perubahan hanya boleh dilakukan apabila terdapat revisi resmi dari Pedoman MPHM.
