import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Clock, 
  Users, 
  BookOpen, 
  Sparkles,
  CheckCircle2
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

interface ScheduleItem {
  id?: string;
  hari: string;
  sesi: string;
  kitabName: string;
  pengajar: string;
}

const HARI_LIST = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const SESI_LIST = ['الحصة الأولى', 'الحصة الثانية'];

export const AdminJadwalPage = () => {
  const { showToast } = useNotificationStore();
  const [classList, setClassList] = useState<any[]>([]);
  const [kitabList, setKitabList] = useState<any[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedKwartal, setSelectedKwartal] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal for editing cell
  const [cellModalOpen, setCellModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ hari: string; sesi: string } | null>(null);
  const [formKitab, setFormKitab] = useState('');
  const [formPengajar, setFormPengajar] = useState('');

  // Load classes and kitabs
  useEffect(() => {
    const initData = async () => {
      try {
        const [cRes, kRes] = await Promise.all([
          masterService.fetchKelas(),
          masterService.fetchKitab()
        ]);
        if (cRes.success) {
          setClassList(cRes.data);
          if (cRes.data.length > 0) {
            setSelectedClassId(cRes.data[0].id);
          }
        }
        if (kRes.success) {
          setKitabList(kRes.data);
        }
      } catch (err) {
        showToast('Gagal memuat referensi kelas/kitab', 'error');
      }
    };
    initData();
  }, []);

  // Load schedule when filters change
  const loadSchedule = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    try {
      const res = await masterService.fetchJadwal(selectedClassId, selectedKwartal, selectedYear);
      if (res.success) {
        setScheduleItems(res.data);
      }
    } catch (err) {
      showToast('Gagal memuat jadwal pelajaran', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [selectedClassId, selectedKwartal, selectedYear]);

  // Find item for a cell
  const getCellData = (hari: string, sesi: string) => {
    return scheduleItems.find(item => item.hari === hari && item.sesi === sesi);
  };

  const handleCellClick = (hari: string, sesi: string) => {
    const existing = getCellData(hari, sesi);
    setSelectedCell({ hari, sesi });
    setFormKitab(existing?.kitabName || '');
    setFormPengajar(existing?.pengajar || '');
    setCellModalOpen(true);
  };

  const handleSaveCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    const filtered = scheduleItems.filter(
      item => !(item.hari === selectedCell.hari && item.sesi === selectedCell.sesi)
    );

    if (formKitab.trim()) {
      filtered.push({
        hari: selectedCell.hari,
        sesi: selectedCell.sesi,
        kitabName: formKitab.trim(),
        pengajar: formPengajar.trim()
      });
    }

    setScheduleItems(filtered);
    setCellModalOpen(false);
    showToast('Sel jadwal berhasil di-set sementara', 'success');
  };

  const handleSaveAll = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    try {
      const payload = {
        classId: selectedClassId,
        kwartal: selectedKwartal,
        academicYear: selectedYear,
        items: scheduleItems
      };
      const res = await masterService.saveJadwalBatch(payload);
      if (res.success) {
        showToast('Jadwal pelajaran berhasil disimpan secara permanen', 'success');
        loadSchedule();
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan jadwal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    setScheduleItems([]);
    showToast('Grid jadwal dikosongkan (belum disimpan)', 'info');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header Card */}
      <GlassCard className="relative overflow-hidden p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-tr from-indigo-600 to-violet-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <Calendar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Jadwal Pelajaran</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Atur jadwal belajar mengajar, rotasi kitab, dan guru bantu (Munawwibah).</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filters Card */}
      <GlassCard className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Kelas / Rombel</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xs text-sm font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              {classList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Kwartal</label>
            <select
              value={selectedKwartal}
              onChange={(e) => setSelectedKwartal(Number(e.target.value))}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xs text-sm font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              <option value={1}>Kwartal I</option>
              <option value={2}>Kwartal II</option>
              <option value={3}>Kwartal III</option>
              <option value={4}>Kwartal IV</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tahun Ajaran</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xs text-sm font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <PremiumButton
              variant="ghost"
              onClick={handleClearAll}
              className="h-11 px-4 text-xs font-black text-slate-500 hover:text-red-500 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Kosongkan
            </PremiumButton>
            <PremiumButton
              variant="primary"
              onClick={handleSaveAll}
              disabled={saving || loading}
              className="h-11 px-5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 text-white flex items-center gap-1.5"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
            </PremiumButton>
          </div>
        </div>
      </GlassCard>

      {/* Schedule Table */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-xs font-bold text-slate-400">Sedang mengambil data jadwal...</span>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr className="bg-slate-50/75 border-b border-slate-100">
                <Th className="w-24 text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Hari / الأيام</Th>
                {SESI_LIST.map((sesi, idx) => (
                  <Th key={idx} className="text-center font-black text-indigo-600 uppercase tracking-widest text-[10px] py-4">
                    <span className="flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {sesi}
                    </span>
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {HARI_LIST.map((hari, hIdx) => (
                <Tr key={hIdx} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                  <Td className="text-center font-black text-slate-700 bg-slate-50/50 border-r border-slate-100/70 py-6 text-sm">
                    {hari}
                  </Td>
                  {SESI_LIST.map((sesi, sIdx) => {
                    const cell = getCellData(hari, sesi);
                    return (
                      <Td 
                        key={sIdx}
                        onClick={() => handleCellClick(hari, sesi)}
                        className="p-3 cursor-pointer group hover:bg-indigo-50/40 transition-all border-r border-slate-100/70 last:border-r-0 text-center"
                      >
                        {cell ? (
                          <div className="bg-white/80 border border-indigo-100 p-4 rounded-xl shadow-xs group-hover:shadow-md group-hover:border-indigo-300 group-hover:scale-102 transition-all duration-300">
                            <div className="font-extrabold text-slate-800 text-sm flex items-center justify-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                              {cell.kitabName}
                            </div>
                            <div className="text-xs font-semibold text-slate-500 mt-2 flex items-center justify-center gap-1 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100/70">
                              <Users className="w-3 h-3 text-slate-400" />
                              {cell.pengajar || 'Belum diatur'}
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200/80 rounded-xl py-6 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-500 transition-all duration-300 flex flex-col items-center justify-center gap-1 bg-slate-50/30">
                            <Plus className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-transform group-hover:rotate-90 duration-300" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Set Pelajaran</span>
                          </div>
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </GlassCard>

      {/* Legend & Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-5 flex gap-4">
          <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600 flex items-center justify-center h-fit">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm">Petunjuk Pengisian</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
              Klik pada sel kosong atau sel yang sudah terisi di dalam tabel jadwal untuk menentukan nama kitab dan mustahiq/munawwibah pengajar. Data yang Anda masukkan akan disimpan sementara di memori, klik tombol <strong className="text-indigo-600">Simpan Jadwal</strong> di kanan atas untuk menyimpannya ke database.
            </p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex gap-4">
          <div className="p-2.5 bg-green-50 rounded-xl text-green-600 flex items-center justify-center h-fit">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm">Rotasi Kwartal</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
              Jadwal diatur per kwartal (1, 2, 3, 4). Di akhir semester, sistem e-raport otomatis akan mengambil data pelajaran gabungan Kwartal I & II (untuk Semester I) atau Kwartal III & IV (untuk Semester II) sebagai acuan kolom nilai.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Edit Cell Modal */}
      <Modal
        isOpen={cellModalOpen}
        onClose={() => setCellModalOpen(false)}
        title={`Set Pelajaran: ${selectedCell?.hari} - ${selectedCell?.sesi}`}
      >
        <form onSubmit={handleSaveCell} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Mata Pelajaran / Kitab</label>
            <select
              value={formKitab}
              onChange={(e) => setFormKitab(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              <option value="">-- Hapus / Kosongkan --</option>
              {kitabList.map((k) => (
                <option key={k.id} value={k.name}>
                  {k.name} ({k.fanIlmu || 'Fan Tidak Diketahui'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Mustahiq / Munawwibah</label>
            <SoftInput
              value={formPengajar}
              onChange={(e) => setFormPengajar(e.target.value)}
              placeholder="e.g. Ustadzah Maryam / Bpk. Charis"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <PremiumButton variant="ghost" onClick={() => setCellModalOpen(false)} className="h-10 text-xs font-black">
              Batal
            </PremiumButton>
            <PremiumButton type="submit" variant="primary" className="h-10 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white">
              Set Jadwal
            </PremiumButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
