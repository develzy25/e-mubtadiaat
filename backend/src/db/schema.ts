import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Common fields
const timestampFields = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'), // Soft delete
};

// 1. RBAC
export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ...timestampFields,
});

export const permissions = sqliteTable('permissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. 'attendance:read'
  description: text('description'),
  ...timestampFields,
});

export const rolePermissions = sqliteTable('role_permissions', {
  id: text('id').primaryKey(),
  roleId: text('role_id').notNull().references(() => roles.id),
  permissionId: text('permission_id').notNull().references(() => permissions.id),
  ...timestampFields,
});

// Auth specific timestamps (BetterAuth expects JS Date which maps to integer in SQLite)
const authTimestampFields = {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
};

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('username').unique().notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: integer('role').default(4), // 1 = Admin, 2 = Mundzir, 3 = Mufatish, 4 = Mustahiq
  ...authTimestampFields,
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  ...authTimestampFields,
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  ...authTimestampFields,
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ...authTimestampFields,
});

// 2. Master Data Refs
export const santriRefs = sqliteTable('santri_refs', {
  id: text('id').primaryKey(),
  nis: text('nis'), // Keep for backward compatibility
  noStambuk: text('no_stambuk'),
  nik: text('nik'),
  name: text('name').notNull(),
  tempatLahir: text('tempat_lahir'),
  tanggalLahir: text('tanggal_lahir'),
  classId: text('class_id').notNull(),
  bagian: text('bagian'),
  alamatLengkap: text('alamat_lengkap'),
  provinsi: text('provinsi'),
  kabupaten: text('kabupaten'),
  kecamatan: text('kecamatan'),
  kelurahan: text('kelurahan'),
  kodePos: text('kode_pos'),
  noKk: text('no_kk'),
  namaAyah: text('nama_ayah'),
  namaIbu: text('nama_ibu'),
  tahunMasuk: text('tahun_masuk'),
  tahunKeluar: text('tahun_keluar'),
  kamar: text('kamar'),
  customFields: text('custom_fields'), // JSON metadata
  status: text('status').notNull(), // e.g. 'ACTIVE', 'BOYONG', 'CUTI'
  ...timestampFields,
});

export const blok = sqliteTable('blok', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ...timestampFields,
});

export const kamar = sqliteTable('kamar', {
  id: text('id').primaryKey(),
  blokId: text('blok_id').notNull().references(() => blok.id),
  name: text('name').notNull(),
  penasihat: text('penasihat'),
  ...timestampFields,
});

export const jenjang = sqliteTable('jenjang', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // I'dadiyah, Ibtida'iyyah, Tsanawiyah, Aliyah
  mundzirName: text('mundzir_name'),
  ...timestampFields,
});

export const tingkat = sqliteTable('tingkat', {
  id: text('id').primaryKey(),
  jenjangId: text('jenjang_id').notNull().references(() => jenjang.id),
  jenjangName: text('jenjang_name').notNull(),
  romanName: text('roman_name').notNull(), // I, II, III
  mufatishName: text('mufatish_name'),
  targetNadzom: text('target_nadzom'),
  targetBait: integer('target_bait'),
  hasPraktek: integer('has_praktek', { mode: 'boolean' }).default(false),
  praktekSubjects: text('praktek_subjects'), // JSON string array
  ...timestampFields,
});

export const kelasRefs = sqliteTable('kelas_refs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  level: text('level').notNull(),
  mustahiqId: text('mustahiq_id').notNull(), // references users.id
  jenjangName: text('jenjang_name'),
  tingkatName: text('tingkat_name'),
  bagian: text('bagian'),
  lokal: text('lokal'),
  munawwibNames: text('munawwib_names'), // JSON array
  ...timestampFields,
});

export const kitabRefs = sqliteTable('kitab_refs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  jenjangName: text('jenjang_name'),
  tingkatName: text('tingkat_name'),
  fanIlmu: text('fan_ilmu'),
  pengajar: text('pengajar'),
  waktu: text('waktu'),
  ...timestampFields,
});

// 3. Operational Data
export const attendance = sqliteTable('attendance', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => kelasRefs.id),
  month: text('month').notNull(), // format YYYY-MM
  recordedBy: text('recorded_by').notNull().references(() => users.id),
  ...timestampFields,
});

export const attendanceDetails = sqliteTable('attendance_details', {
  id: text('id').primaryKey(),
  attendanceId: text('attendance_id').notNull().references(() => attendance.id),
  santriId: text('santri_id').notNull().references(() => santriRefs.id),
  hadir: integer('hadir').notNull().default(0),
  sakit: integer('sakit').notNull().default(0),
  izin: integer('izin').notNull().default(0),
  alpha: integer('alpha').notNull().default(0),
  notes: text('notes'),
  ...timestampFields,
});

export const grades = sqliteTable('grades', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => kelasRefs.id),
  kitabId: text('kitab_id').notNull().references(() => kitabRefs.id),
  semester: text('semester').notNull(),
  academicYear: text('academic_year').notNull(),
  recordedBy: text('recorded_by').notNull().references(() => users.id),
  ...timestampFields,
});

export const gradeItems = sqliteTable('grade_items', {
  id: text('id').primaryKey(),
  gradeId: text('grade_id').notNull().references(() => grades.id),
  santriId: text('santri_id').notNull().references(() => santriRefs.id),
  score: real('score').notNull(),
  notes: text('notes'),
  ...timestampFields,
});

export const memorization = sqliteTable('memorization', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => kelasRefs.id),
  kitabId: text('kitab_id').notNull().references(() => kitabRefs.id),
  date: text('date').notNull(),
  recordedBy: text('recorded_by').notNull().references(() => users.id),
  ...timestampFields,
});

export const memorizationItems = sqliteTable('memorization_items', {
  id: text('id').primaryKey(),
  memorizationId: text('memorization_id').notNull().references(() => memorization.id),
  santriId: text('santri_id').notNull().references(() => santriRefs.id),
  surahOrChapter: text('surah_or_chapter').notNull(),
  versesOrPages: text('verses_or_pages').notNull(),
  grade: text('grade').notNull(), // A, B, C, D
  notes: text('notes'),
  ...timestampFields,
});

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santriRefs.id),
  semester: text('semester').notNull(),
  academicYear: text('academic_year').notNull(),
  summary: text('summary'),
  generatedBy: text('generated_by').notNull().references(() => users.id),
  ...timestampFields,
});

// 4. Logs & Sync
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // e.g. 'LOGIN', 'INPUT_NILAI'
  details: text('details'),
  ...timestampFields,
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  role: text('role'),
  activity: text('activity').notNull(),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  oldData: text('old_data'),
  newData: text('new_data'),
  ipAddress: text('ip_address'),
  device: text('device'),
  ...timestampFields,
});

export const offlineQueue = sqliteTable('offline_queue', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  payload: text('payload').notNull(),
  status: text('status').notNull(), // 'PENDING', 'PROCESSED'
  ...timestampFields,
});

export const offlineFailed = sqliteTable('offline_failed', {
  id: text('id').primaryKey(),
  queueId: text('queue_id').notNull(),
  error: text('error').notNull(),
  ...timestampFields,
});

export const offlineLogs = sqliteTable('offline_logs', {
  id: text('id').primaryKey(),
  queueId: text('queue_id').notNull(),
  status: text('status').notNull(),
  ...timestampFields,
});

// 5. Cloudinary & Misc
export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  publicId: text('public_id').notNull(),
  secureUrl: text('secure_url').notNull(),
  bytes: integer('bytes').notNull(),
  width: integer('width'),
  height: integer('height'),
  folder: text('folder'),
  format: text('format').notNull(),
  provider: text('provider').default('cloudinary'),
  providerId: text('provider_id'),
  mimeType: text('mime_type'),
  extension: text('extension'),
  etag: text('etag'),
  version: text('version'),
  signature: text('signature'),
  resourceType: text('resource_type'),
  uploadedAt: text('uploaded_at').notNull(),
  ...timestampFields,
});

export const featureFlags = sqliteTable('feature_flags', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(false),
  ...timestampFields,
});

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  ...timestampFields,
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(), // e.g. 'INFO', 'WARNING'
  ...timestampFields,
});

export const notificationReads = sqliteTable('notification_reads', {
  id: text('id').primaryKey(),
  notificationId: text('notification_id').notNull().references(() => notifications.id),
  userId: text('user_id').notNull().references(() => users.id),
  ...timestampFields,
});

// --- e-Raport & Jadwal Pelajaran ---
export const jadwalPelajaran = sqliteTable('jadwal_pelajaran', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => kelasRefs.id),
  kitabName: text('kitab_name').notNull(),
  hari: text('hari').notNull(),              // السبت, الأحد, الإثنين, الثلاثاء, الأربعاء, الخميس
  sesi: text('sesi').notNull(),              // الحصة الأولى / الحصة الثانية
  kwartal: integer('kwartal').notNull(),      // 1 s/d 4
  academicYear: text('academic_year').notNull(),
  pengajar: text('pengajar'),                 // Nama pengajar (Mustahiq / Munawwibah)
  ...timestampFields,
});

export const kelasFinalization = sqliteTable('kelas_finalization', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => kelasRefs.id),
  semester: text('semester').notNull(),          // 'I' atau 'II'
  academicYear: text('academic_year').notNull(),  // '2025-2026'
  status: text('status').notNull(),               // 'DRAFT', 'SIAP_FINALISASI', 'FINAL'
  finalizedBy: text('finalized_by'),
  finalizedAt: text('finalized_at'),
  ...timestampFields,
});

export const rapotSemester = sqliteTable('rapot_semester', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santriRefs.id),
  classId: text('class_id').notNull().references(() => kelasRefs.id),
  semester: text('semester').notNull(),       // 'I' atau 'II'
  academicYear: text('academic_year').notNull(),
  izinCount: integer('izin_count').default(0),
  tanpaIzinCount: integer('tanpa_izin_count').default(0),
  nilaiAkhlaq: integer('nilai_akhlaq').default(8), // 4 s/d 8
  catatan: text('catatan'),
  predikatOverride: text('predikat_override'), // Menyimpan override manual predikat Al-Bayan
  recordedBy: text('recorded_by').notNull(),
  ...timestampFields,
});

export const rapotNilai = sqliteTable('rapot_nilai', {
  id: text('id').primaryKey(),
  rapotId: text('rapot_id').notNull().references(() => rapotSemester.id),
  kitabName: text('kitab_name').notNull(),
  tamrinScore: integer('tamrin_score').notNull(),  // 0 s/d 10
  ujianScore: integer('ujian_score').notNull(),    // 0 s/d 10
  khoshScore: integer('khosh_score').notNull(),    // hasil hitung bulat (Tamrin + Ujian)/2
  isFixedColumn: integer('is_fixed_column').default(0), // 1 jika Khat, Qiroah, Muhafazhoh, Akhlaq
  ...timestampFields,
});

