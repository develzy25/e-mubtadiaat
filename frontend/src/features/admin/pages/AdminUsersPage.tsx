import { useState, useEffect } from 'react';
import { 
  Shield, 
  Edit3, 
  Save, 
  BookOpen, 
  AlertCircle,
  Trash2,
  Plus,
  Key,
  MessageSquare,
  Phone
} from 'lucide-react';
import { 
  fetchUsers, 
  saveUser, 
  updateUser, 
  deleteUser, 
  resetUserPassword,
  fetchSantri
} from '../services/admin.service';
import type { UserAdmin, SantriAdmin } from '../services/admin.service';
import { 
  GlassCard, 
  PremiumButton, 
  SoftInput,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal
} from '../../../components/ui';
import { useNotificationStore } from '../../../stores/notificationStore';

export const AdminUsersPage = () => {
  const { showToast, showConfirm } = useNotificationStore();
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [alumniList, setAlumniList] = useState<SantriAdmin[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null); // null means "Add New User"
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState('Mustahiq');
  const [formClassId, setFormClassId] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formTahunMulai, setFormTahunMulai] = useState('');
  const [formTahunAkhir, setFormTahunAkhir] = useState('Sekarang');
  const [formAngkatanAccess, setFormAngkatanAccess] = useState<string[]>([]);
  const [selectedAlumniId, setSelectedAlumniId] = useState('');

  // List of available angkatan values for checkbox selection
  const listAngkatan = ['Tsanawiyah - Angkatan 2024', 'Tsanawiyah - Angkatan 2025', 'Tsanawiyah - Angkatan 2026'];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      if (res.success && res.data) {
        setUsers(res.data.users);
        setClasses(res.data.classes);
      }

      // Load alumni for promotion
      const resAlumni = await fetchSantri({ status: 'ALUMNI' });
      if (resAlumni.success) {
        setAlumniList(resAlumni.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setSelectedUser(null);
    setFormName('');
    setFormUsername('');
    setFormRole('Mustahiq');
    setFormClassId('');
    setFormPhone('');
    setFormAlamat('');
    setFormTahunMulai(new Date().getFullYear().toString());
    setFormTahunAkhir('Sekarang');
    setFormAngkatanAccess(['Tsanawiyah - Angkatan 2024']);
    setSelectedAlumniId('');
    setError('');
    setEditModalOpen(true);
  };

  const openEditModal = (user: UserAdmin) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormUsername(user.email.split('@')[0] || '');
    setFormRole(user.role);
    setFormPhone(user.phone || '');
    setFormAlamat(user.alamat || '');
    setFormTahunMulai(user.tahunMulai || '');
    setFormTahunAkhir(user.tahunAkhir || 'Sekarang');
    setSelectedAlumniId('');
    
    // Find matching class
    const matchClass = classes.find(c => user.assignedClass.includes(c.name.split(' (')[0]));
    setFormClassId(matchClass?.id || '');

    // Set Initial angkatan access simulated
    if (user.role === 'Mustahiq' && user.assignedClass.includes('Bagian A')) {
      setFormAngkatanAccess(['Tsanawiyah - Angkatan 2024']);
    } else if (user.role === 'Mustahiq' && user.assignedClass.includes('Bagian B')) {
      setFormAngkatanAccess(['Tsanawiyah - Angkatan 2024', 'Tsanawiyah - Angkatan 2025']);
    } else {
      setFormAngkatanAccess(['Tsanawiyah - Angkatan 2024', 'Tsanawiyah - Angkatan 2025', 'Tsanawiyah - Angkatan 2026']);
    }

    setError('');
    setEditModalOpen(true);
  };

  const handleSelectAlumni = (alumniId: string) => {
    setSelectedAlumniId(alumniId);
    if (!alumniId) return;

    const selected = alumniList.find(s => s.id === alumniId);
    if (selected) {
      setFormName(selected.name);
      setFormAlamat(selected.alamatLengkap || '');
      setFormTahunMulai(new Date().getFullYear().toString());
      // Generate clean email
      const username = selected.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      setFormUsername(username);
    }
  };

  const handleAngkatanToggle = (angkatan: string) => {
    setFormAngkatanAccess(prev => 
      prev.includes(angkatan) 
        ? prev.filter(a => a !== angkatan)
        : [...prev, angkatan]
    );
  };

  const handleDelete = (user: UserAdmin) => {
    showConfirm(
      'Hapus Pengguna',
      `Apakah Anda yakin ingin menghapus hak akses ${user.name}?`,
      async () => {
        try {
          const res = await deleteUser(user.id);
          if (res.success) {
            showToast('Pengguna berhasil dihapus.', 'success');
            loadData();
          } else {
            showToast(res.message || 'Gagal menghapus pengguna.', 'error');
          }
        } catch {
          showToast('Terjadi kesalahan sistem.', 'error');
        }
      }
    );
  };

  const handleResetPassword = (user: UserAdmin) => {
    showConfirm(
      'Reset Kata Sandi',
      `Apakah Anda yakin ingin mereset kata sandi ${user.name} menjadi "mubtadiaat123"?`,
      async () => {
        try {
          const res = await resetUserPassword(user.id);
          if (res.success) {
            showToast('Kata sandi berhasil direset ke "mubtadiaat123".', 'success');
          } else {
            showToast(res.message || 'Gagal mereset kata sandi.', 'error');
          }
        } catch {
          showToast('Terjadi kesalahan sistem.', 'error');
        }
      }
    );
  };

  const handleSendWA = (user: UserAdmin) => {
    if (!user.phone) {
      showToast('Nomor WhatsApp pengguna belum diisi.', 'warning');
      return;
    }

    // Format phone
    let formattedPhone = user.phone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    const message = `Assalamu'alaikum Wr. Wb. Nyuwun sewu Ust./Ustdh. *${user.name}*, menika informasi akun e-Mubtadi'aat panjenengan ingkang sampun dipun-damelaken dening Admin:

Username: *${user.email}*
Sandi Default: *mubtadiaat123*

Panjenengan saget mlebet wonten aplikasi lan dipun-suwun nggantos sandi sasampunipun mlebet kaping pisan. Matur nuwun sanget. Wassalamu'alaikum Wr. Wb.`;

    const encodedText = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formName.trim() || !formUsername.trim()) {
      setError('Nama Lengkap dan Username wajib diisi.');
      return;
    }

    const assignedClass = formRole === 'Mustahiq' || formRole === 'Mufatish'
      ? (classes.find(c => c.id === formClassId)?.name || 'Semua Kelas')
      : 'Seluruh Lembaga';

    const payload: Partial<UserAdmin> = {
      name: formName.trim(),
      email: formUsername.includes('@') ? formUsername.trim() : `${formUsername.trim().replace(/\s+/g, '').toLowerCase()}@mubtadiaat.id`,
      role: formRole,
      assignedClass,
      phone: formPhone.trim(),
      alamat: formAlamat.trim(),
      tahunMulai: formTahunMulai.trim(),
      tahunAkhir: formTahunAkhir.trim()
    };

    try {
      let res;
      if (selectedUser) {
        res = await updateUser(selectedUser.id, payload);
      } else {
        res = await saveUser(payload);
      }

      if (res.success) {
        showToast(
          selectedUser 
            ? 'Profil & Otorisasi berhasil diperbarui.' 
            : 'Pengguna baru berhasil ditambahkan.', 
          'success'
        );
        setEditModalOpen(false);
        loadData();
      } else {
        setError(res.message || 'Gagal menyimpan data.');
      }
    } catch {
      setError('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Otorisasi & Pengurus
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Manajemen akun dan hak akses Mustahiq (Wali Kelas), Mufatish (Pimpinan Tingkat), dan Mundzir (Madrasah).
          </p>
        </div>
        <PremiumButton 
          onClick={openAddModal}
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Tambah Pengurus
        </PremiumButton>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User table list */}
        <div className="xl:col-span-2">
          <GlassCard variant="neumorph" className="overflow-hidden border border-slate-200/50">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200">
              <h3 className="font-extrabold text-xs text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Daftar Tenaga Pendidik & Pengurus
              </h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-semibold text-[10px] uppercase">Memuat pengguna...</p>
              </div>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Tenaga Pendidik</Th>
                    <Th>Peran Akses</Th>
                    <Th>Detail Mengajar</Th>
                    <Th className="text-right">Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map(user => (
                    <Tr key={user.id}>
                      <Td>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{user.email}</div>
                        {user.phone && (
                          <div className="text-[10px] font-bold flex items-center gap-1 mt-1 text-emerald-600">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          user.role === 'Admin / Pimpinan' 
                            ? 'bg-purple-100 text-purple-700' 
                            : user.role === 'Mundzir' 
                            ? 'bg-emerald-100 text-emerald-700'
                            : user.role === 'Mufatish'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </Td>
                      <Td>
                        <div className="font-bold text-slate-700">{user.assignedClass}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                          Tahun Mengajar: <span className="text-blue-600">{user.tahunMulai || '-'} s/d {user.tahunAkhir || 'Sekarang'}</span>
                        </div>
                      </Td>
                      <Td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(user)}
                              title="Edit Pengurus"
                              className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              title="Reset Password ke Default"
                              className="p-2 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors inline-flex items-center"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSendWA(user)}
                              title="Kirim Info Akun via WA"
                              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              title="Hapus Pengurus"
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors inline-flex items-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </GlassCard>
        </div>

        {/* Access Rights Policy details */}
        <div>
          <GlassCard variant="neumorph" className="p-6 border border-slate-200/50 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Kebijakan Akses</h3>
            </div>
            
            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="font-extrabold uppercase text-[10px] text-blue-600 mb-1">Mustahiq (Wali Kelas)</p>
                <p className="leading-relaxed">
                  Mengelola data kelas binaan secara langsung di aplikasi PWA mobile, termasuk input nilai dan absensi harian.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="font-extrabold uppercase text-[10px] text-amber-600 mb-1">Mufatish (Pimpinan Tingkatan)</p>
                <p className="leading-relaxed">
                  Mendapatkan akses monitoring rekapitulasi nilai dan presensi ke angkatan yang ditunjuk untuk pengawasan internal tingkat.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="font-extrabold uppercase text-[10px] text-emerald-600 mb-1">Mundzir (Pimpinan Madrasah)</p>
                <p className="leading-relaxed">
                  Memiliki akses monitoring menyeluruh (lintas angkatan) untuk memantau grafik perkembangan santri se-madrasah via portal desktop.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Edit Access Rights Modal Dialog */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedUser ? 'Atur Otorisasi Akun' : 'Tambah Pengurus Baru'}
        maxWidthClass="max-w-lg"
        onSubmit={handleSave}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <PremiumButton
              type="submit"
              variant="primary"
              rightIcon={<Save className="w-4 h-4" />}
            >
              Simpan Pengurus
            </PremiumButton>
          </>
        }
      >
        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-bold">
            {error}
          </div>
        )}

        {/* Optional Alumni Picker for New User */}
        {!selectedUser && alumniList.length > 0 && (
          <div className="border border-blue-100 bg-blue-50/20 p-3.5 rounded-2xl space-y-2">
            <label className="text-[10px] font-black text-blue-700 uppercase tracking-wide block">
              🎓 Ambil dari Data Alumni (Masa Khidmah / Mustahiqoh)
            </label>
            <select
              value={selectedAlumniId}
              onChange={(e) => handleSelectAlumni(e.target.value)}
              className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-hidden"
            >
              <option value="">-- Pilih Alumni (Opsional) --</option>
              {alumniList.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.noStambuk})</option>
              ))}
            </select>
            <p className="text-[9px] text-slate-400 font-medium">
              *Memilih alumni akan otomatis mengisi Nama Lengkap, Alamat, dan meng-generate Email.
            </p>
          </div>
        )}

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SoftInput
            label="Nama Lengkap"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="develzy"
            required
          />
          <SoftInput
            label="Username (Tanpa Spasi)"
            value={formUsername}
            onChange={(e) => setFormUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
            placeholder="muhammad"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SoftInput
            label="Nomor WhatsApp"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="085171542025"
          />
          <SoftInput
            label="Alamat Pengurus"
            value={formAlamat}
            onChange={(e) => setFormAlamat(e.target.value)}
            placeholder="Kec. Mojoroto, Kediri"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SoftInput
            label="Tahun Mulai Mengajar"
            value={formTahunMulai}
            onChange={(e) => setFormTahunMulai(e.target.value)}
            placeholder="Contoh: 2024"
          />
          <SoftInput
            label="Tahun Terakhir Mengajar"
            value={formTahunAkhir}
            onChange={(e) => setFormTahunAkhir(e.target.value)}
            placeholder="Contoh: Sekarang"
          />
        </div>

        {/* Role Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Peran Sistem (Role)</label>
          <select
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white neumorph-pressed"
          >
            <option value="Mustahiq">Mustahiq (Wali Kelas)</option>
            <option value="Mufatish">Mufatish (Pimpinan Tingkatan)</option>
            <option value="Mundzir">Mundzir (Pimpinan Madrasah)</option>
            <option value="Admin / Pimpinan">Server / Administrator Utama</option>
          </select>
        </div>

        {/* Class Select (Only for Mustahiq/Mufatish) */}
        {(formRole === 'Mustahiq' || formRole === 'Mufatish') && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Kelas Utama Binaan</label>
            <select
              value={formClassId}
              onChange={(e) => setFormClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white neumorph-pressed"
              required
            >
              <option value="">-- Pilih Kelas Utama --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Angkatan Access Checklist */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40 space-y-3">
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-wide block border-b border-slate-200 pb-2">
            Kustomisasi Akses Angkatan (Lintas Kelas)
          </label>
          
          <div className="space-y-2">
            {listAngkatan.map(angkatan => {
              const isChecked = formAngkatanAccess.includes(angkatan) || formRole === 'Admin / Pimpinan' || formRole === 'Mundzir';
              return (
                <label 
                  key={angkatan} 
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                    isChecked 
                      ? 'bg-blue-50/50 border-blue-200 text-blue-800' 
                       : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{angkatan}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={formRole === 'Admin / Pimpinan' || formRole === 'Mundzir'}
                    onChange={() => handleAngkatanToggle(angkatan)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
          {(formRole === 'Admin / Pimpinan' || formRole === 'Mundzir') && (
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Peran Pimpinan/Admin otomatis memiliki akses penuh ke seluruh angkatan.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
