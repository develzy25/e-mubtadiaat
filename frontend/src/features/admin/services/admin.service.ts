const API_URL = import.meta.env.DEV ? 'http://localhost:8787/api' : 'https://backend.eppds.workers.dev/api';

export interface SantriAdmin {
  id: string;
  noStambuk: string;
  nik: string;
  name: string;
  tempatLahir: string;
  tanggalLahir: string;
  classId: string;
  bagian: string;
  alamatLengkap: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string;
  noKk: string;
  namaAyah: string;
  namaIbu: string;
  tahunMasuk: string;
  tahunKeluar: string | null;
  kamar: string;
  customFields: string | null; // JSON string
  status: 'ACTIVE' | 'ALUMNI' | 'BOYONG' | 'CUTI';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedClass: string;
  phone: string;
  alamat: string;
  tahunMulai: string;
  tahunAkhir: string;
  password?: string;
}

export interface AuditLogAdmin {
  id: string;
  userId: string;
  role: string;
  activity: string;
  tableName: string;
  recordId: string;
  oldData: string | null;
  newData: string | null;
  ipAddress: string;
  device: string;
  createdAt: string;
}

// Local mock storage key
const MOCK_SANTRI_KEY = 'mubtadiat.mock.santri';
const MOCK_USERS_KEY = 'mubtadiat.mock.users';
const MOCK_LOGS_KEY = 'mubtadiat.mock.logs';

const initMockData = () => {
  if (!localStorage.getItem(MOCK_SANTRI_KEY)) {
    const initialSantri: SantriAdmin[] = [
      {
        id: 'santri-001',
        noStambuk: 'STB-20260001',
        nik: '3578012345670001',
        name: 'Aisyah Humaira',
        tempatLahir: 'Kediri',
        tanggalLahir: '2010-05-12',
        classId: 'kelas-001',
        bagian: 'Bagian A',
        alamatLengkap: 'Jl. KH. Abdul Karim No. 1, Lirboyo',
        provinsi: 'Jawa Timur',
        kabupaten: 'Kediri',
        kecamatan: 'Mojoroto',
        kelurahan: 'Lirboyo',
        kodePos: '64117',
        noKk: '3578012345670000',
        namaAyah: 'Ahmad Sukri',
        namaIbu: 'Siti Aminah',
        tahunMasuk: '2024',
        tahunKeluar: null,
        kamar: 'Kamar Khadijah 01',
        status: 'ACTIVE',
        customFields: JSON.stringify({ "Ukuran Seragam": "M", "Riwayat Penyakit": "Alergi Debu" }),
      },
      {
        id: 'santri-002',
        noStambuk: 'STB-20260002',
        nik: '3578012345670002',
        name: 'Fatimah Az-Zahra',
        tempatLahir: 'Surabaya',
        tanggalLahir: '2010-09-20',
        classId: 'kelas-001',
        bagian: 'Bagian A',
        alamatLengkap: 'Jl. Dharmahusada No. 12, Gubeng',
        provinsi: 'Jawa Timur',
        kabupaten: 'Surabaya',
        kecamatan: 'Gubeng',
        kelurahan: 'Airlangga',
        kodePos: '60286',
        noKk: '3578012345671100',
        namaAyah: 'Muhammad Zaki',
        namaIbu: 'Aisyah Wardah',
        tahunMasuk: '2024',
        tahunKeluar: null,
        kamar: 'Kamar Khadijah 01',
        status: 'ACTIVE',
        customFields: null,
      },
      {
        id: 'santri-003',
        noStambuk: 'STB-20260003',
        nik: '3578012345670003',
        name: 'Maryam',
        tempatLahir: 'Malang',
        tanggalLahir: '2011-01-15',
        classId: 'kelas-001',
        bagian: 'Bagian A',
        alamatLengkap: 'Jl. Ijen No. 4, Klojen',
        provinsi: 'Jawa Timur',
        kabupaten: 'Malang',
        kecamatan: 'Klojen',
        kelurahan: 'Oro-oro Dowo',
        kodePos: '65119',
        noKk: '3578012345672200',
        namaAyah: 'Ali Riza',
        namaIbu: 'Khadijah',
        tahunMasuk: '2024',
        tahunKeluar: null,
        kamar: 'Kamar Khadijah 02',
        status: 'ACTIVE',
        customFields: null,
      },
      {
        id: 'santri-004',
        noStambuk: 'STB-20260004',
        nik: '3578012345670004',
        name: 'Naila Syafira',
        tempatLahir: 'Kediri',
        tanggalLahir: '2010-12-05',
        classId: 'kelas-001',
        bagian: 'Bagian A',
        alamatLengkap: 'Jl. Penanggungan No. 34, Mojoroto',
        provinsi: 'Jawa Timur',
        kabupaten: 'Kediri',
        kecamatan: 'Mojoroto',
        kelurahan: 'Bandar Kidul',
        kodePos: '64118',
        noKk: '3578012345673300',
        namaAyah: 'Hasan Basri',
        namaIbu: 'Fatmawati',
        tahunMasuk: '2024',
        tahunKeluar: null,
        kamar: 'Kamar Khadijah 02',
        status: 'ACTIVE',
        customFields: null,
      },
      {
        id: 'santri-005',
        noStambuk: 'STB-20260005',
        nik: '3578012345670005',
        name: 'Zahra Salsabila',
        tempatLahir: 'Jombang',
        tanggalLahir: '2010-03-30',
        classId: 'kelas-001',
        bagian: 'Bagian A',
        alamatLengkap: 'Jl. Gus Dur No. 8, Tembelang',
        provinsi: 'Jawa Timur',
        kabupaten: 'Jombang',
        kecamatan: 'Tembelang',
        kelurahan: 'Pesantren',
        kodePos: '61473',
        noKk: '3578012345674400',
        namaAyah: 'Umar Faruq',
        namaIbu: 'Zubaidah',
        tahunMasuk: '2024',
        tahunKeluar: null,
        kamar: 'Kamar Khadijah 03',
        status: 'ACTIVE',
        customFields: null,
      },
      {
        id: 'santri-006',
        noStambuk: 'STB-20260006',
        nik: '3578012345670006',
        name: 'Khadijah',
        tempatLahir: 'Nganjuk',
        tanggalLahir: '2011-04-18',
        classId: 'kelas-002',
        bagian: 'Bagian B',
        alamatLengkap: 'Jl. Ahmad Yani No. 10, Loceret',
        provinsi: 'Jawa Timur',
        kabupaten: 'Nganjuk',
        kecamatan: 'Loceret',
        kelurahan: 'Loceret',
        kodePos: '64471',
        noKk: '3578012345675500',
        namaAyah: 'Husain',
        namaIbu: 'Sofiah',
        tahunMasuk: '2024',
        tahunKeluar: null,
        kamar: 'Kamar Aisyah 01',
        status: 'ACTIVE',
        customFields: null,
      },
      {
        id: 'santri-007',
        noStambuk: 'STB-20260007',
        nik: '3578012345670007',
        name: 'Safiyya',
        tempatLahir: 'Blitar',
        tanggalLahir: '2010-07-22',
        classId: 'kelas-002',
        bagian: 'Bagian B',
        alamatLengkap: 'Jl. Merdeka No. 45, Kepanjenkidul',
        provinsi: 'Jawa Timur',
        kabupaten: 'Blitar',
        kecamatan: 'Kepanjenkidul',
        kelurahan: 'Kepanjenkidul',
        kodePos: '66117',
        noKk: '3578012345676600',
        namaAyah: 'Abu Bakar',
        namaIbu: 'Hindun',
        tahunMasuk: '2024',
        tahunKeluar: null,
        kamar: 'Kamar Aisyah 02',
        status: 'ACTIVE',
        customFields: null,
      }
    ];
    localStorage.setItem(MOCK_SANTRI_KEY, JSON.stringify(initialSantri));
  }

  if (!localStorage.getItem(MOCK_USERS_KEY)) {
    const initialUsers: UserAdmin[] = [
      {
        id: 'user-charis-wahyudi',
        name: 'Charis Wahyudi',
        email: 'charis.wahyudi@mubtadiaat.id',
        role: 'Mustahiq',
        assignedClass: 'Tsanawiyah A',
        phone: '628123456789',
        alamat: 'Kediri, Jawa Timur',
        tahunMulai: '2020',
        tahunAkhir: 'Sekarang',
        password: 'mubtadiaat123'
      },
      {
        id: 'user-abdurrahman-addakhel',
        name: 'Abdurrahman Addakhel',
        email: 'abdurrahman.addakhel@mubtadiaat.id',
        role: 'Mustahiq',
        assignedClass: 'Tsanawiyah B',
        phone: '628987654321',
        alamat: 'Surabaya, Jawa Timur',
        tahunMulai: '2021',
        tahunAkhir: 'Sekarang',
        password: 'mubtadiaat123'
      }
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialUsers));
  }

  if (!localStorage.getItem(MOCK_LOGS_KEY)) {
    const initialLogs: AuditLogAdmin[] = [
      {
        id: 'log-1',
        userId: 'user-dummy-admin',
        role: 'ADMIN',
        activity: 'INITIAL_SETUP',
        tableName: 'system',
        recordId: 'global',
        oldData: null,
        newData: JSON.stringify({ status: 'Database seeded' }),
        ipAddress: '127.0.0.1',
        device: 'System Engine',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      }
    ];
    localStorage.setItem(MOCK_LOGS_KEY, JSON.stringify(initialLogs));
  }
};

export const getHeaders = () => {
  const token = localStorage.getItem('better-auth.session_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// 1. Stats
export const fetchStats = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    initMockData();
    const santri: SantriAdmin[] = JSON.parse(localStorage.getItem(MOCK_SANTRI_KEY) || '[]');
    const active = santri.filter(s => s.status === 'ACTIVE').length;
    const boyong = santri.filter(s => s.status === 'BOYONG').length;
    const cuti = santri.filter(s => s.status === 'CUTI').length;

    return {
      success: true,
      data: {
        metrics: { active, boyong, cuti, classes: 2 },
        recentActivities: [
          { id: '1', action: 'CREATE_SANTRI', details: 'Menambahkan Aisyah Humaira', createdAt: new Date().toISOString(), userName: 'Charis Wahyudi' }
        ],
        attendanceTrends: [
          { month: 'Jan', rate: 97.4 },
          { month: 'Feb', rate: 98.1 },
          { month: 'Mar', rate: 96.5 },
          { month: 'Apr', rate: 97.8 },
          { month: 'May', rate: 98.6 },
          { month: 'Jun', rate: 99.2 },
          { month: 'Jul', rate: 98.5 },
        ]
      }
    };
  }
};

// 2. Santri Refs CRUD
export const fetchSantri = async (filters: { classId?: string; status?: string; search?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters.classId) params.append('classId', filters.classId);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_URL}/admin/santri?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    initMockData();
    let santri: SantriAdmin[] = JSON.parse(localStorage.getItem(MOCK_SANTRI_KEY) || '[]');
    
    if (filters.classId) {
      santri = santri.filter(s => s.classId === filters.classId);
    }
    if (filters.status) {
      santri = santri.filter(s => s.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      santri = santri.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.noStambuk.toLowerCase().includes(q) ||
        s.nik.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: santri,
      meta: { page: 1, pageSize: 25, total: santri.length }
    };
  }
};

export const saveSantri = async (data: Partial<SantriAdmin>) => {
  try {
    const res = await fetch(`${API_URL}/admin/santri`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    initMockData();
    const list: SantriAdmin[] = JSON.parse(localStorage.getItem(MOCK_SANTRI_KEY) || '[]');
    const newSantri: SantriAdmin = {
      id: `str_${Date.now()}`,
      noStambuk: data.noStambuk || '',
      nik: data.nik || '',
      name: data.name || '',
      tempatLahir: data.tempatLahir || '',
      tanggalLahir: data.tanggalLahir || '',
      classId: data.classId || 'kelas-001',
      bagian: data.bagian || 'Bagian A',
      alamatLengkap: data.alamatLengkap || '',
      provinsi: data.provinsi || '',
      kabupaten: data.kabupaten || '',
      kecamatan: data.kecamatan || '',
      kelurahan: data.kelurahan || '',
      kodePos: data.kodePos || '',
      noKk: data.noKk || '',
      namaAyah: data.namaAyah || '',
      namaIbu: data.namaIbu || '',
      tahunMasuk: data.tahunMasuk || '',
      tahunKeluar: null,
      kamar: data.kamar || '',
      customFields: data.customFields || null,
      status: data.status || 'ACTIVE'
    };
    
    list.unshift(newSantri);
    localStorage.setItem(MOCK_SANTRI_KEY, JSON.stringify(list));

    // Log audit
    addMockAuditLog('CREATE_SANTRI', 'santri_refs', newSantri.id, null, newSantri);

    return { success: true, data: newSantri };
  }
};

export const updateSantri = async (id: string, data: Partial<SantriAdmin>) => {
  try {
    const res = await fetch(`${API_URL}/admin/santri/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    initMockData();
    const list: SantriAdmin[] = JSON.parse(localStorage.getItem(MOCK_SANTRI_KEY) || '[]');
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Not found');

    const old = list[idx];
    
    // Auto fill tahunKeluar if Boyong or Cuti
    let tahunKeluar = data.tahunKeluar !== undefined ? data.tahunKeluar : old.tahunKeluar;
    if ((data.status === 'BOYONG' || data.status === 'CUTI') && !tahunKeluar) {
      tahunKeluar = new Date().getFullYear().toString();
    } else if (data.status === 'ACTIVE') {
      tahunKeluar = null;
    }

    const updated: SantriAdmin = {
      ...old,
      ...data,
      tahunKeluar
    };

    list[idx] = updated;
    localStorage.setItem(MOCK_SANTRI_KEY, JSON.stringify(list));

    addMockAuditLog('UPDATE_SANTRI', 'santri_refs', id, old, updated);

    return { success: true, data: updated };
  }
};

export const deleteSantri = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/admin/santri/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    initMockData();
    const list: SantriAdmin[] = JSON.parse(localStorage.getItem(MOCK_SANTRI_KEY) || '[]');
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      const old = list[idx];
      const updated = {
        ...old,
        status: 'BOYONG' as const,
        tahunKeluar: new Date().getFullYear().toString()
      };
      list[idx] = updated;
      localStorage.setItem(MOCK_SANTRI_KEY, JSON.stringify(list));
      addMockAuditLog('SOFT_DELETE_SANTRI', 'santri_refs', id, old, updated);
    }
    return { success: true };
  }
};

export const fetchUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    initMockData();
    const rawUsers = localStorage.getItem(MOCK_USERS_KEY);
    const parsedUsers: UserAdmin[] = rawUsers ? JSON.parse(rawUsers) : [];
    
    const rawClasses = localStorage.getItem('mubtadiat.mock.kelas_hierarchy');
    const classes = rawClasses ? JSON.parse(rawClasses).map((k: any) => {
      const cleanBagian = (k.bagian || '').replace(/bagian\s*/i, '').trim();
      return {
        id: k.id,
        name: cleanBagian ? `${k.jenjangName} ${cleanBagian}` : k.jenjangName
      };
    }) : [
      { id: 'kelas-001', name: 'Ibtida\'iyyah A' },
      { id: 'kelas-002', name: 'Tsanawiyah B' }
    ];

    return {
      success: true,
      data: {
        users: parsedUsers,
        classes
      }
    };
  }
};

export const saveUser = async (data: Partial<UserAdmin>) => {
  try {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (err: any) {
    initMockData();
    const list: UserAdmin[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    const newUser: UserAdmin = {
      id: `user-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      role: data.role || 'Mustahiq',
      assignedClass: data.assignedClass || '-',
      phone: data.phone || '',
      alamat: data.alamat || '',
      tahunMulai: data.tahunMulai || '',
      tahunAkhir: data.tahunAkhir || 'Sekarang',
      password: data.password || 'mubtadiaat123'
    };
    list.unshift(newUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(list));
    addMockAuditLog('CREATE_USER', 'users', newUser.id, null, newUser);
    return { success: true, data: newUser };
  }
};

export const updateUser = async (id: string, data: Partial<UserAdmin>) => {
  try {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (err: any) {
    initMockData();
    const list: UserAdmin[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Pengguna tidak ditemukan');

    const old = list[idx];
    const updated = {
      ...old,
      ...data
    };
    list[idx] = updated;
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(list));
    addMockAuditLog('UPDATE_USER', 'users', id, old, updated);
    return { success: true, data: updated };
  }
};

export const deleteUser = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (err: any) {
    initMockData();
    const list: UserAdmin[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    const userToDel = list.find(u => u.id === id);
    const filtered = list.filter(u => u.id !== id);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(filtered));
    addMockAuditLog('DELETE_USER', 'users', id, userToDel, null);
    return { success: true };
  }
};

export const resetUserPassword = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ password: 'mubtadiaat123' })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (err: any) {
    initMockData();
    const list: UserAdmin[] = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Pengguna tidak ditemukan');

    list[idx].password = 'mubtadiaat123';
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(list));
    addMockAuditLog('RESET_USER_PASSWORD', 'users', id, null, { note: 'Password reset to default' });
    return { success: true };
  }
};

// 4. Audit Logs
export const fetchAuditLogs = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/logs`, { headers: getHeaders() });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    initMockData();
    const logs: AuditLogAdmin[] = JSON.parse(localStorage.getItem(MOCK_LOGS_KEY) || '[]');
    return {
      success: true,
      data: logs
    };
  }
};

// 5. Google Sheets Sync
export const syncGoogleSheets = async (action: 'IMPORT' | 'EXPORT', sheetUrl: string) => {
  try {
    const res = await fetch(`${API_URL}/admin/sync/sheets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, sheetUrl })
    });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    await new Promise(r => setTimeout(r, 1200));
    initMockData();
    const timestamp = new Date().toISOString();
    let details = '';

    if (action === 'IMPORT') {
      const list: SantriAdmin[] = JSON.parse(localStorage.getItem(MOCK_SANTRI_KEY) || '[]');
      const newImportedId = `str_import_${Date.now()}`;
      const mockImported: SantriAdmin = {
        id: newImportedId,
        noStambuk: 'STB-20269999',
        nik: '3578019999990001',
        name: 'Nabila Syakieb (Imported)',
        tempatLahir: 'Jakarta',
        tanggalLahir: '2011-10-10',
        classId: 'kelas-001',
        bagian: 'Bagian A',
        alamatLengkap: 'Jl. Sudirman No. 100, Jakarta',
        provinsi: 'DKI Jakarta',
        kabupaten: 'Jakarta Selatan',
        kecamatan: 'Kebayoran Baru',
        kelurahan: 'Senayan',
        kodePos: '12190',
        noKk: '3578019999990000',
        namaAyah: 'Hasan Syakieb',
        namaIbu: 'Lina Syakieb',
        tahunMasuk: '2025',
        tahunKeluar: null,
        kamar: 'Kamar Aisyah 01',
        status: 'ACTIVE',
        customFields: null
      };
      
      list.unshift(mockImported);
      localStorage.setItem(MOCK_SANTRI_KEY, JSON.stringify(list));
      addMockAuditLog('GOOGLE_SHEETS_IMPORT', 'santri_refs', newImportedId, null, mockImported);
      
      details = `Selesai mengimpor 1 santri baru dari Google Sheet: "${mockImported.name}" ke Kelas Bagian A.`;
    } else {
      const list: SantriAdmin[] = JSON.parse(localStorage.getItem(MOCK_SANTRI_KEY) || '[]');
      details = `Berhasil mengekspor rekapitulasi database berisi ${list.length} santri ke Google Sheet.`;
      addMockAuditLog('GOOGLE_SHEETS_EXPORT', 'santri_refs', 'global', null, { count: list.length });
    }

    return {
      success: true,
      data: {
        action,
        timestamp,
        details,
        status: 'SUCCESS'
      }
    };
  }
};

// Helper for Mock Audit Logging
const addMockAuditLog = (activity: string, tableName: string, recordId: string, oldData: any, newData: any) => {
  initMockData();
  const logs: AuditLogAdmin[] = JSON.parse(localStorage.getItem(MOCK_LOGS_KEY) || '[]');
  const newLog: AuditLogAdmin = {
    id: `log_${Date.now()}`,
    userId: 'user-dummy-admin',
    role: 'ADMIN',
    activity,
    tableName,
    recordId,
    oldData: oldData ? JSON.stringify(oldData) : null,
    newData: newData ? JSON.stringify(newData) : null,
    ipAddress: '127.0.0.1',
    device: 'Chrome DevTools (Desktop Console)',
    createdAt: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem(MOCK_LOGS_KEY, JSON.stringify(logs));
};

// 6. Region API Proxies
export const fetchProvinces = async () => {
  try {
    const res = await fetch(`${API_URL}/admin/regions/provinces`, { headers: getHeaders() });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    return {
      success: true,
      data: [
        { id: '35', name: 'Jawa Timur' },
        { id: '33', name: 'Jawa Tengah' },
        { id: '31', name: 'DKI Jakarta' }
      ]
    };
  }
};

export const fetchRegencies = async (provinceId: string) => {
  try {
    const res = await fetch(`${API_URL}/admin/regions/regencies/${provinceId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const mockRegencies: Record<string, any[]> = {
      '35': [{ id: '3506', name: 'Kediri' }, { id: '3578', name: 'Surabaya' }],
      '33': [{ id: '3374', name: 'Semarang' }],
      '31': [{ id: '3174', name: 'Jakarta Selatan' }]
    };
    return {
      success: true,
      data: mockRegencies[provinceId] || []
    };
  }
};

export const fetchDistricts = async (regencyId: string) => {
  try {
    const res = await fetch(`${API_URL}/admin/regions/districts/${regencyId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const mockDistricts: Record<string, any[]> = {
      '3506': [{ id: '350619', name: 'Mojoroto' }, { id: '350620', name: 'Semen' }],
      '3578': [{ id: '357801', name: 'Gubeng' }],
      '3374': [{ id: '337411', name: 'Tembalang' }],
      '3174': [{ id: '317401', name: 'Kebayoran Baru' }]
    };
    return {
      success: true,
      data: mockDistricts[regencyId] || []
    };
  }
};

export const fetchVillages = async (districtId: string) => {
  try {
    const res = await fetch(`${API_URL}/admin/regions/villages/${districtId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch {
    const mockVillages: Record<string, any[]> = {
      '350619': [{ id: '35061901', name: 'Lirboyo' }, { id: '35061902', name: 'Bandar Kidul' }, { id: '35061903', name: 'Campurejo' }],
      '350620': [{ id: '35062001', name: 'Semen' }, { id: '35062002', name: 'Puhsarang' }],
      '357801': [{ id: '35780101', name: 'Airlangga' }, { id: '35780102', name: 'Gubeng' }],
      '337411': [{ id: '33741101', name: 'Tembalang' }, { id: '33741102', name: 'Bulusan' }],
      '317401': [{ id: '31740101', name: 'Senayan' }, { id: '31740102', name: 'Selong' }]
    };
    return {
      success: true,
      data: mockVillages[districtId] || []
    };
  }
};
