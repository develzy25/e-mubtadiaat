import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  UserMinus, 
  Sliders
} from 'lucide-react';
import { 
  fetchSantri, 
  saveSantri, 
  updateSantri, 
  deleteSantri,
  type SantriAdmin 
} from '../services/admin.service';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { SoftInput } from '../../../components/ui/SoftInput';
import { Modal } from '../../../components/ui/Modal';

// Mock Cascading Data for Indonesian Regions
interface Kelurahan {
  name: string;
  postalCode: string;
}

interface Kecamatan {
  name: string;
  kelurahans: Kelurahan[];
}

interface Kabupaten {
  name: string;
  kecamatans: Kecamatan[];
}

interface Provinsi {
  name: string;
  kabupatens: Kabupaten[];
}

const REGION_DATA: Provinsi[] = [
  {
    name: 'Jawa Timur',
    kabupatens: [
      {
        name: 'Kediri',
        kecamatans: [
          {
            name: 'Mojoroto',
            kelurahans: [
              { name: 'Lirboyo', postalCode: '64117' },
              { name: 'Bandar Kidul', postalCode: '64118' },
              { name: 'Campurejo', postalCode: '64115' }
            ]
          },
          {
            name: 'Semen',
            kelurahans: [
              { name: 'Semen', postalCode: '64161' },
              { name: 'Puhsarang', postalCode: '64162' }
            ]
          }
        ]
      },
      {
        name: 'Surabaya',
        kecamatans: [
          {
            name: 'Gubeng',
            kelurahans: [
              { name: 'Airlangga', postalCode: '60286' },
              { name: 'Gubeng', postalCode: '60281' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Jawa Tengah',
    kabupatens: [
      {
        name: 'Semarang',
        kecamatans: [
          {
            name: 'Tembalang',
            kelurahans: [
              { name: 'Tembalang', postalCode: '50275' },
              { name: 'Bulusan', postalCode: '50277' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'DKI Jakarta',
    kabupatens: [
      {
        name: 'Jakarta Selatan',
        kecamatans: [
          {
            name: 'Kebayoran Baru',
            kelurahans: [
              { name: 'Senayan', postalCode: '12190' },
              { name: 'Selong', postalCode: '12110' }
            ]
          }
        ]
      }
    ]
  }
];

export const AdminSantriPage = () => {
  const [santriList, setSantriList] = useState<SantriAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<SantriAdmin | null>(null);
  
  // Form fields
  const [formNoStambuk, setFormNoStambuk] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formName, setFormName] = useState('');
  const [formTempatLahir, setFormTempatLahir] = useState('');
  const [formTanggalLahir, setFormTanggalLahir] = useState('');
  const [formClassId, setFormClassId] = useState('kelas-001');
  const [formBagian, setFormBagian] = useState('Bagian A');
  const [formAlamatLengkap, setFormAlamatLengkap] = useState('');
  const [formProvinsi, setFormProvinsi] = useState('');
  const [formKabupaten, setFormKabupaten] = useState('');
  const [formKecamatan, setFormKecamatan] = useState('');
  const [formKelurahan, setFormKelurahan] = useState('');
  const [formKodePos, setFormKodePos] = useState('');
  const [formNoKk, setFormNoKk] = useState('');
  const [formNamaAyah, setFormNamaAyah] = useState('');
  const [formNamaIbu, setFormNamaIbu] = useState('');
  const [formTahunMasuk, setFormTahunMasuk] = useState(new Date().getFullYear().toString());
  const [formTahunKeluar, setFormTahunKeluar] = useState('');
  const [formKamar, setFormKamar] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'ALUMNI' | 'BOYONG' | 'CUTI'>('ACTIVE');

  // Custom Fields (JSON metadata)
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);

  // List cascading options based on selections
  const [kabupatenOptions, setKabupatenOptions] = useState<Kabupaten[]>([]);
  const [kecamatanOptions, setKecamatanOptions] = useState<Kecamatan[]>([]);
  const [kelurahanOptions, setKelurahanOptions] = useState<Kelurahan[]>([]);

  // Reload data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchSantri({
        classId: classFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined
      });
      if (res.success) {
        setSantriList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [classFilter, statusFilter]);

  // Handle cascading region updates
  useEffect(() => {
    const prov = REGION_DATA.find(p => p.name === formProvinsi);
    if (prov) {
      setKabupatenOptions(prov.kabupatens);
      // Reset dependent selections if not matching
      if (!prov.kabupatens.some(k => k.name === formKabupaten)) {
        setFormKabupaten('');
        setFormKecamatan('');
        setFormKelurahan('');
        setFormKodePos('');
      }
    } else {
      setKabupatenOptions([]);
      setFormKabupaten('');
      setFormKecamatan('');
      setFormKelurahan('');
      setFormKodePos('');
    }
  }, [formProvinsi]);

  useEffect(() => {
    const kab = kabupatenOptions.find(k => k.name === formKabupaten);
    if (kab) {
      setKecamatanOptions(kab.kecamatans);
      if (!kab.kecamatans.some(k => k.name === formKecamatan)) {
        setFormKecamatan('');
        setFormKelurahan('');
        setFormKodePos('');
      }
    } else {
      setKecamatanOptions([]);
      setFormKecamatan('');
      setFormKelurahan('');
      setFormKodePos('');
    }
  }, [formKabupaten, kabupatenOptions]);

  useEffect(() => {
    const kec = kecamatanOptions.find(k => k.name === formKecamatan);
    if (kec) {
      setKelurahanOptions(kec.kelurahans);
      if (!kec.kelurahans.some(k => k.name === formKelurahan)) {
        setFormKelurahan('');
        setFormKodePos('');
      }
    } else {
      setKelurahanOptions([]);
      setFormKelurahan('');
      setFormKodePos('');
    }
  }, [formKecamatan, kecamatanOptions]);

  useEffect(() => {
    const kel = kelurahanOptions.find(k => k.name === formKelurahan);
    if (kel) {
      setFormKodePos(kel.postalCode);
    } else {
      setFormKodePos('');
    }
  }, [formKelurahan, kelurahanOptions]);

  const openAddModal = () => {
    setEditingSantri(null);
    setFormNoStambuk(`STB-${new Date().getFullYear()}${String(Math.floor(1000 + Math.random() * 9000))}`);
    setFormNik('');
    setFormName('');
    setFormTempatLahir('');
    setFormTanggalLahir('');
    setFormClassId('kelas-001');
    setFormBagian('Bagian A');
    setFormAlamatLengkap('');
    setFormProvinsi('');
    setFormKabupaten('');
    setFormKecamatan('');
    setFormKelurahan('');
    setFormKodePos('');
    setFormNoKk('');
    setFormNamaAyah('');
    setFormNamaIbu('');
    setFormTahunMasuk(new Date().getFullYear().toString());
    setFormTahunKeluar('');
    setFormKamar('');
    setFormStatus('ACTIVE');
    setCustomFields([]);
    setModalOpen(true);
  };

  const openEditModal = (santri: SantriAdmin) => {
    setEditingSantri(santri);
    setFormNoStambuk(santri.noStambuk || '');
    setFormNik(santri.nik || '');
    setFormName(santri.name);
    setFormTempatLahir(santri.tempatLahir || '');
    setFormTanggalLahir(santri.tanggalLahir || '');
    setFormClassId(santri.classId);
    setFormBagian(santri.bagian || 'Bagian A');
    setFormAlamatLengkap(santri.alamatLengkap || '');
    
    // Set region cascading fields
    setFormProvinsi(santri.provinsi || '');
    // Need to temporarily set values, dependency effects will trigger cascading options
    setTimeout(() => {
      setFormKabupaten(santri.kabupaten || '');
      setTimeout(() => {
        setFormKecamatan(santri.kecamatan || '');
        setTimeout(() => {
          setFormKelurahan(santri.kelurahan || '');
          setFormKodePos(santri.kodePos || '');
        }, 50);
      }, 50);
    }, 50);

    setFormNoKk(santri.noKk || '');
    setFormNamaAyah(santri.namaAyah || '');
    setFormNamaIbu(santri.namaIbu || '');
    setFormTahunMasuk(santri.tahunMasuk || '');
    setFormTahunKeluar(santri.tahunKeluar || '');
    setFormKamar(santri.kamar || '');
    setFormStatus(santri.status);

    // Parse custom fields metadata
    try {
      if (santri.customFields) {
        const obj = JSON.parse(santri.customFields);
        const arr = Object.entries(obj).map(([k, v]) => ({ key: k, value: String(v) }));
        setCustomFields(arr);
      } else {
        setCustomFields([]);
      }
    } catch {
      setCustomFields([]);
    }

    setModalOpen(true);
  };

  const handleAddCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCustomFieldChange = (index: number, type: 'key' | 'value', text: string) => {
    setCustomFields(prev => 
      prev.map((item, idx) => 
        idx === index ? { ...item, [type]: text } : item
      )
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    // Convert custom fields array back to JSON object
    const fieldsObj: Record<string, string> = {};
    customFields.forEach(item => {
      if (item.key.trim()) {
        fieldsObj[item.key.trim()] = item.value;
      }
    });

    const payload = {
      noStambuk: formNoStambuk,
      nik: formNik,
      name: formName,
      tempatLahir: formTempatLahir,
      tanggalLahir: formTanggalLahir,
      classId: formClassId,
      bagian: formBagian,
      alamatLengkap: formAlamatLengkap,
      provinsi: formProvinsi,
      kabupaten: formKabupaten,
      kecamatan: formKecamatan,
      kelurahan: formKelurahan,
      kodePos: formKodePos,
      noKk: formNoKk,
      namaAyah: formNamaAyah,
      namaIbu: formNamaIbu,
      tahunMasuk: formTahunMasuk,
      tahunKeluar: formStatus !== 'ACTIVE' ? (formTahunKeluar || new Date().getFullYear().toString()) : null,
      kamar: formKamar,
      customFields: Object.keys(fieldsObj).length > 0 ? JSON.stringify(fieldsObj) : null,
      status: formStatus,
    };

    try {
      if (editingSantri) {
        await updateSantri(editingSantri.id, payload);
      } else {
        await saveSantri(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickBoyong = async (santri: SantriAdmin) => {
    if (confirm(`Apakah Anda yakin ingin memproses status BOYONG untuk santri ${santri.name}?`)) {
      try {
        await updateSantri(santri.id, { 
          status: 'BOYONG',
          tahunKeluar: new Date().getFullYear().toString()
        });
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data santri ini secara permanen dari daftar?')) {
      try {
        await deleteSantri(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Database Santri</h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Kelola master biodata santri putri, status keaktifan, alumni (boyong), dan custom fields.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PremiumButton
            onClick={openAddModal}
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            className="shadow-md shrink-0"
          >
            Tambah Santri Baru
          </PremiumButton>
        </div>
      </div>

      {/* Filters & Search */}
      <GlassCard variant="neumorph" className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <SoftInput
            placeholder="Cari Nama, Stambuk, NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5 text-slate-400" />}
            className="w-full"
          />
          {search && (
            <button 
              onClick={() => { setSearch(''); setTimeout(() => loadData(), 50); }}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500"
            >
              <option value="">Semua Kelas</option>
              <option value="kelas-001">Bagian A (Tsanawiyah)</option>
              <option value="kelas-002">Bagian B (Tsanawiyah)</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="BOYONG">Boyong (Keluar)</option>
            <option value="CUTI">Cuti</option>
          </select>

          <PremiumButton 
            onClick={loadData}
            variant="secondary"
            className="px-4 py-2 text-xs shrink-0"
          >
            Terapkan Filter
          </PremiumButton>
        </div>
      </GlassCard>

      {/* Datatable */}
      <GlassCard variant="neumorph" className="overflow-hidden border border-slate-200/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Memuat data santri...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4">No. Stambuk / NIK</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">TTL</th>
                  <th className="px-6 py-4">Kelas & Bagian</th>
                  <th className="px-6 py-4">Kamar Asrama</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700 bg-white/40">
                {santriList.map(santri => (
                  <tr key={santri.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-800">{santri.noStambuk || '-'}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{santri.nik || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900">{santri.name}</div>
                      {santri.customFields && (
                        <div className="text-[9px] text-slate-500 font-bold bg-blue-50/50 border border-blue-100/50 px-1.5 py-0.5 rounded mt-1 inline-flex items-center gap-1">
                          <Sliders className="w-2.5 h-2.5" />
                          Kolom Kustom Tersimpan
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{santri.tempatLahir || '-'}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{santri.tanggalLahir || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {santri.classId === 'kelas-001' ? 'Bagian A' : 'Bagian B'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{santri.bagian || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold">{santri.kamar || 'Belum diatur'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        santri.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : santri.status === 'BOYONG' 
                          ? 'bg-rose-500/10 text-rose-600' 
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {santri.status === 'ACTIVE' ? 'Aktif' : santri.status === 'BOYONG' ? 'Boyong' : 'Cuti'}
                      </span>
                      {santri.tahunKeluar && (
                        <div className="text-[9px] text-slate-400 font-bold mt-1">Keluar: {santri.tahunKeluar}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {santri.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleQuickBoyong(santri)}
                            title="Set status Boyong"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(santri)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(santri.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {santriList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                      Tidak ada data santri ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* CRUD Dialog Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSantri ? `Edit Data: ${editingSantri.name}` : 'Tambah Santri Putri Baru'}
        maxWidthClass="max-w-3xl"
        onSubmit={handleSave}
        footer={
          <>
            <PremiumButton
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </PremiumButton>
            <PremiumButton
              type="submit"
              variant="primary"
              rightIcon={<Save className="w-5 h-5" />}
            >
              Simpan Perubahan
            </PremiumButton>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. No Stambuk */}
          <SoftInput
            label="Nomor Stambuk"
            value={formNoStambuk}
            onChange={(e) => setFormNoStambuk(e.target.value)}
            placeholder="Contoh: STB-20260001"
            required
          />
          {/* 2. NIK */}
          <SoftInput
            label="Nomor Induk Keluarga (NIK)"
            value={formNik}
            onChange={(e) => setFormNik(e.target.value)}
            placeholder="NIK 16 digit..."
            maxLength={16}
          />
        </div>

        {/* 3. Nama Lengkap */}
        <SoftInput
          label="Nama Lengkap"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Nama Lengkap Siswi..."
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 4. Tempat Lahir */}
          <SoftInput
            label="Tempat Lahir"
            value={formTempatLahir}
            onChange={(e) => setFormTempatLahir(e.target.value)}
            placeholder="Kabupaten/Kota lahir..."
          />
          {/* 5. Tanggal Lahir */}
          <SoftInput
            label="Tanggal Lahir"
            type="date"
            value={formTanggalLahir}
            onChange={(e) => setFormTanggalLahir(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 6. Kelas (Dropdown) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wide">Kelas</label>
            <select
              value={formClassId}
              onChange={(e) => setFormClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white transition-all neumorph-pressed"
            >
              <option value="kelas-001">Bagian A (Tsanawiyah)</option>
              <option value="kelas-002">Bagian B (Tsanawiyah)</option>
            </select>
          </div>
          {/* 7. Bagian */}
          <SoftInput
            label="Bagian"
            value={formBagian}
            onChange={(e) => setFormBagian(e.target.value)}
            placeholder="Contoh: Bagian A, Bagian B..."
          />
        </div>

        {/* 8. Alamat Lengkap & Dropdown Wilayah Cascaded */}
        <div className="border border-slate-200/60 rounded-2xl p-4 bg-slate-50/30 space-y-3">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wide block border-b border-slate-200/80 pb-2">
            Alamat Lengkap & Wilayah (Indonesian Region Dropdowns)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Provinsi select */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Provinsi</span>
              <select
                value={formProvinsi}
                onChange={(e) => setFormProvinsi(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-hidden"
              >
                <option value="">-- Pilih Provinsi --</option>
                {REGION_DATA.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Kabupaten select */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Kabupaten/Kota</span>
              <select
                value={formKabupaten}
                disabled={!formProvinsi}
                onChange={(e) => setFormKabupaten(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">-- Pilih Kota --</option>
                {kabupatenOptions.map(k => (
                  <option key={k.name} value={k.name}>{k.name}</option>
                ))}
              </select>
            </div>

            {/* Kecamatan select */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Kecamatan</span>
              <select
                value={formKecamatan}
                disabled={!formKabupaten}
                onChange={(e) => setFormKecamatan(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">-- Pilih Kecamatan --</option>
                {kecamatanOptions.map(k => (
                  <option key={k.name} value={k.name}>{k.name}</option>
                ))}
              </select>
            </div>

            {/* Kelurahan select */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Kelurahan/Desa</span>
              <select
                value={formKelurahan}
                disabled={!formKecamatan}
                onChange={(e) => setFormKelurahan(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">-- Pilih Desa --</option>
                {kelurahanOptions.map(k => (
                  <option key={k.name} value={k.name}>{k.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <SoftInput
                label="Alamat Jalan / Dusun / RT-RW"
                value={formAlamatLengkap}
                onChange={(e) => setFormAlamatLengkap(e.target.value)}
                placeholder="Nama jalan, gang, RT/RW, Dusun..."
                className="py-2.5 text-xs"
              />
            </div>
            <div>
              {/* Kode pos: auto-filled but editable */}
              <SoftInput
                label="Kode Pos (Otomatis)"
                value={formKodePos}
                onChange={(e) => setFormKodePos(e.target.value)}
                placeholder="Kode pos..."
                className="py-2.5 text-xs text-blue-600 font-extrabold bg-blue-50/20"
              />
            </div>
          </div>
        </div>

        {/* KK & Orang Tua */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SoftInput
            label="Nomor KK (Kartu Keluarga)"
            value={formNoKk}
            onChange={(e) => setFormNoKk(e.target.value)}
            placeholder="Nomor KK 16 digit..."
            maxLength={16}
          />
          <SoftInput
            label="Nama Lengkap Ayah"
            value={formNamaAyah}
            onChange={(e) => setFormNamaAyah(e.target.value)}
            placeholder="Nama ayah kandung..."
          />
          <SoftInput
            label="Nama Lengkap Ibu"
            value={formNamaIbu}
            onChange={(e) => setFormNamaIbu(e.target.value)}
            placeholder="Nama ibu kandung..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SoftInput
            label="Tahun Masuk"
            value={formTahunMasuk}
            onChange={(e) => setFormTahunMasuk(e.target.value)}
            placeholder="Contoh: 2024"
          />
          {formStatus !== 'ACTIVE' && (
            <SoftInput
              label="Tahun Keluar"
              value={formTahunKeluar}
              onChange={(e) => setFormTahunKeluar(e.target.value)}
              placeholder="Contoh: 2026"
            />
          )}
          <SoftInput
            label="Kamar Asrama"
            value={formKamar}
            onChange={(e) => setFormKamar(e.target.value)}
            placeholder="Misal: Khadijah 02"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wide">Status Keaktifan</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500 focus:bg-white transition-all neumorph-pressed"
            >
              <option value="ACTIVE">Aktif</option>
              <option value="ALUMNI">Alumni (Lulus)</option>
              <option value="BOYONG">Boyong (Keluar)</option>
              <option value="CUTI">Cuti</option>
            </select>
          </div>
        </div>

        {/* Dynamic Custom Fields Area */}
        <div className="border border-slate-200/60 rounded-2xl p-4 bg-slate-50/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-wide">
              Kolom Tambahan (Custom Fields JSON)
            </label>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="text-[10px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors border border-blue-200/50"
            >
              + Tambah Kolom Baru
            </button>
          </div>

          {customFields.length === 0 ? (
            <p className="text-[11px] text-slate-400 font-semibold italic text-center py-2">
              Belum ada kolom kustom tambahan. Klik tombol di atas untuk menambah atribut (misal: "Ukuran Baju").
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/40 border border-slate-200/60 p-2 rounded-xl">
                  <input
                    type="text"
                    placeholder="Nama Kolom (Kunci)"
                    value={field.key}
                    onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                    className="bg-transparent border-none focus:outline-none font-bold text-xs text-slate-700 w-1/2"
                  />
                  <span className="text-slate-300">|</span>
                  <input
                    type="text"
                    placeholder="Isi Nilai"
                    value={field.value}
                    onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-xs text-slate-600 w-1/2"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(index)}
                    className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
