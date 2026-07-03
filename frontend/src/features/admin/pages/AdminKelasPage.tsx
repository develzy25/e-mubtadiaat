import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  BookOpen, 
  School, 
  Edit3, 
  Trash2, 
  Save, 
  Search,
  Layers,
  BookMarked,
  Award,
  CheckCircle2,
  DownloadCloud,
  UploadCloud,
  FileSpreadsheet,
  Info,
  RefreshCw,
  FileUp,
  FileDown,
  CheckCircle
} from 'lucide-react';
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
import * as masterService from '../services/master.service';

// 1. Data Interfaces
interface JenjangItem {
  id: string;
  name: string; // e.g. I'dadiyah, Ibtida'iyyah, Tsanawiyah, Aliyah
  mundzirName: string; // Mundzir supervisor for the whole Jenjang
}

interface TingkatItem {
  id: string;
  jenjangName: string; // e.g. Ibtida'iyyah
  romanName: string; // e.g. I, II, III, IV, V, VI
  mufatishName: string; // Mufatish supervisor for this specific Tingkat
  targetNadzom: string; // e.g. Aqidatul Awam, Imrithi, Alfiyah
  targetBait: number;
  hasPraktek: boolean; // Enabled only for end of Ibtida'iyyah (VI), Tsanawiyah (III), Aliyah (III)
  praktekSubjects: string[];
}

interface KelasItem {
  id: string;
  jenjangName: string; // e.g. Ibtida'iyyah
  tingkatName: string; // e.g. V (Roman numeral)
  bagian: string; // e.g. A, B, C
  lokal: string; // e.g. Lokal 1, Lokal 2
  mustahiqName: string; // Main teacher
  munawwibNames: string[]; // Assistant teachers
}

interface KitabItem {
  id: string;
  name: string;
  jenjangName: string;
  tingkatName: string;
  fanIlmu: string;
  pengajar: string;
  waktu: string;
}

// LocalStorage Keys
const MOCK_JENJANG_KEY = 'mubtadiat.mock.jenjang_hierarchy';
const MOCK_TINGKAT_KEY = 'mubtadiat.mock.tingkat_hierarchy';
const MOCK_CLASSES_KEY = 'mubtadiat.mock.kelas_hierarchy';
const MOCK_KITABS_KEY = 'mubtadiat.mock.kitab_hierarchy';

const FAN_ILMU_OPTIONS = [
  'Fiqh',
  'Nahwu',
  'Shorof',
  'Tauhid',
  'Tafsir',
  'Hadits',
  'Akhlaq',
  'Tarikh',
  'Tajwid'
];

export const AdminKelasPage = () => {
  const { showToast, showConfirm } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<'jenjang' | 'tingkat' | 'kelas' | 'kitab' | 'importexport'>('jenjang');

  // Import/Export state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{ jenjang: number; tingkat: number; kelas: number; kitab: number } | null>(null);
  
  // Lists
  const [jenjangList, setJenjangList] = useState<JenjangItem[]>([]);
  const [tingkatList, setTingkatList] = useState<TingkatItem[]>([]);
  const [classList, setClassList] = useState<KelasItem[]>([]);
  const [kitabList, setKitabList] = useState<KitabItem[]>([]);

  // Search states
  const [searchJenjang, setSearchJenjang] = useState('');
  const [searchTingkat, setSearchTingkat] = useState('');
  const [searchKelas, setSearchKelas] = useState('');
  const [searchKitab, setSearchKitab] = useState('');

  // Modals visibility
  const [jenjangModalOpen, setJenjangModalOpen] = useState(false);
  const [tingkatModalOpen, setTingkatModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [kitabModalOpen, setKitabModalOpen] = useState(false);

  // Edit references
  const [editingJenjang, setEditingJenjang] = useState<JenjangItem | null>(null);
  const [editingTingkat, setEditingTingkat] = useState<TingkatItem | null>(null);
  const [editingKelas, setEditingKelas] = useState<KelasItem | null>(null);
  const [editingKitab, setEditingKitab] = useState<KitabItem | null>(null);

  // Form states: Jenjang
  const [formJenjangName, setFormJenjangName] = useState('');
  const [formMundzirName, setFormMundzirName] = useState('');

  // Form states: Tingkat
  const [formTingkatJenjang, setFormTingkatJenjang] = useState('');
  const [formTingkatRoman, setFormTingkatRoman] = useState('I');
  const [formMufatishName, setFormMufatishName] = useState('');
  const [formTargetNadzom, setFormTargetNadzom] = useState('');
  const [formTargetBait, setFormTargetBait] = useState(0);
  const [formHasPraktek, setFormHasPraktek] = useState(false);
  const [formPraktekSubjects, setFormPraktekSubjects] = useState<string[]>(['']);

  // Form states: Kelas
  const [formClassJenjang, setFormClassJenjang] = useState('');
  const [formClassTingkat, setFormClassTingkat] = useState('');
  const [formClassBagian, setFormClassBagian] = useState('');
  const [formClassLokal, setFormClassLokal] = useState('');
  const [formClassMustahiq, setFormClassMustahiq] = useState('');
  const [formClassMunawwibs, setFormClassMunawwibs] = useState<string[]>(['']);

  // Form states: Kitab
  const [formKitabName, setFormKitabName] = useState('');
  const [formKitabJenjang, setFormKitabJenjang] = useState('');
  const [formKitabTingkat, setFormKitabTingkat] = useState('');
  const [formKitabFan, setFormKitabFan] = useState('Fiqh');
  const [formKitabPengajar, setFormKitabPengajar] = useState('');
  const [formKitabWaktu, setFormKitabWaktu] = useState('');

  // Initialize and load
  const loadData = async () => {
    setIsProcessing(true);
    try {
      const [jRes, tRes, cRes, kRes] = await Promise.all([
        masterService.fetchJenjang(),
        masterService.fetchTingkat(),
        masterService.fetchKelas(),
        masterService.fetchKitab()
      ]);

      if (jRes.success) setJenjangList(jRes.data);
      if (tRes.success) {
        // Parse praktekSubjects
        const parsedTingkat = tRes.data.map((t: any) => ({
          ...t,
          praktekSubjects: t.praktekSubjects ? JSON.parse(t.praktekSubjects) : []
        }));
        setTingkatList(parsedTingkat);
      }
      if (cRes.success) {
        const parsedKelas = cRes.data.map((c: any) => ({
          ...c,
          munawwibNames: c.munawwibNames ? JSON.parse(c.munawwibNames) : []
        }));
        setClassList(parsedKelas);
      }
      if (kRes.success) setKitabList(kRes.data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data Kelas/Kitab', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync default select option value when jenjang list changes
  useEffect(() => {
    if (jenjangList.length > 0) {
      const firstJenjang = jenjangList[0].name;
      setFormTingkatJenjang(firstJenjang);
      setFormClassJenjang(firstJenjang);
      setFormKitabJenjang(firstJenjang);
    }
  }, [jenjangList]);

  // Sync tingkat options when chosen jenjang changes in class/kitab forms
  useEffect(() => {
    const list = tingkatList.filter(t => t.jenjangName === formClassJenjang);
    if (list.length > 0) {
      setFormClassTingkat(list[0].romanName);
    } else {
      setFormClassTingkat('');
    }
  }, [formClassJenjang, tingkatList]);

  useEffect(() => {
    const list = tingkatList.filter(t => t.jenjangName === formKitabJenjang);
    if (list.length > 0) {
      setFormKitabTingkat(list[0].romanName);
    } else {
      setFormKitabTingkat('');
    }
  }, [formKitabJenjang, tingkatList]);

  // Calculate dynamic student count per Jenjang
  const getStudentCountForJenjang = (levelName: string) => {
    try {
      const santriData = JSON.parse(localStorage.getItem('mubtadiat.mock.santri') || '[]');
      return santriData.filter((s: any) => 
        s.classId === levelName || s.bagian?.toLowerCase() === levelName.toLowerCase() ||
        classList.filter(c => c.jenjangName.toLowerCase() === levelName.toLowerCase()).map(c => c.id).includes(s.classId)
      ).length;
    } catch (e) {
      return 0;
    }
  };

  // Rule exception checks
  const isIdadiyah = (levelName: string) => {
    return levelName.toLowerCase().includes("i'dadiyah") || levelName.toLowerCase() === 'idadiyah';
  };

  // Check if a tingkat is the final/end tingkat of its jenjang
  const isFinalTingkat = (jenjang: string, roman: string) => {
    if (isIdadiyah(jenjang)) return false; // Exclude I'dadiyah from praktek
    if (jenjang.toLowerCase().includes("ibtida'iyyah")) return roman === 'VI';
    return roman === 'III'; // Tsanawiyah and Aliyah ends at III
  };

  // --- 1. CRUD Jenjang ---
  const handleSaveJenjang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJenjangName.trim()) return;

    try {
      if (editingJenjang) {
        await masterService.updateJenjang(editingJenjang.id, {
          name: formJenjangName,
          mundzirName: formMundzirName || 'Belum ditunjuk'
        });
        showToast(`Jenjang ${formJenjangName} berhasil diperbarui.`, 'success');
      } else {
        await masterService.createJenjang({
          name: formJenjangName,
          mundzirName: formMundzirName || 'Belum ditunjuk'
        });
        showToast(`Jenjang baru ${formJenjangName} berhasil ditambahkan.`, 'success');
      }
      setJenjangModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem', 'error');
    }
  };

  const handleDeleteJenjang = async (id: string, name: string) => {
    showConfirm(
      'Hapus Data Jenjang',
      `Menghapus jenjang ${name} akan menghapus seluruh data tingkat dan kelas di bawahnya. Anda yakin?`,
      'warning',
      async () => {
        try {
          await masterService.deleteJenjang(id);
          showToast(`Jenjang ${name} berhasil dihapus.`, 'success');
          loadData();
        } catch (err: any) {
          showToast(err.message || 'Terjadi kesalahan sistem', 'error');
        }
      }
    );
  };

  // --- 2. CRUD Tingkat ---
  const handleSaveTingkat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEnd = isFinalTingkat(formTingkatJenjang, formTingkatRoman);
    const filteredPraktek = (isEnd && formHasPraktek) 
      ? formPraktekSubjects.map(p => p.trim()).filter(Boolean) 
      : [];

    const payload = {
      jenjangName: formTingkatJenjang,
      jenjangId: jenjangList.find(j => j.name === formTingkatJenjang)?.id || '',
      romanName: formTingkatRoman,
      mufatishName: formMufatishName || 'Belum ditunjuk',
      targetNadzom: formTargetNadzom || 'Belum diatur',
      targetBait: Number(formTargetBait) || 0,
      hasPraktek: isEnd && formHasPraktek,
      praktekSubjects: filteredPraktek
    };

    try {
      if (editingTingkat) {
        await masterService.updateTingkat(editingTingkat.id, payload);
        showToast(`Tingkat ${formTingkatRoman} ${formTingkatJenjang} berhasil diperbarui.`, 'success');
      } else {
        await masterService.createTingkat(payload);
        showToast(`Tingkat baru ${formTingkatRoman} ${formTingkatJenjang} berhasil ditambahkan.`, 'success');
      }
      setTingkatModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem', 'error');
    }
  };

  const handleDeleteTingkat = async (id: string, jenjang: string, roman: string) => {
    showConfirm(
      'Hapus Data Tingkat',
      `Apakah Anda yakin ingin menghapus data tingkat ${roman} di jenjang ${jenjang}?`,
      'warning',
      async () => {
        try {
          await masterService.deleteTingkat(id);
          showToast(`Tingkat ${roman} ${jenjang} berhasil dihapus.`, 'success');
          loadData();
        } catch (err: any) {
          showToast(err.message || 'Terjadi kesalahan sistem', 'error');
        }
      }
    );
  };

  // --- 3. CRUD Kelas ---
  const handleSaveKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassBagian.trim()) return;

    const filteredMunawwibs = formClassMunawwibs.map(m => m.trim()).filter(Boolean);

    const payload = {
      name: `${formClassJenjang} ${formClassTingkat} - ${formClassBagian}`,
      level: formClassJenjang,
      jenjangName: formClassJenjang,
      tingkatName: formClassTingkat,
      bagian: formClassBagian.toUpperCase(),
      lokal: formClassLokal || 'Belum diatur',
      mustahiqName: formClassMustahiq || 'Belum ditunjuk',
      munawwibNames: filteredMunawwibs.length > 0 ? filteredMunawwibs : ['Belum ditunjuk']
    };

    try {
      if (editingKelas) {
        await masterService.updateKelas(editingKelas.id, payload);
        showToast(`Kelas ${formClassJenjang} ${formClassTingkat} Bagian ${formClassBagian} berhasil diperbarui.`, 'success');
      } else {
        await masterService.createKelas(payload);
        showToast(`Kelas baru ${formClassJenjang} ${formClassTingkat} Bagian ${formClassBagian} berhasil ditambahkan.`, 'success');
      }
      setClassModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem', 'error');
    }
  };

  const handleDeleteKelas = async (id: string, title: string) => {
    showConfirm(
      'Hapus Data Kelas',
      `Apakah Anda yakin ingin menghapus kelas ${title}?`,
      'warning',
      async () => {
        try {
          await masterService.deleteKelas(id);
          showToast(`Kelas ${title} berhasil dihapus.`, 'success');
          loadData();
        } catch (err: any) {
          showToast(err.message || 'Terjadi kesalahan sistem', 'error');
        }
      }
    );
  };

  // --- 4. CRUD Kitab ---
  const handleSaveKitab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKitabName.trim()) return;

    const payload = {
      name: formKitabName,
      description: formKitabFan,
      jenjangName: formKitabJenjang,
      tingkatName: formKitabTingkat,
      fanIlmu: formKitabFan,
      pengajar: formKitabPengajar || 'Belum diatur',
      waktu: formKitabWaktu || 'Belum diatur'
    };

    try {
      if (editingKitab) {
        await masterService.updateKitab(editingKitab.id, payload);
        showToast(`Jadwal kitab ${formKitabName} berhasil diperbarui.`, 'success');
      } else {
        await masterService.createKitab(payload);
        showToast(`Jadwal kitab baru ${formKitabName} berhasil ditambahkan.`, 'success');
      }
      setKitabModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem', 'error');
    }
  };

  const handleDeleteKitab = async (id: string, name: string) => {
    showConfirm(
      'Hapus Jadwal Kitab',
      `Apakah Anda yakin ingin menghapus jadwal pelajaran kitab ${name}?`,
      'warning',
      async () => {
        try {
          await masterService.deleteKitab(id);
          showToast(`Jadwal ${name} berhasil dihapus.`, 'success');
          loadData();
        } catch (err: any) {
          showToast(err.message || 'Terjadi kesalahan sistem', 'error');
        }
      }
    );
  };

  // Modal openers
  const openAddJenjang = () => {
    setEditingJenjang(null);
    setFormJenjangName('');
    setFormMundzirName('');
    setJenjangModalOpen(true);
  };

  const openEditJenjang = (item: JenjangItem) => {
    setEditingJenjang(item);
    setFormJenjangName(item.name);
    setFormMundzirName(item.mundzirName === 'Belum ditunjuk' ? '' : item.mundzirName);
    setJenjangModalOpen(true);
  };

  const openAddTingkat = () => {
    setEditingTingkat(null);
    setFormTingkatJenjang(jenjangList[0]?.name || '');
    setFormTingkatRoman('I');
    setFormMufatishName('');
    setFormTargetNadzom('');
    setFormTargetBait(0);
    setFormHasPraktek(false);
    setFormPraktekSubjects(['']);
    setTingkatModalOpen(true);
  };

  const openEditTingkat = (item: TingkatItem) => {
    setEditingTingkat(item);
    setFormTingkatJenjang(item.jenjangName);
    setFormTingkatRoman(item.romanName);
    setFormMufatishName(item.mufatishName === 'Belum ditunjuk' ? '' : item.mufatishName);
    setFormTargetNadzom(item.targetNadzom === 'Belum diatur' ? '' : item.targetNadzom);
    setFormTargetBait(item.targetBait);
    setFormHasPraktek(item.hasPraktek);
    setFormPraktekSubjects(
      Array.isArray(item.praktekSubjects) && item.praktekSubjects.length > 0
        ? item.praktekSubjects
        : ['']
    );
    setTingkatModalOpen(true);
  };

  const openAddKelas = () => {
    setEditingKelas(null);
    const defJenjang = jenjangList[0]?.name || '';
    setFormClassJenjang(defJenjang);
    const matchingTingkats = tingkatList.filter(t => t.jenjangName === defJenjang);
    setFormClassTingkat(matchingTingkats[0]?.romanName || '');
    setFormClassBagian('');
    setFormClassLokal('');
    setFormClassMustahiq('');
    setFormClassMunawwibs(['']);
    setClassModalOpen(true);
  };

  const openEditKelas = (item: KelasItem) => {
    setEditingKelas(item);
    setFormClassJenjang(item.jenjangName);
    setFormClassTingkat(item.tingkatName);
    setFormClassBagian(item.bagian);
    setFormClassLokal(item.lokal);
    setFormClassMustahiq(item.mustahiqName === 'Belum ditunjuk' ? '' : item.mustahiqName);
    setFormClassMunawwibs(
      Array.isArray(item.munawwibNames) && item.munawwibNames.length > 0
        ? item.munawwibNames.filter(x => x !== 'Belum ditunjuk')
        : ['']
    );
    setClassModalOpen(true);
  };

  const openAddKitab = () => {
    setEditingKitab(null);
    setFormKitabName('');
    const defJenjang = jenjangList[0]?.name || '';
    setFormKitabJenjang(defJenjang);
    const matchingTingkats = tingkatList.filter(t => t.jenjangName === defJenjang);
    setFormKitabTingkat(matchingTingkats[0]?.romanName || '');
    setFormKitabFan('Fiqh');
    setFormKitabPengajar('');
    setFormKitabWaktu('');
    setKitabModalOpen(true);
  };

  const openEditKitab = (item: KitabItem) => {
    setEditingKitab(item);
    setFormKitabName(item.name);
    setFormKitabJenjang(item.jenjangName);
    setFormKitabTingkat(item.tingkatName);
    setFormKitabFan(item.fanIlmu);
    setFormKitabPengajar(item.pengajar === 'Belum diatur' ? '' : item.pengajar);
    setFormKitabWaktu(item.waktu === 'Belum diatur' ? '' : item.waktu);
    setKitabModalOpen(true);
  };

  // Filters
  const filteredJenjang = jenjangList.filter(j => 
    j.name.toLowerCase().includes(searchJenjang.toLowerCase()) ||
    j.mundzirName.toLowerCase().includes(searchJenjang.toLowerCase())
  );

  const filteredTingkat = tingkatList.filter(t => 
    t.jenjangName.toLowerCase().includes(searchTingkat.toLowerCase()) ||
    t.romanName.toLowerCase().includes(searchTingkat.toLowerCase()) ||
    t.mufatishName.toLowerCase().includes(searchTingkat.toLowerCase()) ||
    t.targetNadzom.toLowerCase().includes(searchTingkat.toLowerCase())
  );

  const filteredKelas = classList.filter(c => 
    c.jenjangName.toLowerCase().includes(searchKelas.toLowerCase()) || 
    c.tingkatName.toLowerCase().includes(searchKelas.toLowerCase()) || 
    c.bagian.toLowerCase().includes(searchKelas.toLowerCase()) ||
    c.lokal.toLowerCase().includes(searchKelas.toLowerCase()) ||
    c.mustahiqName.toLowerCase().includes(searchKelas.toLowerCase()) ||
    (c.munawwibNames && c.munawwibNames.some(m => m.toLowerCase().includes(searchKelas.toLowerCase())))
  );

  const filteredKitab = kitabList.filter(k => 
    k.name.toLowerCase().includes(searchKitab.toLowerCase()) || 
    k.jenjangName.toLowerCase().includes(searchKitab.toLowerCase()) ||
    k.tingkatName.toLowerCase().includes(searchKitab.toLowerCase()) ||
    k.fanIlmu.toLowerCase().includes(searchKitab.toLowerCase()) ||
    k.pengajar.toLowerCase().includes(searchKitab.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Kurikulum & Kelas Pesantren</h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Manajemen Struktur: Jenjang (Mundzir) → Tingkat (Mufatish & Kurikulum) → Kelas (Bagian & Lokal) → Kitab & Jadwal.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('jenjang')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'jenjang' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-4 h-4" />
          1. Jenjang (Mundzir)
        </button>
        <button
          onClick={() => setActiveTab('tingkat')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'tingkat' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          2. Tingkat (Mufatish)
        </button>
        <button
          onClick={() => setActiveTab('kelas')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'kelas' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <School className="w-4 h-4" />
          3. Kelas (Bagian & Lokal)
        </button>
        <button
          onClick={() => setActiveTab('kitab')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'kitab' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          4. Kitab & Jadwal
        </button>
        <button
          onClick={() => setActiveTab('importexport')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'importexport'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          5. Import & Export
        </button>
      </div>

      {/* TAB 1: JENJANG (MUNDZIR) */}
      {activeTab === 'jenjang' && (
        <div className="space-y-4">
          <GlassCard variant="neumorph" className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <SoftInput
                placeholder="Cari Jenjang / Mundzir..."
                value={searchJenjang}
                onChange={(e) => setSearchJenjang(e.target.value)}
                leftIcon={<Search className="w-5 h-5 text-slate-400" />}
                className="w-full"
              />
            </div>
            <PremiumButton
              onClick={openAddJenjang}
              variant="primary"
              leftIcon={<Plus className="w-5 h-5" />}
              className="shadow-sm shrink-0"
            >
              Tambah Jenjang Baru
            </PremiumButton>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJenjang.map(item => {
              const studentCount = getStudentCountForJenjang(item.name);
              return (
                <GlassCard
                  key={item.id}
                  variant="neumorph"
                  className="p-8 border border-slate-200/60 bg-white/70 hover:scale-[1.01] hover:shadow-lg transition-all relative group overflow-hidden flex flex-col justify-between min-h-[180px]"
                >
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-blue-600 to-indigo-600" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-slate-800 text-lg uppercase tracking-wider flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-600" />
                        Jenjang {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditJenjang(item)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJenjang(item.id, item.name)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mundzir (Pimpinan)</span>
                        <span className="font-black text-slate-900 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/50">{item.mundzirName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-4 mt-4 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Jumlah Siswi Aktif</span>
                    <span className="font-black text-blue-600 text-lg tracking-wider">
                      {studentCount} <span className="text-[10px] text-slate-500 font-bold uppercase">Siswi</span>
                    </span>
                  </div>
                </GlassCard>
              );
            })}
            {filteredJenjang.length === 0 && (
              <div className="col-span-2 text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 italic text-xs">
                Belum ada data jenjang terdaftar
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TINGKAT (MUFATISH & TARGET) */}
      {activeTab === 'tingkat' && (
        <div className="space-y-4">
          <GlassCard variant="neumorph" className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <SoftInput
                placeholder="Cari Tingkat, Jenjang, Mufatish..."
                value={searchTingkat}
                onChange={(e) => setSearchTingkat(e.target.value)}
                leftIcon={<Search className="w-5 h-5 text-slate-400" />}
                className="w-full"
              />
            </div>
            <PremiumButton
              onClick={openAddTingkat}
              variant="primary"
              leftIcon={<Plus className="w-5 h-5" />}
              className="shadow-sm shrink-0"
              disabled={jenjangList.length === 0}
            >
              Tambah Tingkat Baru
            </PremiumButton>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTingkat.map(item => (
              <GlassCard key={item.id} variant="neumorph" className="p-5 border border-slate-100 bg-white/70 relative">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 mb-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-black uppercase text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                      {item.jenjangName} - Tingkat {item.romanName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditTingkat(item)}
                      className="p-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTingkat(item.id, item.jenjangName, item.romanName)}
                      className="p-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Mufatish (Pengawas Tingkat)</span>
                    <span className="font-extrabold text-slate-900">{item.mufatishName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Target Nadzom</span>
                    <span className="font-extrabold text-slate-800">
                      {item.targetNadzom} ({item.targetBait} Bait)
                    </span>
                  </div>

                  <div className="border-t border-slate-200/50 pt-2 mt-2">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5 mb-1">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Ujian Praktek Akhir Jenjang:
                    </span>
                    {isIdadiyah(item.jenjangName) ? (
                      <span className="text-[10px] text-slate-400 italic">Dikecualikan (I'dadiyah tidak ada praktek)</span>
                    ) : !isFinalTingkat(item.jenjangName, item.romanName) ? (
                      <span className="text-[10px] text-slate-400 italic">Hanya berlaku di akhir tingkatan ({item.jenjangName.includes("Ibtida") ? "VI" : "III"})</span>
                    ) : item.hasPraktek && item.praktekSubjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.praktekSubjects.map((sub, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {sub}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Belum diatur / Tidak diaktifkan</span>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
            {filteredTingkat.length === 0 && (
              <div className="col-span-2 text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 italic text-xs">
                Belum ada data tingkat terdaftar
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KELAS (BAGIAN & LOKAL) */}
      {activeTab === 'kelas' && (
        <div className="space-y-4">
          <GlassCard variant="neumorph" className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <SoftInput
                placeholder="Cari Kelas, Jenjang, Lokal, Mustahiq..."
                value={searchKelas}
                onChange={(e) => setSearchKelas(e.target.value)}
                leftIcon={<Search className="w-5 h-5 text-slate-400" />}
                className="w-full"
              />
            </div>
            <PremiumButton
              onClick={openAddKelas}
              variant="primary"
              leftIcon={<Plus className="w-5 h-5" />}
              className="shadow-sm shrink-0"
              disabled={tingkatList.length === 0}
            >
              Tambah Kelas Baru
            </PremiumButton>
          </GlassCard>

          {tingkatList.length === 0 && (
            <div className="bg-amber-50 text-amber-800 text-xs p-4 rounded-xl border border-amber-100 font-bold">
              Peringatan: Silakan buat tingkatan kelas (Tab 2) terlebih dahulu agar dropdown kelas pengajar dapat terisi.
            </div>
          )}

          <GlassCard variant="neumorph" className="overflow-hidden border border-slate-200/50">
          <Table>
            <Thead>
              <Tr>
                <Th>Nama Kelas (Bagian)</Th>
                <Th>Lokal (Ruangan)</Th>
                <Th>Mustahiq Utama</Th>
                <Th>Munawwib (Piket)</Th>
                <Th className="text-right">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
                  {filteredKelas.map(item => {
                    const title = `${item.jenjangName} ${item.tingkatName} - Bagian ${item.bagian}`;
                    return (
                      <Tr key={item.id}>
                        <Td className="font-extrabold text-slate-900">{title}</Td>
                        <Td className="font-bold text-slate-500">{item.lokal}</Td>
                        <Td className="text-slate-900 font-extrabold">{item.mustahiqName}</Td>
                        <Td>
                          {item.munawwibNames && item.munawwibNames.filter(Boolean).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.munawwibNames.map((mun, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[9px]">
                                  {mun}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Belum ditunjuk</span>
                          )}
                        </Td>
                        <Td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditKelas(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKelas(item.id, title)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                  {filteredKelas.length === 0 && (
                    <Tr>
                      <Td colSpan={5} className="text-center py-10 text-slate-400 italic">Belum ada data kelas terdaftar</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: KITAB & JADWAL */}
      {activeTab === 'kitab' && (
        <div className="space-y-4">
          <GlassCard variant="neumorph" className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <SoftInput
                placeholder="Cari Kitab, Jenjang, Tingkat, Pengajar..."
                value={searchKitab}
                onChange={(e) => setSearchKitab(e.target.value)}
                leftIcon={<Search className="w-5 h-5 text-slate-400" />}
                className="w-full"
              />
            </div>
            <PremiumButton
              onClick={openAddKitab}
              variant="primary"
              leftIcon={<Plus className="w-5 h-5" />}
              className="shadow-sm shrink-0"
              disabled={tingkatList.length === 0}
            >
              Tambah Jadwal Kitab
            </PremiumButton>
          </GlassCard>

          <GlassCard variant="neumorph" className="overflow-hidden border border-slate-200/50">
            <Table>
              <Thead>
                <Tr>
                  <Th>Nama Kitab / Pelajaran</Th>
                  <Th>Tingkatan</Th>
                  <Th>Fan Ilmu</Th>
                  <Th>Pengajar / Mustahiq</Th>
                  <Th>Waktu / Jadwal</Th>
                  <Th className="text-right">Aksi</Th>
                </Tr>
              </Thead>
              <Tbody>
                  {filteredKitab.map(item => (
                    <Tr key={item.id}>
                      <Td className="flex items-center gap-2">
                        <BookMarked className="w-4 h-4 text-blue-600" />
                        {item.name}
                      </Td>
                      <Td>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
                          {item.jenjangName} Kelas {item.tingkatName}
                        </span>
                      </Td>
                      <Td>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-600 text-[10px] font-black uppercase">
                          {item.fanIlmu}
                        </span>
                      </Td>
                      <Td className="font-extrabold text-slate-800">
                        {item.pengajar}
                      </Td>
                      <Td className="font-bold text-blue-600">
                        {item.waktu}
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditKitab(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteKitab(item.id, item.name)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                  {filteredKitab.length === 0 && (
                    <Tr>
                      <Td colSpan={6} className="text-center py-10 text-slate-400 italic">Belum ada jadwal kitab terdaftar</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
          </GlassCard>
        </div>
      )}

      {/* MODAL: JENJANG */}
      <Modal
        isOpen={jenjangModalOpen}
        onClose={() => setJenjangModalOpen(false)}
        title={editingJenjang ? 'Edit Nama Jenjang' : 'Tambah Jenjang Baru'}
        maxWidthClass="max-w-md"
        onSubmit={handleSaveJenjang}
        footer={
          <>
            <PremiumButton type="button" variant="secondary" onClick={() => setJenjangModalOpen(false)}>
              Batal
            </PremiumButton>
            <PremiumButton type="submit" variant="primary" rightIcon={<Save className="w-5 h-5" />}>
              Simpan Jenjang
            </PremiumButton>
          </>
        }
      >
        <SoftInput
          label="Nama Jenjang (Tingkatan)"
          value={formJenjangName}
          onChange={(e) => setFormJenjangName(e.target.value)}
          placeholder="Contoh: Ibtida'iyyah, Tsanawiyah..."
          required
        />

        <SoftInput
          label="Nama Mundzir (Pimpinan Jenjang)"
          value={formMundzirName}
          onChange={(e) => setFormMundzirName(e.target.value)}
          placeholder="Nama Kyai / Pimpinan pengawas jenjang..."
          required
        />
      </Modal>

      {/* MODAL: TINGKAT */}
      <Modal
        isOpen={tingkatModalOpen}
        onClose={() => setTingkatModalOpen(false)}
        title={editingTingkat ? 'Edit Data Tingkat' : 'Tambah Tingkat Baru'}
        maxWidthClass="max-w-md"
        onSubmit={handleSaveTingkat}
        footer={
          <>
            <PremiumButton type="button" variant="secondary" onClick={() => setTingkatModalOpen(false)}>
              Batal
            </PremiumButton>
            <PremiumButton type="submit" variant="primary" rightIcon={<Save className="w-5 h-5" />}>
              Simpan Tingkat
            </PremiumButton>
          </>
        }
      >
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Jenjang Belajar (Dari Tab 1)</span>
          <select
            value={formTingkatJenjang}
            onChange={(e) => setFormTingkatJenjang(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
            required
          >
            {jenjangList.map(j => (
              <option key={j.id} value={j.name}>{j.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Tingkat Kelas (Angka Romawi)</span>
          <select
            value={formTingkatRoman}
            onChange={(e) => setFormTingkatRoman(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
            required
          >
            <option value="I">I (Satu)</option>
            <option value="II">II (Dua)</option>
            <option value="III">III (Tiga)</option>
            <option value="IV">IV (Empat)</option>
            <option value="V">V (Lima)</option>
            <option value="VI">VI (Enam)</option>
          </select>
        </div>

        <SoftInput
          label="Nama Mufatish (Pengawas Tingkat)"
          value={formMufatishName}
          onChange={(e) => setFormMufatishName(e.target.value)}
          placeholder="Nama Ustadzah pengawas tingkat kelas..."
          required
        />

        <SoftInput
          label="Nama Target Kitab / Nadzom"
          value={formTargetNadzom}
          onChange={(e) => setFormTargetNadzom(e.target.value)}
          placeholder="Contoh: Alfiyah, Imrithi..."
        />

        <SoftInput
          label="Jumlah Target Bait (Bait)"
          type="number"
          value={formTargetBait.toString()}
          onChange={(e) => setFormTargetBait(Number(e.target.value) || 0)}
          placeholder="Contoh: 500"
        />

        {/* Ujian Praktek settings if this is a final class of a valid jenjang */}
        {isFinalTingkat(formTingkatJenjang, formTingkatRoman) && (
          <div className="border-t border-slate-200 pt-3 mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Ujian Praktek Akhir Jenjang</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={formHasPraktek} 
                  onChange={(e) => setFormHasPraktek(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {formHasPraktek && (
              <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase">Materi Ujian Praktek</span>
                {formPraktekSubjects.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <SoftInput
                      value={sub}
                      onChange={(e) => {
                        const updated = [...formPraktekSubjects];
                        updated[idx] = e.target.value;
                        setFormPraktekSubjects(updated);
                      }}
                      placeholder={`Materi ke-${idx + 1}...`}
                      className="w-full"
                    />
                    {formPraktekSubjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormPraktekSubjects(formPraktekSubjects.filter((_, i) => i !== idx));
                        }}
                        className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormPraktekSubjects([...formPraktekSubjects, ''])}
                  className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1 w-max"
                >
                  <Plus className="w-3 h-3" />
                  Tambah Materi Praktek
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL: KELAS */}
      <Modal
        isOpen={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        title={editingKelas ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
        maxWidthClass="max-w-md"
        onSubmit={handleSaveKelas}
        footer={
          <>
            <PremiumButton type="button" variant="secondary" onClick={() => setClassModalOpen(false)}>
              Batal
            </PremiumButton>
            <PremiumButton type="submit" variant="primary" rightIcon={<Save className="w-5 h-5" />}>
              Simpan Kelas
            </PremiumButton>
          </>
        }
      >
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Jenjang Belajar (Dropdown)</span>
          <select
            value={formClassJenjang}
            onChange={(e) => setFormClassJenjang(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
            required
          >
            {jenjangList.map(j => (
              <option key={j.id} value={j.name}>{j.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Tingkat Kelas (Dropdown)</span>
          <select
            value={formClassTingkat}
            onChange={(e) => setFormClassTingkat(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
            required
          >
            {tingkatList.filter(t => t.jenjangName === formClassJenjang).map(t => (
              <option key={t.id} value={t.romanName}>Tingkat {t.romanName}</option>
            ))}
            {tingkatList.filter(t => t.jenjangName === formClassJenjang).length === 0 && (
              <option value="">Belum ada tingkatan diatur</option>
            )}
          </select>
        </div>

        <SoftInput
          label="Bagian Kelas (Paralel)"
          value={formClassBagian}
          onChange={(e) => setFormClassBagian(e.target.value)}
          placeholder="Contoh: A, B, C..."
          required
        />

        <SoftInput
          label="Lokal (Ruangan Kelas)"
          value={formClassLokal}
          onChange={(e) => setFormClassLokal(e.target.value)}
          placeholder="Contoh: Lokal 1, Lokal 2, Asrama..."
          required
        />

        <SoftInput
          label="Nama Mustahiq (Guru Utama)"
          value={formClassMustahiq}
          onChange={(e) => setFormClassMustahiq(e.target.value)}
          placeholder="Nama Ustadzah pengampu utama..."
        />

        {/* Dynamic Multiple Munawwib List */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Nama Munawwib (Guru Pendamping / Piket)</span>
          <div className="space-y-2">
            {formClassMunawwibs.map((mun, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <SoftInput
                  value={mun}
                  onChange={(e) => {
                    const updated = [...formClassMunawwibs];
                    updated[idx] = e.target.value;
                    setFormClassMunawwibs(updated);
                  }}
                  placeholder={`Nama Munawwib ke-${idx + 1}...`}
                  className="w-full"
                />
                {formClassMunawwibs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormClassMunawwibs(formClassMunawwibs.filter((_, i) => i !== idx));
                    }}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFormClassMunawwibs([...formClassMunawwibs, ''])}
            className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1.5 w-max"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Munawwib
          </button>
        </div>
      </Modal>

      {/* MODAL: REFERENSI KITAB */}
      <Modal
        isOpen={kitabModalOpen}
        onClose={() => setKitabModalOpen(false)}
        title={editingKitab ? 'Edit Jadwal & Kitab' : 'Tambah Jadwal Kitab'}
        maxWidthClass="max-w-md"
        onSubmit={handleSaveKitab}
        footer={
          <>
            <PremiumButton type="button" variant="secondary" onClick={() => setKitabModalOpen(false)}>
              Batal
            </PremiumButton>
            <PremiumButton type="submit" variant="primary" rightIcon={<Save className="w-5 h-5" />}>
              Simpan Jadwal
            </PremiumButton>
          </>
        }
      >
        <SoftInput
          label="Nama Kitab/Pelajaran"
          value={formKitabName}
          onChange={(e) => setFormKitabName(e.target.value)}
          placeholder="Contoh: Fathul Qorib, Imrithi..."
          required
        />

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Jenjang Belajar (Dropdown)</span>
          <select
            value={formKitabJenjang}
            onChange={(e) => setFormKitabJenjang(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
            required
          >
            {jenjangList.map(j => (
              <option key={j.id} value={j.name}>{j.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Tingkat Kelas (Dropdown)</span>
          <select
            value={formKitabTingkat}
            onChange={(e) => setFormKitabTingkat(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
            required
          >
            {tingkatList.filter(t => t.jenjangName === formKitabJenjang).map(t => (
              <option key={t.id} value={t.romanName}>Tingkat {t.romanName}</option>
            ))}
            {tingkatList.filter(t => t.jenjangName === formKitabJenjang).length === 0 && (
              <option value="">Belum ada tingkatan diatur</option>
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Fan Ilmu</span>
          <select
            value={formKitabFan}
            onChange={(e) => setFormKitabFan(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
          >
            {FAN_ILMU_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <SoftInput
          label="Nama Pengajar / Mustahiq"
          value={formKitabPengajar}
          onChange={(e) => setFormKitabPengajar(e.target.value)}
          placeholder="Nama Ustadzah pengampu mata pelajaran..."
          required
        />

        <SoftInput
          label="Waktu / Jadwal Belajar"
          value={formKitabWaktu}
          onChange={(e) => setFormKitabWaktu(e.target.value)}
          placeholder="Contoh: Senin, 07:30 - 09:00..."
          required
        />
      </Modal>

      {/* TAB 5: IMPORT & EXPORT */}
      {activeTab === 'importexport' && (() => {
        const booleanToYT = (val: boolean) => (val ? 'Y' : 'T');
        const ytToBoolean = (val: string) => {
          if (!val) return false;
          const clean = val.toString().trim().toUpperCase();
          return clean === 'Y' || clean === 'YES' || clean === 'YA' || clean === 'TRUE';
        };

        const handleDownloadTemplate = async () => {
          try {
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            workbook.creator = "Mubtadi'at System";
            workbook.lastModifiedBy = 'Admin';
            workbook.created = new Date();

            const HEADER_BG = 'FF1E3A8A';
            const HEADER_FG = 'FFFFFFFF';
            const BORDER_COLOR = { argb: 'FF3B82F6' };
            const PROTECTION_PW = 'mubtadiat-template';

            type ColDef = { header: string; key: string; width: number; note: string };

            const buildSheet = async (
              name: string,
              columns: ColDef[],
              sampleRows: Record<string, string | number>[]
            ) => {
              const ws = workbook.addWorksheet(name);
              await ws.protect(PROTECTION_PW, { selectLockedCells: true, selectUnlockedCells: true, insertRows: true, deleteRows: true, sort: true });

              ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width }));

              // Style + protect header row
              ws.getRow(1).eachCell((cell, colNum) => {
                cell.font = { bold: true, color: { argb: HEADER_FG }, size: 10 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = {
                  top: { style: 'thin', color: BORDER_COLOR },
                  left: { style: 'thin', color: BORDER_COLOR },
                  bottom: { style: 'medium', color: { argb: HEADER_BG } },
                  right: { style: 'thin', color: BORDER_COLOR },
                };
                cell.protection = { locked: 'True' as unknown as boolean };
                // Attach column note/comment
                const colDef = columns[colNum - 1];
                if (colDef?.note) {
                  cell.note = {
                    texts: [
                      { font: { bold: true, size: 10, color: { argb: HEADER_BG } }, text: `📌 ${colDef.header}\n` },
                      { font: { size: 9, bold: false }, text: colDef.note },
                    ],
                    protection: { locked: 'True' },
                    editAs: 'oneCells',
                  };
                }
              });
              ws.getRow(1).height = 30;

              // Add sample rows (unlocked)
              sampleRows.forEach((rowData) => {
                const row = ws.addRow(rowData);
                row.eachCell({ includeEmpty: true }, (cell) => {
                  cell.protection = { locked: 'False' as unknown as boolean };
                  cell.font = { color: { argb: 'FF64748B' }, italic: true, size: 9 };
                });
              });

              // Unlock all future blank rows
              for (let r = sampleRows.length + 2; r <= 200; r++) {
                ws.getRow(r).eachCell({ includeEmpty: true }, (cell) => {
                  cell.protection = { locked: 'False' as unknown as boolean };
                });
              }
            };

            await buildSheet('Jenjang', [
              { header: 'Nama Jenjang', key: 'Nama Jenjang', width: 22, note: 'Tipe: Teks | Wajib: Ya\nPilihan resmi:\n- I\'dadiyah\n- Ibtida\'iyyah\n- Tsanawiyah\n- Aliyah\nContoh: Ibtida\'iyyah' },
              { header: 'Nama Mundzir', key: 'Nama Mundzir', width: 30, note: 'Tipe: Teks | Wajib: Ya\nNama lengkap pengasuh/mundzir jenjang.\nContoh: KH. Anwar Manshur' },
            ], [
              { 'Nama Jenjang': "I'dadiyah", 'Nama Mundzir': 'KH. Anwar Manshur' },
              { 'Nama Jenjang': "Ibtida'iyyah", 'Nama Mundzir': 'KH. Abdullah Kafabihi Mahrus' },
            ]);

            await buildSheet('Tingkat', [
              { header: 'Jenjang', key: 'Jenjang', width: 22, note: 'Tipe: Teks | Wajib: Ya\nHarus sama persis dengan Nama Jenjang di sheet Jenjang.\nContoh: Ibtida\'iyyah' },
              { header: 'Tingkat (Roman)', key: 'Tingkat (Roman)', width: 18, note: 'Tipe: Teks | Wajib: Ya\nAngka romawi sesuai jenjang:\n- I\'dadiyah: I, II, III\n- Ibtida\'iyyah: I, II, III, IV, V, VI\n- Tsanawiyah/Aliyah: I, II, III\nContoh: VI' },
              { header: 'Nama Mufatish', key: 'Nama Mufatish', width: 28, note: 'Tipe: Teks | Wajib: Ya\nNama ustadzah penanggung jawab tingkat ini.\nContoh: Ustadzah Halimah' },
              { header: 'Target Nadzom', key: 'Target Nadzom', width: 24, note: 'Tipe: Teks | Wajib: Opsional\nNama kitab/nadzom target hafalan tingkat ini.\nContoh: Al-Imrithi' },
              { header: 'Jumlah Target Bait', key: 'Jumlah Target Bait', width: 20, note: 'Tipe: Angka | Wajib: Opsional\nJumlah bait nadzom yang harus dikuasai.\nContoh: 254' },
              { header: 'Ada Ujian Praktek (Y/T)', key: 'Ada Ujian Praktek (Y/T)', width: 24, note: 'Tipe: Y atau T | Wajib: Ya\nY = Ada ujian praktek\nT = Tidak ada ujian praktek\nCatatan: Otomatis Y untuk tingkat VI (Ibtida\'iyyah) dan III (Tsanawiyah/Aliyah).\nContoh: Y' },
              { header: 'Materi Ujian Praktek (Pisahkan dengan Koma)', key: 'Materi Ujian Praktek (Pisahkan dengan Koma)', width: 42, note: 'Tipe: Teks | Wajib: Jika Ada Ujian=Y\nDaftar materi praktek, pisahkan dengan koma.\nContoh: Praktek Wudhu & Shalat, Praktek Fardhu Kifayah' },
            ], [
              { 'Jenjang': "Ibtida'iyyah", 'Tingkat (Roman)': 'VI', 'Nama Mufatish': 'Ustadzah Halimah', 'Target Nadzom': 'Al-Imrithi', 'Jumlah Target Bait': 254, 'Ada Ujian Praktek (Y/T)': 'Y', 'Materi Ujian Praktek (Pisahkan dengan Koma)': 'Praktek Wudhu & Shalat, Praktek Fardhu Kifayah' },
            ]);

            await buildSheet('Kelas', [
              { header: 'Jenjang', key: 'Jenjang', width: 22, note: 'Tipe: Teks | Wajib: Ya\nHarus sama persis dengan Nama Jenjang di sheet Jenjang.\nContoh: Ibtida\'iyyah' },
              { header: 'Tingkat', key: 'Tingkat', width: 16, note: 'Tipe: Teks | Wajib: Ya\nHarus sama persis dengan kolom Tingkat (Roman) di sheet Tingkat.\nContoh: VI' },
              { header: 'Bagian Kelas', key: 'Bagian Kelas', width: 16, note: 'Tipe: Teks | Wajib: Ya\nHuruf besar A-Z sebagai penanda bagian kelas.\nContoh: A' },
              { header: 'Lokal', key: 'Lokal', width: 22, note: 'Tipe: Teks | Wajib: Ya\nNama/nomor ruangan lokal belajar.\nContoh: Lokal 1' },
              { header: 'Mustahiq Utama', key: 'Mustahiq Utama', width: 28, note: 'Tipe: Teks | Wajib: Ya\nNama ustadzah mustahiq yang bertanggung jawab di kelas ini.\nContoh: Charis Wahyudi' },
              { header: 'Nama Munawwib (Pisahkan dengan Koma)', key: 'Nama Munawwib (Pisahkan dengan Koma)', width: 40, note: 'Tipe: Teks | Wajib: Opsional\nSatu atau lebih nama munawwib, pisahkan dengan koma jika lebih dari satu.\nContoh: Aisyah Humaira, Zulaikha' },
            ], [
              { 'Jenjang': "Ibtida'iyyah", 'Tingkat': 'VI', 'Bagian Kelas': 'A', 'Lokal': 'Lokal 1', 'Mustahiq Utama': 'Charis Wahyudi', 'Nama Munawwib (Pisahkan dengan Koma)': 'Aisyah Humaira, Zulaikha' },
            ]);

            await buildSheet('Kitab', [
              { header: 'Nama Kitab/Pelajaran', key: 'Nama Kitab/Pelajaran', width: 30, note: 'Tipe: Teks | Wajib: Ya\nNama kitab atau mata pelajaran.\nContoh: Fathul Qorib' },
              { header: 'Jenjang', key: 'Jenjang', width: 22, note: 'Tipe: Teks | Wajib: Ya\nHarus sama persis dengan Nama Jenjang di sheet Jenjang.\nContoh: Tsanawiyah' },
              { header: 'Tingkat', key: 'Tingkat', width: 16, note: 'Tipe: Teks | Wajib: Ya\nHarus sama persis dengan kolom Tingkat (Roman) di sheet Tingkat.\nContoh: III' },
              { header: 'Fan Ilmu', key: 'Fan Ilmu', width: 20, note: 'Tipe: Teks | Wajib: Ya\nPilihan fan ilmu:\nFiqh, Nahwu, Shorof, Tauhid, Tafsir, Hadits, Akhlaq, Tarikh, Tajwid\nContoh: Fiqh' },
              { header: 'Pengajar', key: 'Pengajar', width: 28, note: 'Tipe: Teks | Wajib: Ya\nNama ustadzah pengajar kitab ini.\nContoh: Ustadzah Fatimah' },
              { header: 'Waktu / Jadwal', key: 'Waktu / Jadwal', width: 30, note: 'Tipe: Teks | Wajib: Ya\nJadwal mengajar dalam format teks bebas.\nContoh: Senin, 07:30 - 09:00' },
            ], [
              { 'Nama Kitab/Pelajaran': 'Fathul Qorib', 'Jenjang': 'Tsanawiyah', 'Tingkat': 'III', 'Fan Ilmu': 'Fiqh', 'Pengajar': 'Ustadzah Fatimah', 'Waktu / Jadwal': 'Senin, 07:30 - 09:00' },
            ]);

            // Write to buffer and trigger download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Template_Jadwal_Kurikulum_Mubtadiat.xlsx';
            a.click();
            URL.revokeObjectURL(url);

            showToast('Template Excel berhasil diunduh — header terkunci & ada panduan di setiap kolom.', 'success');
          } catch (err) {
            console.error('Template download error:', err);
            showToast('Gagal mengunduh template.', 'error');
          }
        };

        const handleExportDatabase = async () => {
          try {
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            workbook.creator = "Mubtadi'at System";
            workbook.lastModifiedBy = 'Admin';
            workbook.created = new Date();

            const jenjangs = JSON.parse(localStorage.getItem(MOCK_JENJANG_KEY) || '[]');
            const tingkats = JSON.parse(localStorage.getItem(MOCK_TINGKAT_KEY) || '[]');
            const classes = JSON.parse(localStorage.getItem(MOCK_CLASSES_KEY) || '[]');
            const kitabs = JSON.parse(localStorage.getItem(MOCK_KITABS_KEY) || '[]');

            if (!jenjangs.length && !tingkats.length && !classes.length && !kitabs.length) {
              showToast('Tidak ada data akademik untuk diexport.', 'warning');
              return;
            }

            const styleHeader = (ws: any) => {
              ws.getRow(1).eachCell((cell: any) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
              });
              ws.getRow(1).height = 25;
            };

            // 1. Jenjang
            const wsJenjang = workbook.addWorksheet('Jenjang');
            wsJenjang.columns = [
              { header: 'Nama Jenjang', key: 'name', width: 25 },
              { header: 'Nama Mundzir', key: 'mundzirName', width: 30 }
            ];
            jenjangs.forEach((j: any) => {
              wsJenjang.addRow({ name: j.name, mundzirName: j.mundzirName });
            });
            styleHeader(wsJenjang);

            // 2. Tingkat
            const wsTingkat = workbook.addWorksheet('Tingkat');
            wsTingkat.columns = [
              { header: 'Jenjang', key: 'jenjangName', width: 25 },
              { header: 'Tingkat (Roman)', key: 'romanName', width: 20 },
              { header: 'Nama Mufatish', key: 'mufatishName', width: 30 },
              { header: 'Target Nadzom', key: 'targetNadzom', width: 25 },
              { header: 'Jumlah Target Bait', key: 'targetBait', width: 20 },
              { header: 'Ada Ujian Praktek (Y/T)', key: 'hasPraktek', width: 25 },
              { header: 'Materi Ujian Praktek (Pisahkan dengan Koma)', key: 'praktekSubjects', width: 45 }
            ];
            tingkats.forEach((t: any) => {
              wsTingkat.addRow({
                jenjangName: t.jenjangName,
                romanName: t.romanName,
                mufatishName: t.mufatishName,
                targetNadzom: t.targetNadzom,
                targetBait: t.targetBait,
                hasPraktek: booleanToYT(t.hasPraktek),
                praktekSubjects: Array.isArray(t.praktekSubjects) ? t.praktekSubjects.join(', ') : ''
              });
            });
            styleHeader(wsTingkat);

            // 3. Kelas
            const wsKelas = workbook.addWorksheet('Kelas');
            wsKelas.columns = [
              { header: 'Jenjang', key: 'jenjangName', width: 25 },
              { header: 'Tingkat', key: 'tingkatName', width: 20 },
              { header: 'Bagian Kelas', key: 'bagian', width: 20 },
              { header: 'Lokal', key: 'lokal', width: 20 },
              { header: 'Mustahiq Utama', key: 'mustahiqName', width: 30 },
              { header: 'Nama Munawwib (Pisahkan dengan Koma)', key: 'munawwibNames', width: 45 }
            ];
            classes.forEach((c: any) => {
              wsKelas.addRow({
                jenjangName: c.jenjangName,
                tingkatName: c.tingkatName,
                bagian: c.bagian,
                lokal: c.lokal,
                mustahiqName: c.mustahiqName,
                munawwibNames: Array.isArray(c.munawwibNames) ? c.munawwibNames.join(', ') : ''
              });
            });
            styleHeader(wsKelas);

            // 4. Kitab
            const wsKitab = workbook.addWorksheet('Kitab');
            wsKitab.columns = [
              { header: 'Nama Kitab/Pelajaran', key: 'name', width: 30 },
              { header: 'Jenjang', key: 'jenjangName', width: 25 },
              { header: 'Tingkat', key: 'tingkatName', width: 20 },
              { header: 'Fan Ilmu', key: 'fanIlmu', width: 20 },
              { header: 'Pengajar', key: 'pengajar', width: 30 },
              { header: 'Waktu / Jadwal', key: 'waktu', width: 30 }
            ];
            kitabs.forEach((k: any) => {
              wsKitab.addRow({
                name: k.name,
                jenjangName: k.jenjangName,
                tingkatName: k.tingkatName,
                fanIlmu: k.fanIlmu,
                pengajar: k.pengajar,
                waktu: k.waktu
              });
            });
            styleHeader(wsKitab);

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Export_Akademik_Mubtadiat_${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showToast('Database akademik berhasil diexport dengan format standar.', 'success');
          } catch (err) {
            console.error('Export error:', err);
            showToast('Gagal melakukan export data.', 'error');
          }
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setImportSummary(null);
          }
        };

        const handleImportSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!selectedFile) return;
          showConfirm(
            'Import Data Akademik',
            'Mengimport file ini akan menimpa seluruh konfigurasi Jenjang, Tingkat, Kelas, dan Kitab saat ini. Anda yakin?',
            () => {
              setIsProcessing(true);
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const data = new Uint8Array(event.target?.result as ArrayBuffer);
                  const workbook = XLSX.read(data, { type: 'array' });

                  let importedJenjangs: any[] = [];
                  if (workbook.SheetNames.includes('Jenjang')) {
                    const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Jenjang']);
                    importedJenjangs = rows.map((row, i) => ({ id: `jenjang_imp_${Date.now()}_${i}`, name: row['Nama Jenjang'] || 'Tanpa Nama', mundzirName: row['Nama Mundzir'] || 'Belum ditunjuk' }));
                  }

                  let importedTingkats: any[] = [];
                  if (workbook.SheetNames.includes('Tingkat')) {
                    const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Tingkat']);
                    importedTingkats = rows.map((row, i) => {
                      const praktekList = (row['Materi Ujian Praktek (Pisahkan dengan Koma)'] || '').split(',').map((x: string) => x.trim()).filter(Boolean);
                      return { id: `tingkat_imp_${Date.now()}_${i}`, jenjangName: row['Jenjang'] || '', romanName: String(row['Tingkat (Roman)'] || 'I'), mufatishName: row['Nama Mufatish'] || 'Belum ditunjuk', targetNadzom: row['Target Nadzom'] || 'Belum diatur', targetBait: Number(row['Jumlah Target Bait']) || 0, hasPraktek: ytToBoolean(row['Ada Ujian Praktek (Y/T)']), praktekSubjects: praktekList };
                    });
                  }

                  let importedClasses: any[] = [];
                  if (workbook.SheetNames.includes('Kelas')) {
                    const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Kelas']);
                    importedClasses = rows.map((row, i) => {
                      const munList = (row['Nama Munawwib (Pisahkan dengan Koma)'] || '').split(',').map((x: string) => x.trim()).filter(Boolean);
                      return { id: `kelas_imp_${Date.now()}_${i}`, jenjangName: row['Jenjang'] || '', tingkatName: String(row['Tingkat'] || 'I'), bagian: String(row['Bagian Kelas'] || 'A').toUpperCase(), lokal: row['Lokal'] || 'Belum diatur', mustahiqName: row['Mustahiq Utama'] || 'Belum ditunjuk', munawwibNames: munList.length > 0 ? munList : ['Belum ditunjuk'] };
                    });
                  }

                  let importedKitabs: any[] = [];
                  if (workbook.SheetNames.includes('Kitab')) {
                    const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets['Kitab']);
                    importedKitabs = rows.map((row, i) => ({ id: `kitab_imp_${Date.now()}_${i}`, name: row['Nama Kitab/Pelajaran'] || 'Tanpa Nama', jenjangName: row['Jenjang'] || '', tingkatName: String(row['Tingkat'] || 'I'), fanIlmu: row['Fan Ilmu'] || 'Fiqh', pengajar: row['Pengajar'] || 'Belum diatur', waktu: row['Waktu / Jadwal'] || 'Belum diatur' }));
                  }

                  localStorage.setItem(MOCK_JENJANG_KEY, JSON.stringify(importedJenjangs));
                  localStorage.setItem(MOCK_TINGKAT_KEY, JSON.stringify(importedTingkats));
                  localStorage.setItem(MOCK_CLASSES_KEY, JSON.stringify(importedClasses));
                  localStorage.setItem(MOCK_KITABS_KEY, JSON.stringify(importedKitabs));

                  setJenjangList(importedJenjangs);
                  setTingkatList(importedTingkats);
                  setClassList(importedClasses);
                  setKitabList(importedKitabs);

                  setImportSummary({ jenjang: importedJenjangs.length, tingkat: importedTingkats.length, kelas: importedClasses.length, kitab: importedKitabs.length });
                  showToast('Seluruh data akademik berhasil diimport!', 'success');
                  setSelectedFile(null);
                } catch {
                  showToast('Gagal memproses file. Periksa format file Anda.', 'error');
                } finally {
                  setIsProcessing(false);
                }
              };
              reader.readAsArrayBuffer(selectedFile);
            }
          );
        };

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card: Import */}
              <GlassCard variant="neumorph" className="p-6 border border-slate-200/50 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase">Unggah Berkas Akademik</h3>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Unggah berkas template Excel yang sudah diisi</p>
                  </div>
                </div>

                <form onSubmit={handleImportSubmit} className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400/70 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-white/40 group">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="space-y-2 pointer-events-none">
                      <FileUp className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors mx-auto" />
                      <div className="text-xs text-slate-600 font-bold">
                        {selectedFile
                          ? <span className="text-blue-600 font-black">{selectedFile.name}</span>
                          : <span>Pilih berkas atau seret kemari</span>
                        }
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">Mendukung format .xlsx / .xls</p>
                    </div>
                  </div>

                  <PremiumButton type="submit" variant="primary" className="w-full shadow-md" disabled={!selectedFile || isProcessing}>
                    {isProcessing
                      ? <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" />Memproses...</span>
                      : 'Mulai Import Data'
                    }
                  </PremiumButton>
                </form>

                {importSummary && (
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 space-y-2">
                    <h4 className="text-xs font-black uppercase flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Berhasil Mengimport:
                    </h4>
                    <ul className="text-[11px] font-bold space-y-1 pl-5 list-disc">
                      <li>{importSummary.jenjang} Jenjang (Mundzir)</li>
                      <li>{importSummary.tingkat} Tingkat (Mufatish & Kurikulum)</li>
                      <li>{importSummary.kelas} Ruang Kelas</li>
                      <li>{importSummary.kitab} Referensi Kitab & Jadwal</li>
                    </ul>
                  </div>
                )}
              </GlassCard>

              {/* Card: Export & Template */}
              <GlassCard variant="neumorph" className="p-6 border border-slate-200/50 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase">Ekspor & Templat Excel</h3>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Kelola data secara offline via spreadsheet</p>
                  </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-100/80 rounded-2xl p-4 text-xs font-bold text-blue-800 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span className="uppercase text-[10px] font-black">Petunjuk Penting</span>
                  </div>
                  <p className="text-[10px] leading-relaxed font-semibold text-blue-900/80">
                    File Excel memiliki format 4 sheet: Jenjang → Tingkat → Kelas → Kitab. Jangan ubah nama sheet atau nama kolom agar import berjalan benar.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-200 bg-white/40 hover:bg-slate-50 hover:border-slate-300 transition-all text-center group"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 transition-colors">
                      <FileDown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase">Unduh Templat</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">File Excel kosongan</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDatabase}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-200 bg-white/40 hover:bg-slate-50 hover:border-slate-300 transition-all text-center group"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-indigo-50 text-slate-500 group-hover:text-indigo-600 transition-colors">
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase">Ekspor Database</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">Unduh data aktif ke Excel</p>
                    </div>
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
