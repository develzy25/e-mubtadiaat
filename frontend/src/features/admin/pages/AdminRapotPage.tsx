import { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Printer, 
  RefreshCw, 
  Search, 
  AlertCircle
} from 'lucide-react';
import { 
  GlassCard, 
  PremiumButton, 
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '../../../components/ui';
import { useNotificationStore } from '../../../stores/notificationStore';
import * as masterService from '../services/master.service';

interface StudentData {
  id: string;
  name: string;
  noStambuk: string;
}

interface ScoreItem {
  kitabName: string;
  tamrinScore: number;
  ujianScore: number;
  khoshScore: number;
  isFixedColumn: boolean;
}

interface GridRow {
  student: StudentData;
  rapotId: string | null;
  izinCount: number;
  tanpaIzinCount: number;
  nilaiAkhlaq: number;
  catatan: string;
  predikatOverride: string | null;
  scores: ScoreItem[];
}

const PREDIKAT_LIST = ['الجيد الأول', 'الجيد الثاني', 'المتوسط الأول', 'المتوسط الثاني', 'الرديء', 'المثبت'];

// Helper to convert to Arabic numerals
const toArabicDigits = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || num === '') return '-';
  const str = String(num);
  const map: Record<string, string> = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩', '-': '-'
  };
  return str.split('').map(char => map[char] || char).join('');
};

export const AdminRapotPage = () => {
  const { showToast } = useNotificationStore();
  const [classList, setClassList] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<'I' | 'II'>('I');
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  
  const [activeTab, setActiveTab] = useState<'INPUT' | 'REKAP' | 'PRINT'>('INPUT');
  const [gridData, setGridData] = useState<GridRow[]>([]);
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classStatus, setClassStatus] = useState<'DRAFT' | 'SIAP_FINALISASI' | 'FINAL'>('DRAFT');
  
  // Nilai AM per kitab
  const [nilaiAmList, setNilaiAmList] = useState<any[]>([]);
  
  // For individual printing
  const [selectedPrintStudentId, setSelectedPrintStudentId] = useState('');
  const [printData, setPrintData] = useState<any>(null);

  // Load classes initially
  useEffect(() => {
    const initClasses = async () => {
      try {
        const res = await masterService.fetchKelas();
        if (res.success) {
          setClassList(res.data);
          if (res.data.length > 0) {
            setSelectedClassId(res.data[0].id);
          }
        }
      } catch (err) {
        showToast('Gagal memuat daftar kelas', 'error');
      }
    };
    initClasses();
  }, []);

  // Load Rapot Grid & Schedule-based Columns
  const loadRapotData = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    try {
      // 1. Get schedule for columns
      // Semester I uses kwartal 1 and 2. Semester II uses kwartal 3 and 4.
      const kwartals = selectedSemester === 'I' ? [1, 2] : [3, 4];
      const [j1, j2] = await Promise.all([
        masterService.fetchJadwal(selectedClassId, kwartals[0], selectedYear),
        masterService.fetchJadwal(selectedClassId, kwartals[1], selectedYear)
      ]);
      
      const allJadwal = [...(j1.success ? j1.data : []), ...(j2.success ? j2.data : [])];
      // Get unique subject names
      const subjects = Array.from(new Set(allJadwal.map((j: any) => j.kitabName))).filter(Boolean);
      setDynamicColumns(subjects);

      // 2. Fetch Rapot Grid
      const res = await masterService.fetchRapotGrid(selectedClassId, selectedSemester, selectedYear);
      if (res.success) {
        setClassStatus(res.classStatus || 'DRAFT');
        const mapped: GridRow[] = res.data.map((row: any) => {
          // Initialize columns if missing
          const scores = subjects.map(sub => {
            const existing = row.scores.find((s: any) => s.kitabName === sub);
            return {
              kitabName: sub,
              tamrinScore: existing ? existing.tamrinScore : 0,
              ujianScore: existing ? existing.ujianScore : 0,
              khoshScore: existing ? existing.khoshScore : 0,
              isFixedColumn: false
            };
          });

          // Add fixed columns: Khat, Qiroah, Muhafazhoh, Akhlaq
          const fixedColumns = ['الخط \/ الإملاء', 'قراءة الكتب', 'المحافظة', 'الأخلاق'];
          fixedColumns.forEach(fc => {
            const existing = row.scores.find((s: any) => s.kitabName === fc);
            scores.push({
              kitabName: fc,
              tamrinScore: existing ? existing.tamrinScore : 0,
              ujianScore: existing ? existing.ujianScore : 0,
              khoshScore: existing ? existing.khoshScore : 0,
              isFixedColumn: true
            });
          });

          return {
            student: row.student,
            rapotId: row.rapotId,
            izinCount: row.izinCount,
            tanpaIzinCount: row.tanpaIzinCount,
            nilaiAkhlaq: row.nilaiAkhlaq ?? 8,
            catatan: row.catatan,
            predikatOverride: row.predikatOverride,
            scores
          };
        });
        setGridData(mapped);
      }

      // 3. Fetch Nilai 'Am
      const amRes = await masterService.fetchNilaiAm(selectedClassId, selectedSemester, selectedYear);
      if (amRes.success) {
        setNilaiAmList(amRes.data);
      }

    } catch (err) {
      showToast('Gagal memuat data rapot', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRapotData();
  }, [selectedClassId, selectedSemester, selectedYear]);

  // Handle Score Input
  const handleScoreChange = (
    studentId: string,
    kitabName: string,
    field: 'tamrinScore' | 'ujianScore',
    value: string
  ) => {
    const numeric = parseInt(value) || 0;
    
    // Validations:
    // Kitab: 0-10
    // Akhlaq: 4-8
    if (kitabName === 'الأخلاق') {
      if (numeric !== 0 && (numeric < 4 || numeric > 8)) return;
    } else {
      if (numeric < 0 || numeric > 10) return;
    }

    setGridData(prev => prev.map(row => {
      if (row.student.id !== studentId) return row;
      const updatedScores = row.scores.map(s => {
        if (s.kitabName !== kitabName) return s;
        
        const updated = { ...s, [field]: numeric };
        // Compute Khosh Score automatically
        updated.khoshScore = Math.round((updated.tamrinScore + updated.ujianScore) / 2);
        return updated;
      });
      return { ...row, scores: updatedScores };
    }));
  };

  // Handle Kehadiran / Catatan Change
  const handleHeaderChange = (studentId: string, field: 'izinCount' | 'tanpaIzinCount' | 'nilaiAkhlaq' | 'catatan' | 'predikatOverride', value: any) => {
    setGridData(prev => prev.map(row => {
      if (row.student.id !== studentId) return row;
      return { ...row, [field]: value };
    }));
  };

  const handleFinalize = async (newStatus: 'DRAFT' | 'SIAP_FINALISASI' | 'FINAL') => {
    if (!selectedClassId) return;
    setSaving(true);
    try {
      const res = await masterService.finalizeKelas({
        classId: selectedClassId,
        semester: selectedSemester,
        academicYear: selectedYear,
        status: newStatus,
        recordedBy: 'admin'
      });
      if (res.success) {
        showToast(res.message, 'success');
        loadRapotData();
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status finalisasi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    // Basic range check validation before submit
    for (const row of gridData) {
      const akhlaqKitab = row.scores.find(s => s.kitabName === 'الأخلاق');
      if (akhlaqKitab && (akhlaqKitab.tamrinScore < 4 || akhlaqKitab.tamrinScore > 8 || akhlaqKitab.ujianScore < 4 || akhlaqKitab.ujianScore > 8)) {
        showToast(`Nilai Akhlaq pelajaran untuk ${row.student.name} harus antara 4 s/d 8`, 'error');
        return;
      }
      if (row.nilaiAkhlaq < 4 || row.nilaiAkhlaq > 8) {
        showToast(`Nilai Akhlaq perilaku untuk ${row.student.name} harus antara 4 s/d 8`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        classId: selectedClassId,
        semester: selectedSemester,
        academicYear: selectedYear,
        rows: gridData.map(row => ({
          studentId: row.student.id,
          rapotId: row.rapotId,
          izinCount: row.izinCount,
          tanpaIzinCount: row.tanpaIzinCount,
          nilaiAkhlaq: row.nilaiAkhlaq,
          catatan: row.catatan,
          predikatOverride: row.predikatOverride,
          scores: row.scores
        }))
      };
      const res = await masterService.saveRapotBatch(payload);
      if (res.success) {
        showToast('Nilai rapot kelas berhasil disimpan secara permanen', 'success');
        loadRapotData();
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan rapot', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Get total khosh score for a student row
  const getRowTotalKhos = (row: GridRow) => {
    return row.scores.reduce((a, b) => a + b.khoshScore, 0);
  };

  // Load Rekap for Individual Print Preview
  const handleSelectPrintStudent = async (studentId: string) => {
    setSelectedPrintStudentId(studentId);
    if (!studentId) {
      setPrintData(null);
      return;
    }
    try {
      const res = await masterService.fetchRekap(studentId, selectedYear);
      if (res.success) {
        const studentObj = gridData.find(g => g.student.id === studentId)?.student;
        setPrintData({
          student: studentObj,
          semesterData: res.data
        });
      }
    } catch (err) {
      showToast('Gagal memuat rekap rapot santri', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 print:p-0 print:m-0 print:bg-white print:shadow-none print:border-0 print:absolute print:top-0 print:left-0 print:w-full print:z-999">
      {/* Top Header Card (Hidden on Print) */}
      <GlassCard className="relative overflow-hidden p-6 print:hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-tr from-indigo-600 to-violet-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">e-Raport Akademik</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Input nilai Tamrin/Semester, hitung otomatis, dan cetak PDF resmi Pondok Pesantren.</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filters Card (Hidden on Print) */}
      <GlassCard className="p-5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as 'I' | 'II')}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xs text-sm font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              <option value="I">Semester I (Ganjil)</option>
              <option value="II">Semester II (Genap)</option>
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
        </div>

        {/* Action & Status Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Finalisasi:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${
              classStatus === 'FINAL' 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : classStatus === 'SIAP_FINALISASI' 
                ? 'bg-amber-50 text-amber-600 border-amber-200' 
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {classStatus === 'FINAL' ? 'FINAL (TERKUNCI)' : classStatus === 'SIAP_FINALISASI' ? 'SIAP FINALISASI' : 'DRAFT'}
            </span>
          </div>
          
          <div className="flex gap-2 justify-end w-full sm:w-auto flex-wrap">
            {classStatus === 'DRAFT' && (
              <PremiumButton
                variant="secondary"
                onClick={() => handleFinalize('SIAP_FINALISASI')}
                disabled={saving || loading}
                className="h-10 px-4 text-xs font-bold border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                Ajukan Finalisasi
              </PremiumButton>
            )}

            {classStatus === 'SIAP_FINALISASI' && (
              <>
                <PremiumButton
                  variant="secondary"
                  onClick={() => handleFinalize('DRAFT')}
                  disabled={saving || loading}
                  className="h-10 px-4 text-xs font-bold border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100"
                >
                  Kembalikan ke Draft
                </PremiumButton>
                <PremiumButton
                  variant="primary"
                  onClick={() => handleFinalize('FINAL')}
                  disabled={saving || loading}
                  className="h-10 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/25"
                >
                  Finalisasi & Kunci
                </PremiumButton>
              </>
            )}

            {classStatus === 'FINAL' && (
              <PremiumButton
                variant="secondary"
                onClick={() => handleFinalize('DRAFT')}
                disabled={saving || loading}
                className="h-10 px-4 text-xs font-bold border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
              >
                Buka Kunci Nilai
              </PremiumButton>
            )}

            <PremiumButton
              variant="primary"
              onClick={handleSaveAll}
              disabled={saving || loading || classStatus === 'FINAL'}
              className="h-10 px-5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 text-white flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
            </PremiumButton>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 mt-5 gap-6">
          <button
            onClick={() => setActiveTab('INPUT')}
            className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'INPUT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tab 1: Input Nilai
          </button>
          <button
            onClick={() => setActiveTab('REKAP')}
            className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'REKAP' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tab 2: Rekapitulasi & Al-Bayan
          </button>
          <button
            onClick={() => setActiveTab('PRINT')}
            className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'PRINT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tab 3: Cetak PDF Rapot
          </button>
        </div>
      </GlassCard>

      {/* TAB 1: INPUT NILAI (Hidden on Print) */}
      {activeTab === 'INPUT' && (
        <GlassCard className="overflow-x-auto print:hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-xs font-bold text-slate-400">Memuat lembar penilaian...</span>
            </div>
          ) : gridData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 font-bold uppercase tracking-wider gap-2">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              Belum ada data santri aktif di kelas ini.
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr className="bg-slate-50 border-b border-slate-100">
                  <Th className="sticky left-0 bg-slate-50 z-20 w-48 font-black text-slate-500 uppercase tracking-widest text-[9px]">Nama Santri / Stambuk</Th>
                  {/* Dynamic schedule-based kitabs */}
                  {dynamicColumns.map((col, idx) => (
                    <Th key={idx} className="text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[100px]">
                      <div className="mb-1 text-slate-700 text-xs font-bold font-arabic">{col}</div>
                      <div className="flex justify-center gap-4 text-[9px] text-slate-400">
                        <span>T</span>
                        <span>U</span>
                      </div>
                    </Th>
                  ))}
                  {/* Fixed columns: Khat, Qiroah, Muhafazhoh, Akhlaq */}
                  {['الخط \/ الإملاء', 'قراءة الكتب', 'المحافظة', 'الأخلاق'].map((col, idx) => (
                    <Th key={idx} className="text-center font-black text-indigo-600 uppercase tracking-widest text-[9px] min-w-[100px] bg-indigo-50/30">
                      <div className="mb-1 text-indigo-800 text-xs font-bold font-arabic">{col.replace('\/', '/')}</div>
                      <div className="flex justify-center gap-4 text-[9px] text-slate-400">
                        <span>T</span>
                        <span>U</span>
                      </div>
                    </Th>
                  ))}
                  <Th className="text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[60px] bg-slate-50">Khos (K)</Th>
                  <Th className="text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[60px]">Izin</Th>
                  <Th className="text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[60px]">Alpa</Th>
                  <Th className="text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[60px]">Akhlaq</Th>
                </Tr>
              </Thead>
              <Tbody>
                {gridData.map((row, rIdx) => (
                  <Tr key={rIdx} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                    <Td className="sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 font-extrabold text-slate-800 text-xs">
                      <div>{row.student.name}</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-1">Stb: {row.student.noStambuk}</div>
                    </Td>
                    {/* Dynamic subject cells */}
                    {row.scores.map((score, sIdx) => (
                      <Td key={sIdx} className={`text-center py-4 ${score.isFixedColumn ? 'bg-indigo-50/10' : ''}`}>
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="text"
                            value={score.tamrinScore || ''}
                            disabled={classStatus === 'FINAL'}
                            onChange={(e) => handleScoreChange(row.student.id, score.kitabName, 'tamrinScore', e.target.value)}
                            className="w-8 h-8 text-center rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
                            placeholder="T"
                          />
                          <input
                            type="text"
                            value={score.ujianScore || ''}
                            disabled={classStatus === 'FINAL'}
                            onChange={(e) => handleScoreChange(row.student.id, score.kitabName, 'ujianScore', e.target.value)}
                            className="w-8 h-8 text-center rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
                            placeholder="U"
                          />
                          <span className="text-[10px] font-black text-slate-400 bg-slate-100/70 w-6 h-6 flex items-center justify-center rounded-md ml-1">
                            {score.khoshScore}
                          </span>
                        </div>
                      </Td>
                    ))}
                    {/* Summary row Khos Total */}
                    <Td className="text-center font-black text-indigo-600 bg-indigo-50/20 text-xs">
                      {getRowTotalKhos(row)}
                    </Td>
                    {/* Kehadiran */}
                    <Td className="text-center">
                      <input
                        type="text"
                        value={row.izinCount || ''}
                        disabled={classStatus === 'FINAL'}
                        onChange={(e) => handleHeaderChange(row.student.id, 'izinCount', parseInt(e.target.value) || 0)}
                        className="w-10 h-8 text-center rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
                        placeholder="Izin"
                      />
                    </Td>
                    <Td className="text-center">
                      <input
                        type="text"
                        value={row.tanpaIzinCount || ''}
                        disabled={classStatus === 'FINAL'}
                        onChange={(e) => handleHeaderChange(row.student.id, 'tanpaIzinCount', parseInt(e.target.value) || 0)}
                        className="w-10 h-8 text-center rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
                        placeholder="Alpa"
                      />
                    </Td>
                    <Td className="text-center">
                      <input
                        type="text"
                        value={row.nilaiAkhlaq ?? 8}
                        disabled={classStatus === 'FINAL'}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (val >= 0 && val <= 8) {
                            handleHeaderChange(row.student.id, 'nilaiAkhlaq', val);
                          }
                        }}
                        className="w-10 h-8 text-center rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
                        placeholder="8"
                      />
                    </Td>
                  </Tr>
                ))}
                
                {/* Nilai 'Am Bottom Row */}
                <Tr className="bg-slate-50/70 border-t border-slate-200">
                  <Td className="sticky left-0 bg-slate-50 font-black text-slate-600 text-xs uppercase tracking-wider py-4">
                    NILAI 'AM (RATA-RATA)
                  </Td>
                  {/* Dynamic mapel averages */}
                  {dynamicColumns.map((col, idx) => {
                    const am = nilaiAmList.find(a => a.kitabName === col)?.nilaiAm ?? '-';
                    return (
                      <Td key={idx} className="text-center font-black text-slate-700 text-xs font-arabic">
                        {toArabicDigits(am)} ({am})
                      </Td>
                    );
                  })}
                  {/* Fixed column averages */}
                  {['الخط \/ الإملاء', 'قراءة الكتب', 'المحافظة', 'الأخلاق'].map((col, idx) => {
                    const cleanName = col.replace('\/', '/');
                    const am = nilaiAmList.find(a => a.kitabName === cleanName)?.nilaiAm ?? '-';
                    return (
                      <Td key={idx} className="text-center font-black text-indigo-700 text-xs font-arabic bg-indigo-50/20">
                        {toArabicDigits(am)} ({am})
                      </Td>
                    );
                  })}
                  <Td className="text-center font-black text-indigo-800 bg-indigo-50/30 text-xs">
                    {nilaiAmList.reduce((a, b) => a + (b.nilaiAm || 0), 0)}
                  </Td>
                  <Td colSpan={3} />
                </Tr>
              </Tbody>
            </Table>
          )}
        </GlassCard>
      )}

      {/* TAB 2: REKAPITULASI & AL-BAYAN (Hidden on Print) */}
      {activeTab === 'REKAP' && (
        <GlassCard className="p-4 print:hidden">
          <Table>
            <Thead>
              <Tr className="bg-slate-50 border-b border-slate-100">
                <Th className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Nama Santri</Th>
                <Th className="text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Total S1</Th>
                <Th className="text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Total S2</Th>
                <Th className="text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Jumlah S1+S2</Th>
                <Th className="text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Rata-rata</Th>
                <Th className="text-center font-black text-slate-500 uppercase tracking-widest text-[10px] w-48">Predikat (Al-Bayan)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {gridData.map((row, idx) => {
                const totalS1 = getRowTotalKhos(row);
                // Simulated S2 values
                const totalS2 = totalS1; 
                const sumS1S2 = totalS1 + totalS2;
                const totalMapel = row.scores.length * 2;
                const avg = totalMapel > 0 ? Math.round(sumS1S2 / totalMapel) : 0;
                
                const pengurangIzin = Math.floor(row.izinCount / 15);
                const pengurangAlpa = Math.floor(row.tanpaIzinCount / 5);
                const nilaiPrestasi = Math.max(0, avg - pengurangIzin - pengurangAlpa);
                
                let calculatedPredikat = 'الرديء';
                if (nilaiPrestasi >= 9) calculatedPredikat = 'الجيد الأول';
                else if (nilaiPrestasi === 8) calculatedPredikat = 'الجيد الثاني';
                else if (nilaiPrestasi === 7) calculatedPredikat = 'المتوسط الأول';
                else if (nilaiPrestasi === 6) calculatedPredikat = 'المتوسط الثاني';
                
                const predikat = row.predikatOverride || calculatedPredikat;

                return (
                  <Tr key={idx} className="hover:bg-slate-50/50 border-b border-slate-100">
                    <Td className="font-extrabold text-slate-800 text-xs">
                      {row.student.name}
                    </Td>
                    <Td className="text-center font-bold text-slate-600 text-xs">{totalS1}</Td>
                    <Td className="text-center font-bold text-slate-600 text-xs">{totalS2}</Td>
                    <Td className="text-center font-black text-slate-800 text-xs">{sumS1S2}</Td>
                    <Td className="text-center font-black text-indigo-600 text-xs">{avg}</Td>
                    <Td className="text-center">
                      <select
                        value={predikat}
                        onChange={(e) => handleHeaderChange(row.student.id, 'predikatOverride', e.target.value)}
                        className={`w-full h-9 px-2 rounded-lg border text-xs font-bold text-center transition-colors ${
                          predikat === 'الرديء' ? 'border-red-200 text-red-600 bg-red-50' : 'border-slate-200 text-slate-700 bg-slate-50'
                        }`}
                      >
                        {PREDIKAT_LIST.map((p, pIdx) => (
                          <option key={pIdx} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </GlassCard>
      )}

      {/* TAB 3: CETAK PDF RAPOT */}
      {activeTab === 'PRINT' && (
        <div className="space-y-6 print:space-y-0">
          {/* Selector Card (Hidden on Print) */}
          <GlassCard className="p-5 print:hidden">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Pilih Santri untuk Preview</label>
                <select
                  value={selectedPrintStudentId}
                  onChange={(e) => handleSelectPrintStudent(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 transition-colors"
                >
                  <option value="">-- Pilih Santri --</option>
                  {gridData.map((g) => (
                    <option key={g.student.id} value={g.student.id}>
                      {g.student.name} ({g.student.noStambuk})
                    </option>
                  ))}
                </select>
              </div>
              {printData && (
                <PremiumButton
                  variant="primary"
                  onClick={handlePrint}
                  className="h-11 px-6 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Rapot PDF
                </PremiumButton>
              )}
            </div>
          </GlassCard>

          {/* Printable Rapot Container */}
          {printData ? (
            <div className="bg-white border-2 border-slate-800 p-10 max-w-[800px] mx-auto shadow-lg text-slate-800 relative select-none print:border-0 print:p-0 print:shadow-none print:w-full print:mx-0">
              
              {/* Arabic Header */}
              <div className="text-center space-y-2 border-b-4 border-double border-slate-800 pb-4">
                <h2 className="text-2xl font-black font-arabic tracking-wide">كشف الدرجات الدراسية</h2>
                <h3 className="text-lg font-bold font-arabic">فصل الدراسية الأولى</h3>
                <h4 className="text-sm font-semibold font-arabic text-slate-600">المدرسة العالية للبنات هداية المبتدآت ليربيا كديري</h4>
                <div className="text-xs font-bold">
                  Tahun Ajaran: {printData.semesterData.s1 ? selectedYear : selectedYear} M / 1447 - 1448 H
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm font-bold py-6 border-b border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex">
                    <span className="w-24 text-slate-400">Nama:</span>
                    <span className="text-slate-800 font-extrabold">{printData.student.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-400">Stambuk:</span>
                    <span className="text-slate-800 font-extrabold">{printData.student.noStambuk}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="flex justify-end">
                    <span className="w-24 text-slate-400 text-left">No. Tamrin:</span>
                    <span className="text-slate-800 font-extrabold">03</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="w-24 text-slate-400 text-left">Bagian:</span>
                    <span className="text-slate-800 font-extrabold">A</span>
                  </div>
                </div>
              </div>

              {/* Grades Table */}
              <table className="w-full text-sm font-bold border-collapse border border-slate-800 mt-6">
                <thead>
                  <tr className="bg-slate-50 border border-slate-800">
                    <th rowSpan={2} className="border border-slate-800 p-2 text-center w-12 font-arabic">الرقم</th>
                    <th rowSpan={2} className="border border-slate-800 p-2 text-left font-arabic">الكتب الدراسية (Kitab)</th>
                    <th rowSpan={2} className="border border-slate-800 p-2 text-center w-36 font-arabic">الفنون (Fan)</th>
                    <th colSpan={2} className="border border-slate-800 p-2 text-center font-arabic">أرقام الدرجات الخاصة والعامة</th>
                  </tr>
                  <tr className="bg-slate-50 border border-slate-800">
                    <th className="border border-slate-800 p-2 text-center w-20 font-arabic">الخاصة (Khos)</th>
                    <th className="border border-slate-800 p-2 text-center w-20 font-arabic">العامة ('Am)</th>
                  </tr>
                </thead>
                <tbody>
                  {printData.semesterData.detailMapel.map((m: any, idx: number) => {
                    const am = nilaiAmList.find(a => a.kitabName === m.kitabName)?.nilaiAm ?? '-';
                    return (
                      <tr key={idx} className="border border-slate-800">
                        <td className="border border-slate-800 p-2 text-center font-arabic">{toArabicDigits(idx + 1)}</td>
                        <td className="border border-slate-800 p-2 font-arabic">{m.kitabName}</td>
                        <td className="border border-slate-800 p-2 text-center font-arabic text-xs text-slate-500">
                          {m.kitabName === 'الخط \/ الإملاء' || m.kitabName === 'الخط | الإملاء' ? 'الكتابة' : 
                           m.kitabName === 'قراءة الكتب' ? 'القراءة' : 
                           m.kitabName === 'المحافظة' ? 'المحافظة' : 
                           m.kitabName === 'الأخلاق' ? 'الأخلاق' : 'العلم'}
                        </td>
                        <td className="border border-slate-800 p-2 text-center font-arabic text-lg font-black">{toArabicDigits(m.s1Khos)}</td>
                        <td className="border border-slate-800 p-2 text-center font-arabic text-lg text-slate-600">{toArabicDigits(am)}</td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="border border-slate-800 font-extrabold bg-slate-50/50">
                    <td colSpan={3} className="border border-slate-800 p-2.5 text-right font-arabic">جمل أرقام الدرجات الدراسية (Total)</td>
                    <td className="border border-slate-800 p-2 text-center font-arabic text-lg font-black">
                      {toArabicDigits(printData.semesterData.rekap.grandTotal)}
                    </td>
                    <td className="border border-slate-800 p-2 text-center font-arabic text-lg text-slate-600">
                      {toArabicDigits(nilaiAmList.reduce((a, b) => a + (b.nilaiAm || 0), 0))}
                    </td>
                  </tr>
                  {/* Kehadiran Izin */}
                  <tr className="border border-slate-800 font-bold">
                    <td colSpan={2} rowSpan={2} className="border border-slate-800 p-3 text-center font-arabic text-slate-500">
                      أيام التأخر (Absensi)
                    </td>
                    <td className="border border-slate-800 p-2 text-center font-arabic">بإذن (Izin)</td>
                    <td colSpan={2} className="border border-slate-800 p-2 text-center font-arabic text-lg font-black">
                      {toArabicDigits(printData.semesterData.rekap.izinTotal)}
                    </td>
                  </tr>
                  {/* Kehadiran Alpa */}
                  <tr className="border border-slate-800 font-bold">
                    <td className="border border-slate-800 p-2 text-center font-arabic">بغيره (Alpa)</td>
                    <td colSpan={2} className="border border-slate-800 p-2 text-center font-arabic text-lg font-black">
                      {toArabicDigits(printData.semesterData.rekap.tanpaIzinTotal)}
                    </td>
                  </tr>
                  {/* Al-Bayan Predikat Row */}
                  <tr className="border border-slate-800 font-black bg-indigo-50/10">
                    <td colSpan={2} className="border border-slate-800 p-3 text-center font-arabic text-indigo-800 text-sm">
                      البيان (Nilai Prestasi)
                    </td>
                    <td colSpan={3} className="border border-slate-800 p-3 text-center font-arabic text-indigo-700 text-base">
                      {printData.semesterData.rekap.predikat}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="flex justify-between items-start mt-12 text-sm font-bold">
                <div className="text-center space-y-16">
                  <div>المدير (Mudir)</div>
                  <div className="space-y-1">
                    <div className="underline font-black">الشيخ عطاء الله صالح الدين الحاج</div>
                    <div className="text-[10px] text-slate-400">K.H. 'Atho'illah Sholahuddin H.</div>
                  </div>
                </div>
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest rotate-12 mt-4 select-none">
                  Stempel MPHM
                </div>
                <div className="text-center space-y-16">
                  <div>المدرس (Mustahiq)</div>
                  <div className="space-y-1">
                    <div className="underline font-black">رجال محمد ياسين</div>
                    <div className="text-[10px] text-slate-400">Rijal Muhammad Yasin</div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl py-16 text-center text-slate-400 font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-2 print:hidden">
              <Search className="w-8 h-8 text-slate-300" />
              Pilih santri terlebih dahulu untuk menampilkan lembar cetak PDF.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
