import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { SANTRI_LIRBOYO_SEED } from '../../mocks/santri.seed';
import { PrototypeModal } from '../../components/ui/PrototypeModal';
import { useSession } from '../../lib/auth.client';

interface StudentGrade {
  santriId: string;
  namaLengkap: string;
  nisn: string;
  tamrin: number; // Daily assessment score (4 - 9)
  ujian: number;  // Exam score (4 - 9)
  catatan: string;
}

export const InputNilaiPage: React.FC = () => {
  const { data: sessionData } = useSession();
  const [selectedKitab, setSelectedKitab] = useState('Mukhtashor Jiddan');
  const [showProtoModal, setShowProtoModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Enforce Lirboyo rule: Nilai Rapor/Khosh only ranges 4 - 9
  const [grades, setGrades] = useState<StudentGrade[]>(
    SANTRI_LIRBOYO_SEED.filter((s) => s.bagianClass === 'Bagian A').map((s) => ({
      santriId: s.id,
      namaLengkap: s.namaLengkap,
      nisn: s.nisn,
      tamrin: 7, // Initial default authentic score
      ujian: 8,
      catatan: 'Baik dan Istiqomah',
    }))
  );

  const handleCellChange = (
    index: number,
    field: 'ujian' | 'catatan',
    value: string | number
  ) => {
    const updated = [...grades];
    if (field === 'ujian') {
      let num = typeof value === 'string' ? parseInt(value, 10) : value;
      if (isNaN(num) || num < 4) num = 4; // Min grade is 4
      if (num > 9) num = 9;   // Max grade is 9
      updated[index][field] = num;
    } else {
      updated[index][field] = value as string;
    }
    setGrades(updated);
  };

  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProtoModal(true);
  };

  const handleConfirmMockSave = () => {
    setShowProtoModal(false);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  // Convert final score (Khosh) to official Arabic Al Bayan predicate
  const getAlBayan = (score: number): string => {
    if (score >= 9) return 'الجيد الأول';
    if (score >= 8) return 'الجيد الثاني';
    if (score >= 7) return 'المتوسط الأول';
    if (score >= 6) return 'المتوسط الثاني';
    return 'الرديء';
  };

  const waliKelasName = sessionData?.user?.name || 'Wali Kelas';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className="pb-6 w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center neumorph-pressed shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Input Nilai Ujian Semester</h1>
            <p className="text-xs text-slate-500 font-medium">Pengisian Nilai Akhir Semester (Format Spreadsheet Resmi)</p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {isSaved && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl mb-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">Semua nilai berhasil disinkronisasi! (Mode Simulasi)</span>
        </motion.div>
      )}

      {/* Selector Kitab */}
      <GlassCard variant="neumorph" className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Mata Pelajaran / Kitab</span>
            <select
              value={selectedKitab}
              onChange={(e) => setSelectedKitab(e.target.value)}
              className="w-full sm:w-64 mt-1 neumorph-pressed rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none font-bold"
            >
              <option value="Mukhtashor Jiddan">Mukhtashor Jiddan (Nahwu)</option>
              <option value="Sullamut Taufiq">Sullamut Taufiq (Fiqih)</option>
              <option value="Khoridatul Bahiyyah">Khoridatul Bahiyyah (Tauhid)</option>
            </select>
          </div>
          <div className="text-xs font-semibold text-slate-400 text-right sm:self-end">
            Wali Kelas: <span className="text-slate-700 font-bold">{waliKelasName} (Bagian A)</span>
          </div>
        </div>
      </GlassCard>

      {/* Spreadsheet Container */}
      <GlassCard variant="neumorph" className="p-0 overflow-hidden border border-slate-200/60 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-44">Nama Santri</th>
                <th className="py-3 px-4 w-20 text-center">Nilai Tamrin</th>
                <th className="py-3 px-4 w-20 text-center">Nilai Ujian</th>
                <th className="py-3 px-4 w-20 text-center">Khosh (Rapor)</th>
                <th className="py-3 px-4 w-28 text-center font-arabic">البيان (Al-Bayan)</th>
                <th className="py-3 px-4">Catatan Perkembangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-xs">
              {grades.map((grade, index) => {
                // Calculate Khosh automatically using Bab 2 & Bab 4 rounding rules
                const khoshRaw = (grade.tamrin + grade.ujian) / 2;
                const finalKhosh = Math.round(khoshRaw); // Math.round handles < 0.5 down, >= 0.5 up
                
                let scoreColor = 'text-slate-800';
                if (finalKhosh >= 8) scoreColor = 'text-emerald-600 font-bold';
                else if (finalKhosh < 6) scoreColor = 'text-red-500 font-bold';

                return (
                  <tr key={grade.santriId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-center text-xs font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{grade.namaLengkap}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{grade.nisn}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-600">
                      {grade.tamrin}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="4"
                        max="9"
                        value={grade.ujian}
                        onChange={(e) => handleCellChange(index, 'ujian', e.target.value)}
                        className="w-14 h-9 text-center neumorph-pressed rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-300/30 outline-none"
                      />
                    </td>
                    <td className={`py-3 px-4 text-center text-xs font-bold ${scoreColor}`}>
                      {finalKhosh}
                    </td>
                    <td className="py-3 px-4 text-center text-[11px] font-bold text-blue-700 bg-blue-50/40 font-arabic">
                      {getAlBayan(finalKhosh)}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={grade.catatan}
                        onChange={(e) => handleCellChange(index, 'catatan', e.target.value)}
                        placeholder="Catatan..."
                        className="w-full h-9 px-3 neumorph-pressed rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-blue-300/30 outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Save Button */}
      <PremiumButton
        onClick={handleSaveGrades}
        className="w-full h-12 shadow-floating"
        leftIcon={<Save className="w-5 h-5" />}
      >
        Simpan & Kunci Nilai
      </PremiumButton>

      {/* Prototype Modal */}
      <PrototypeModal 
        isOpen={showProtoModal} 
        onClose={handleConfirmMockSave} 
        featureName="Simpan & Kunci Nilai Ujian Semester" 
      />
    </motion.div>
  );
};
