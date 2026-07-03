import { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  History,
  RotateCcw,
  GraduationCap
} from 'lucide-react';
import { fetchSantri, updateSantri } from '../services/admin.service';
import type { SantriAdmin } from '../services/admin.service';
import { 
  GlassCard, 
  PremiumButton, 
  SoftInput,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td 
} from '../../../components/ui';
import { useNotificationStore } from '../../../stores/notificationStore';

export const AdminAlumniPage = () => {
  const { showToast, showConfirm } = useNotificationStore();
  const [alumniList, setAlumniList] = useState<SantriAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALUMNI' | 'CUTI' | 'BOYONG'>('ALUMNI');

  const loadAlumniData = async () => {
    setLoading(true);
    try {
      const res = await fetchSantri({
        status: statusFilter,
        search: search || undefined
      });
      if (res.success) {
        let data: SantriAdmin[] = res.data;
        if (yearFilter) {
          data = data.filter(s => s.tahunKeluar === yearFilter);
        }
        setAlumniList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlumniData();
  }, [statusFilter, yearFilter]);

  const handleReactivate = (santri: SantriAdmin) => {
    showConfirm(
      'Re-aktifkan Santri',
      `Apakah Anda yakin ingin memulihkan status ${santri.name} menjadi SANTRI AKTIF kembali?`,
      async () => {
        try {
          await updateSantri(santri.id, {
            status: 'ACTIVE',
            tahunKeluar: null
          });
          showToast(`Berhasil memulihkan ${santri.name} sebagai santri aktif.`, 'success');
          loadAlumniData();
        } catch (err) {
          console.error(err);
          showToast('Gagal memulihkan status santri.', 'error');
        }
      }
    );
  };

  // Get distinct exit years for filter dropdown options
  const exitYears = Array.from(
    new Set(
      alumniList
        .map(s => s.tahunKeluar)
        .filter((y): y is string => !!y)
    )
  ).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            Alumni & Santri Keluar
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Arsip data historis santri putri yang sudah lulus khidmah/boyong atau sedang menjalani masa cuti.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => { setStatusFilter('ALUMNI'); setYearFilter(''); }}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            statusFilter === 'ALUMNI' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Alumni (Sudah Lulus)
        </button>
        <button
          onClick={() => { setStatusFilter('CUTI'); setYearFilter(''); }}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            statusFilter === 'CUTI' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          Masa Cuti
        </button>
        <button
          onClick={() => { setStatusFilter('BOYONG'); setYearFilter(''); }}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            statusFilter === 'BOYONG' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <X className="w-4 h-4" />
          Boyong (Keluar)
        </button>
      </div>

      {/* Filters */}
      <GlassCard variant="neumorph" className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <SoftInput
            placeholder={`Cari nama, stambuk, NIK di daftar ${statusFilter.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5 text-slate-400" />}
            className="w-full"
          />
          {search && (
            <button 
              onClick={() => { setSearch(''); setTimeout(() => loadAlumniData(), 50); }}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500"
          >
            <option value="">Semua Tahun Keluar</option>
            {exitYears.map(year => (
              <option key={year} value={year}>Tahun Keluar: {year}</option>
            ))}
          </select>

          <PremiumButton onClick={loadAlumniData} variant="secondary" className="px-4 py-2 text-xs">
            Terapkan
          </PremiumButton>
        </div>
      </GlassCard>

      {/* Datatable */}
      <GlassCard variant="neumorph" className="overflow-hidden border border-slate-200/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Memuat data...</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>No. Stambuk / NIK</Th>
                <Th>Nama Lengkap</Th>
                <Th>Tahun Keluar</Th>
                <Th>Kelas Terakhir</Th>
                <Th>Status Arsip</Th>
                <Th className="text-right">Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {alumniList.map(santri => (
                <Tr key={santri.id}>
                  <Td>
                    <div className="font-extrabold text-slate-800">{santri.noStambuk || '-'}</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{santri.nik || '-'}</div>
                  </Td>
                  <Td>
                    <div className="font-extrabold text-slate-900">{santri.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">{santri.alamatLengkap || '-'}</div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      {santri.tahunKeluar || '-'}
                    </div>
                  </Td>
                  <Td>
                    {(() => {
                      const parts = (santri.classId || '').split('|');
                      if (parts.length >= 3) {
                        const cleanPart2 = parts[2].replace(/bagian\s*/i, '').trim();
                        return cleanPart2 ? `${parts[0]} ${cleanPart2} (Tk. ${parts[1]})` : `${parts[0]} (Tk. ${parts[1]})`;
                      }
                      return santri.classId || '-';
                    })()}
                  </Td>
                  <Td>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      santri.status === 'ALUMNI'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : santri.status === 'BOYONG' 
                        ? 'bg-rose-500/10 text-rose-600' 
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {santri.status === 'ALUMNI' ? 'Alumni' : santri.status === 'BOYONG' ? 'Boyong' : 'Cuti'}
                    </span>
                  </Td>
                  <Td className="text-right">
                      <button
                        onClick={() => handleReactivate(santri)}
                        title="Re-aktifkan kembali sebagai santri aktif"
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Re-aktifkan
                      </button>
                  </Td>
                </Tr>
              ))}
              {alumniList.length === 0 && (
                <Tr>
                  <Td colSpan={6} className="text-center py-20 text-slate-400 italic">
                    Tidak ada data arsip {statusFilter.toLowerCase()} ditemukan
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </GlassCard>
    </div>
  );
};
