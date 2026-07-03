# 30. Database Schema - Cloudflare D1 (Drizzle ORM)

## Entity Relationship Summary
Database dikelola menggunakan Drizzle ORM pada Cloudflare D1 (SQLite engine).

### Tabel-Tabel Utama:
1. `users` & `sessions` & `accounts` & `verifications`: Autentikasi Better-Auth dan manajemen pengguna.
2. `santri_refs`: Data identitas santri putri (NIS, Nama, KelasId, Status).
3. `kelas_refs` & `kitab_refs`: Data referensi rombel kelas dan kitab/pelajaran.
4. `blok` & `kamar`: Struktur pemukiman/asrama santri.
5. `attendance` & `attendance_details`: Catatan presensi bulanan dan rincian kehadiran santri (`Hadir`, `Sakit`, `Izin`, `Alpha`).
6. `grades` & `grade_items` & `memorization` & `memorization_items`: Catatan nilai tamrin/hafalan harian.
7. `kelas_finalization` [NEW]: Catatan status finalisasi penilaian per kelas/semester/tahun ajaran (`DRAFT`, `SIAP_FINALISASI`, `FINAL`).
8. `rapot_semester`: Kepala data (header) rapot semester santri (menyimpan jumlah izin, alpa, nilai akhlaq sikap, dan catatan).
9. `rapot_nilai`: Rincian nilai Khos per mata pelajaran santri (menyimpan nilai tamrin, nilai ujian semester, dan nilai Khos ter-clamp).
10. `audit_logs`: Catatan riwayat aktivitas audit sistem (RBAC & modifikasi data).
