# 71. Comprehensive Database Schema Specification (D1 SQLite)

## Daftar Tabel Resmi (Drizzle ORM)

1. **`roles`**: Menyimpan data role untuk RBAC (Admin, Mundzir, Mufatish, Mustahiq).
2. **`permissions`**: Daftar izin akses fitur (misal: `attendance:read`, `rapot:write`).
3. **`role_permissions`**: Relasi penghubung antara role dan permission.
4. **`users`**: Tabel pengguna utama terintegrasi dengan Better-Auth.
5. **`sessions`**: Sesi login pengguna (Better-Auth).
6. **`accounts`**: Akun eksternal/kredensial pengguna (Better-Auth).
7. **`verifications`**: Token verifikasi email/auth (Better-Auth).
8. **`santri_refs`**: Data induk identitas santri (NIS, No Stambuk, Nama, Kelas, Kamar, Status: ACTIVE/BOYONG/CUTI).
9. **`blok`**: Data blok asrama (misal: Blok A, Blok B).
10. **`kamar`**: Kamar asrama santri yang terhubung ke data `blok`.
11. **`jenjang`**: Jenjang pendidikan (I'dadiyah, Ibtida'iyyah, Tsanawiyah, Aliyah).
12. **`tingkat`**: Tingkat kelas dalam jenjang (misal: I, II, III).
13. **`kelas_refs`**: Kelas/rombel aktif (nama kelas, level, mustahiq_id).
14. **`kitab_refs`**: Buku/kitab pelajaran pesantren.
15. **`attendance`**: Catatan induk presensi bulanan per kelas.
16. **`attendance_details`**: Rincian kehadiran santri per hari/bulan (hadir, sakit, izin, alpha).
17. **`grades`**: Induk pengisian nilai kelas/kitab/semester.
18. **`grade_items`**: Catatan nilai skor per santri untuk tamrin/ujian harian.
19. **`memorization`**: Induk setoran hafalan kelas/kitab.
20. **`memorization_items`**: Rincian hafalan santri (surah, bait/halaman, predikat: A/B/C/D).
21. **`reports`**: Ringkasan laporan semester santri.
22. **`activities`**: Catatan riwayat aktivitas pengguna (log login/logout, pengisian nilai).
23. **`audit_logs`**: Log audit komprehensif perubahan tabel data (menyimpan data lama & baru).
24. **`offline_queue`**: Antrean sinkronisasi offline (IndexedDB sync payload).
25. **`offline_failed`**: Catatan antrean sinkronisasi offline yang gagal.
26. **`offline_logs`**: Riwayat eksekusi sinkronisasi offline.
27. **`media`**: Metadata berkas/gambar yang terunggah di Cloudinary.
28. **`feature_flags`**: Konfigurasi toggle fitur sistem.
29. **`settings`**: Pengaturan global sistem.
30. **`notifications`**: Notifikasi sistem.
31. **`notification_reads`**: Status baca notifikasi per pengguna.
32. **`jadwal_pelajaran`**: Jadwal pelajaran/kitab per kelas, hari, sesi, dan kuartal.
33. **`kelas_finalization`**: Status finalisasi penilaian kelas per semester/tahun ajaran (`DRAFT`, `SIAP_FINALISASI`, `FINAL`). Nilai terkunci penuh pada status `FINAL`.
34. **`rapot_semester`**: Rapor semester santri (menyimpan santri_id, kelas_id, izin_count, tanpa_izin_count, nilai_akhlaq [rentang 4-8, default 8], catatan, predikat_override).
35. **`rapot_nilai`**: Nilai kitab rapor santri (menyimpan tamrin_score, ujian_score, khosh_score [clamped 4-9], is_fixed_column).
