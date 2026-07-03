-- seed.sql
-- Official seed data for Mubtadi'at MPHM Lirboyo local database

-- Clean existing data first in exact dependency order to prevent FK violations
DELETE FROM role_permissions;
DELETE FROM notification_reads;
DELETE FROM sessions;
DELETE FROM accounts;
DELETE FROM verifications;
DELETE FROM attendance_details;
DELETE FROM attendance;
DELETE FROM grade_items;
DELETE FROM grades;
DELETE FROM memorization_items;
DELETE FROM memorization;
DELETE FROM reports;
DELETE FROM santri_refs;
DELETE FROM kelas_refs;
DELETE FROM users;
DELETE FROM roles;
DELETE FROM permissions;
DELETE FROM notifications;
DELETE FROM feature_flags;
DELETE FROM settings;
DELETE FROM kitab_refs;

-- 1. Insert Roles (Without Munawwib per blueprint)
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES 
('role-mustahiq', 'Mustahiq', 'Wali Kelas - Menginput nilai dan kehadiran kelas binaan', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role-mufatish', 'Mufatish', 'Pimpinan Tingkatan - Monitoring progres pengisian', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('role-mundzir', 'Mundzir', 'Pimpinan Madrasah - Approval akhir & monitoring global', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Insert Basic Feature Flags
INSERT INTO feature_flags (id, key, name, is_enabled, created_at, updated_at) VALUES 
('feat-001', 'FEATURE_HAFALAN', 'Modul Hafalan', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('feat-002', 'FEATURE_RAPORT', 'Modul e-Raport', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('feat-003', 'FEATURE_QR_SCAN', 'QR Scan Absensi', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Insert Users (Consistent with PWA mockup accounts)
INSERT INTO users (id, name, email, email_verified, image, role, created_at, updated_at) VALUES
('user-charis-wahyudi', 'Charis Wahyudi', 'charis.wahyudi@mubtadiaat.id', 1, null, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-abdurrahman-addakhel', 'Abdurrahman Addakhel', 'abdurrahman.addakhel@mubtadiaat.id', 1, null, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Insert Kelas Refs (1 Mustahiq = 1 Class/Lokal strictly)
INSERT INTO kelas_refs (id, name, level, mustahiq_id, created_at, updated_at) VALUES
('kelas-001', 'Bagian A', 'Tsanawiyah', 'user-charis-wahyudi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kelas-002', 'Bagian B', 'Tsanawiyah', 'user-abdurrahman-addakhel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Insert Santri Refs (Lirboyo Santri Putri)
INSERT INTO santri_refs (id, nis, no_stambuk, nik, name, tempat_lahir, tanggal_lahir, class_id, bagian, alamat_lengkap, provinsi, kabupaten, kecamatan, kelurahan, kode_pos, no_kk, nama_ayah, nama_ibu, tahun_masuk, status, created_at, updated_at) VALUES
('santri-001', '20260001', 'STB-20260001', '3578012345670001', 'Aisyah Humaira', 'Kediri', '2010-05-12', 'kelas-001', 'Bagian A', 'Jl. KH. Abdul Karim No. 1, Lirboyo', 'Jawa Timur', 'Kediri', 'Mojoroto', 'Lirboyo', '64117', '3578012345670000', 'Ahmad Sukri', 'Siti Aminah', '2024', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('santri-002', '20260002', 'STB-20260002', '3578012345670002', 'Fatimah Az-Zahra', 'Surabaya', '2010-09-20', 'kelas-001', 'Bagian A', 'Jl. Dharmahusada No. 12, Gubeng', 'Jawa Timur', 'Surabaya', 'Gubeng', 'Airlangga', '60286', '3578012345671100', 'Muhammad Zaki', 'Aisyah Wardah', '2024', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('santri-003', '20260003', 'STB-20260003', '3578012345670003', 'Maryam', 'Malang', '2011-01-15', 'kelas-001', 'Bagian A', 'Jl. Ijen No. 4, Klojen', 'Jawa Timur', 'Malang', 'Klojen', 'Oro-oro Dowo', '65119', '3578012345672200', 'Ali Riza', 'Khadijah', '2024', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('santri-004', '20260004', 'STB-20260004', '3578012345670004', 'Naila Syafira', 'Kediri', '2010-12-05', 'kelas-001', 'Bagian A', 'Jl. Penanggungan No. 34, Mojoroto', 'Jawa Timur', 'Kediri', 'Mojoroto', 'Bandar Kidul', '64118', '3578012345673300', 'Hasan Basri', 'Fatmawati', '2024', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('santri-005', '20260005', 'STB-20260005', '3578012345670005', 'Zahra Salsabila', 'Jombang', '2010-03-30', 'kelas-001', 'Bagian A', 'Jl. Gus Dur No. 8, Tembelang', 'Jawa Timur', 'Jombang', 'Tembelang', 'Pesantren', '61473', '3578012345674400', 'Umar Faruq', 'Zubaidah', '2024', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('santri-006', '20260006', 'STB-20260006', '3578012345670006', 'Khadijah', 'Nganjuk', '2011-04-18', 'kelas-002', 'Bagian B', 'Jl. Ahmad Yani No. 10, Loceret', 'Jawa Timur', 'Nganjuk', 'Loceret', 'Loceret', '64471', '3578012345675500', 'Husain', 'Sofiah', '2024', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('santri-007', '20260007', 'STB-20260007', '3578012345670007', 'Safiyya', 'Blitar', '2010-07-22', 'kelas-002', 'Bagian B', 'Jl. Merdeka No. 45, Kepanjenkidul', 'Jawa Timur', 'Blitar', 'Kepanjenkidul', 'Kepanjenkidul', '66117', '3578012345676600', 'Abu Bakar', 'Hindun', '2024', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. Insert Kitab Refs (Class specific curriculum)
INSERT INTO kitab_refs (id, name, description, created_at, updated_at) VALUES
('kitab-001', 'Tuhfatul Athfal', 'Tajwid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kitab-002', 'Khoridatul Bahiyyah', 'Tauhid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kitab-003', 'Mukhtashor Jiddan', 'Nahwu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('kitab-004', 'Sullamut Taufiq', 'Fiqh', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. Seed Initial Monthly Attendance for Bagian A
INSERT INTO attendance (id, class_id, month, recorded_by, created_at, updated_at) VALUES
('att-001', 'kelas-001', '2026-07', 'user-charis-wahyudi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO attendance_details (id, attendance_id, santri_id, hadir, sakit, izin, alpha, notes, created_at, updated_at) VALUES
('att-det-001', 'att-001', 'santri-001', 26, 1, 1, 0, 'Aktif mengikuti kelas.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('att-det-002', 'att-001', 'santri-002', 28, 0, 0, 0, 'Sangat rajin.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('att-det-003', 'att-001', 'santri-003', 25, 2, 1, 0, 'Hadir teratur.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('att-det-004', 'att-001', 'santri-004', 27, 0, 1, 0, 'Aktif.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('att-det-005', 'att-001', 'santri-005', 28, 0, 0, 0, 'Sempurna.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
