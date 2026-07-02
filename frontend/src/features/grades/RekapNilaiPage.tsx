import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Printer, Search } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { SoftInput } from '../../components/ui/SoftInput';
import { SANTRI_LIRBOYO_SEED } from '../../mocks/santri.seed';
import { useSession } from '../../lib/auth.client';
import { PrototypeModal } from '../../components/ui/PrototypeModal';

interface StudentRekap {
  santriId: string;
  namaLengkap: string;
  nisn: string;
  tamrin: number;
  ujian: number;
  khosh: number;
  alBayan: string;
  catatan: string;
}

export const RekapNilaiPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: sessionData } = useSession();
  const [showProtoModal, setShowProtoModal] = useState(false);

  const mockMustahiq = {
    name: sessionData?.user?.name || 'Pengajar',
    role: 'Mustahiq',
    bagianClass: 'Bagian A',
    lokalRoom: 'Lokal 01',
  };

  const getMadrasahName = (bagian: string): string => {
    if (bagian.toLowerCase().includes('aliyah')) return "MADRASAH ALIYAH HIDAYATUL MUBTADI'AT";
    return "MADRASAH TSANAWIYAH HIDAYATUL MUBTADI'AT";
  };
  
  // Official Lirboyo Al Bayan conversions
  const getAlBayan = (score: number): string => {
    if (score >= 9) return 'الجيد الأول'; // Jayyid Awal
    if (score >= 8) return 'الجيد الثاني'; // Jayyid Tsani
    if (score >= 7) return 'المتوسط الأول'; // Mutawassith Awal
    if (score >= 6) return 'المتوسط الثاني'; // Mutawassith Tsani
    return 'الرديء'; // Rodi'
  };

  // Compile read-only student academic performance records
  const rekapData: StudentRekap[] = SANTRI_LIRBOYO_SEED.filter(
    (s) => s.bagianClass === 'Bagian A'
  ).map((s) => {
    const tamrinScore = 8; // Mock value loaded from Tamrin database
    const ujianScore = 7;  // Mock value loaded from Exam database
    const khoshScore = Math.round((tamrinScore + ujianScore) / 2);
    return {
      santriId: s.id,
      namaLengkap: s.namaLengkap,
      nisn: s.nisn,
      tamrin: tamrinScore,
      ujian: ujianScore,
      khosh: khoshScore,
      alBayan: getAlBayan(khoshScore),
      catatan: 'Baik dan Istiqomah dalam belajar.',
    };
  });

  const filteredData = rekapData.filter((r) =>
    r.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.nisn.includes(searchTerm)
  );

  const handlePrint = () => {
    setShowProtoModal(true);
  };

  const handleConfirmPrint = () => {
    setShowProtoModal(false);
    window.print();
  };

  const currentDateString = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. SCREEN VIEW: Interactive PWA layout (Hidden when printing)             */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
        className="pb-6 w-full max-w-2xl mx-auto print:hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center neumorph-pressed shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Rekap Nilai Kelas</h1>
              <p className="text-xs text-slate-500 font-medium">Laporan Hasil Belajar Lengkap Bagian A (Lokal 01)</p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handlePrint}
            className="w-10 h-10 rounded-xl neumorph text-slate-600 hover:text-slate-800 flex items-center justify-center shrink-0 transition-transform active:scale-95"
            title="Cetak Rekap Resmi"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <SoftInput
            label="Cari Rekap Santri"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ketik nama santri..."
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Spreadsheet Table Rekap */}
        <GlassCard variant="neumorph" className="p-0 overflow-hidden border border-slate-200/60 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-44">Nama Santri</th>
                  <th className="py-3 px-4 w-20 text-center">Nilai Tamrin</th>
                  <th className="py-3 px-4 w-20 text-center">Nilai Ujian</th>
                  <th className="py-3 px-4 w-20 text-center">Nilai Khosh</th>
                  <th className="py-3 px-4 w-28 text-center font-arabic">البيان (Al-Bayan)</th>
                  <th className="py-3 px-4">Catatan Perkembangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-xs">
                {filteredData.map((row, index) => (
                  <tr key={row.santriId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-center text-xs font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{row.namaLengkap}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{row.nisn}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-600">
                      {row.tamrin}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-600">
                      {row.ujian}
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-blue-700">
                      {row.khosh}
                    </td>
                    <td className="py-3 px-4 text-center text-[10px] font-bold text-emerald-600 bg-emerald-50/30 font-arabic">
                      {row.alBayan}
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic">
                      {row.catatan}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                      Tidak ada data rekap ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* ========================================================================= */}
      {/* 2. PRINT-ONLY VIEW: Formal, elegant corporate letterhead design          */}
      {/* ========================================================================= */}
      <div className="hidden print:block w-full text-black bg-white font-serif p-4" style={{ minHeight: '297mm' }}>
        {/* CSS print config helper style */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; color: black !important; }
            @page { size: A4 portrait; margin: 15mm; }
          }
        `}} />

        {/* Kop Surat Resmi Lirboyo */}
        <div className="text-center border-b-[3px] border-double border-black pb-4 mb-6">
          <h1 className="text-xl font-extrabold tracking-wide uppercase">PONDOK PESANTREN HIDAYATUL MUBTADI'AT</h1>
          <h2 className="text-lg font-bold tracking-normal uppercase mt-0.5">{getMadrasahName(mockMustahiq.bagianClass)}</h2>
          <p className="text-xs italic text-gray-700 mt-1">Lirboyo, Kota Kediri, Jawa Timur 64117 | Telp: (0354) 771701</p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-sm font-extrabold tracking-wider uppercase underline">REKAPITULASI HASIL EVALUASI AKADEMIK SANTRI</h3>
          <p className="text-xs font-bold mt-1">Tahun Ajaran 1447-1448 H / Semester Ganjil (Kwartal I)</p>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 text-xs font-bold mb-5 gap-y-1.5">
          <div className="flex">
            <span className="w-24">Kelas Binaan</span>
            <span className="mr-2">:</span>
            <span>Bagian A</span>
          </div>
          <div className="flex">
            <span className="w-24">Wali Kelas</span>
            <span className="mr-2">:</span>
            <span>{mockMustahiq.name}</span>
          </div>
          <div className="flex">
            <span className="w-24">Lokal Ruangan</span>
            <span className="mr-2">:</span>
            <span>Lokal 01</span>
          </div>
          <div className="flex">
            <span className="w-24">Tanggal Cetak</span>
            <span className="mr-2">:</span>
            <span>{currentDateString}</span>
          </div>
        </div>

        {/* Formal Table */}
        <table className="w-full text-xs text-left border-collapse border border-black mb-8">
          <thead>
            <tr className="bg-gray-100 text-black border-b border-black font-extrabold uppercase">
              <th className="py-2.5 px-2 border border-black text-center w-10">No</th>
              <th className="py-2.5 px-3 border border-black w-24">NISN</th>
              <th className="py-2.5 px-3 border border-black">Nama Lengkap</th>
              <th className="py-2.5 px-2 border border-black text-center w-16">Tamrin</th>
              <th className="py-2.5 px-2 border border-black text-center w-16">Ujian Sem.</th>
              <th className="py-2.5 px-2 border border-black text-center w-16">Nilai Khosh</th>
              <th className="py-2.5 px-3 border border-black text-center w-28 font-arabic">البيان (Al-Bayan)</th>
            </tr>
          </thead>
          <tbody>
            {rekapData.map((row, index) => (
              <tr key={row.santriId} className="border-b border-black font-medium">
                <td className="py-2 px-2 border border-black text-center">{index + 1}</td>
                <td className="py-2 px-3 border border-black font-mono">{row.nisn}</td>
                <td className="py-2 px-3 border border-black font-bold uppercase">{row.namaLengkap}</td>
                <td className="py-2 px-2 border border-black text-center font-bold">{row.tamrin}</td>
                <td className="py-2 px-2 border border-black text-center font-bold">{row.ujian}</td>
                <td className="py-2 px-2 border border-black text-center font-extrabold">{row.khosh}</td>
                <td className="py-2 px-3 border border-black text-center font-bold font-arabic">{row.alBayan}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tanda Tangan Resmi (Signature Box) */}
        <div className="grid grid-cols-2 text-xs font-bold text-center mt-12 pt-4">
          <div className="flex flex-col items-center">
            <span>Mengetahui,</span>
            <span className="mt-1">Wali Kelas Bagian A</span>
            <div className="h-16 w-32 border-b border-black border-dashed mt-4 flex items-end justify-center pb-0.5">
              <span>( {mockMustahiq.name} )</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span>Menyetujui,</span>
            <span className="mt-1">Kepala Madrasah MPHM Lirboyo</span>
            <div className="h-16 w-36 border-b border-black border-dashed mt-4 flex items-end justify-center pb-0.5">
              <span>( KH. An'im F. Mahrus )</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prototype Modal */}
      <PrototypeModal 
        isOpen={showProtoModal} 
        onClose={handleConfirmPrint} 
        featureName="Cetak Rekap Hasil Evaluasi PDF" 
      />
    </>
  );
};
