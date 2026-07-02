import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Save, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { SANTRI_LIRBOYO_SEED } from '../../mocks/santri.seed';
import { PrototypeModal } from '../../components/ui/PrototypeModal';

interface StudentSertifikat {
  santriId: string;
  namaLengkap: string;
  nisn: string;
  tajhizMayit: 'Lulus' | 'Belum';
  qiroatulKutub: number; // 4 - 9 score scale
  muhafadhah: number;   // 4 - 9 score scale
}

export const SertifikatPage: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [showProtoModal, setShowProtoModal] = useState(false);
  const [data, setData] = useState<StudentSertifikat[]>(
    SANTRI_LIRBOYO_SEED.filter((s) => s.bagianClass === 'Bagian A').map((s) => ({
      santriId: s.id,
      namaLengkap: s.namaLengkap,
      nisn: s.nisn,
      tajhizMayit: 'Lulus',
      qiroatulKutub: 8,
      muhafadhah: 7,
    }))
  );

  const handleCellChange = (
    index: number,
    field: 'tajhizMayit' | 'qiroatulKutub' | 'muhafadhah',
    val: string | number
  ) => {
    const updated = [...data];
    if (field === 'tajhizMayit') {
      updated[index].tajhizMayit = val as 'Lulus' | 'Belum';
    } else {
      let num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num) || num < 4) num = 4;
      if (num > 9) num = 9;
      updated[index][field] = num;
    }
    setData(updated);
  };

  const handleSave = (e: React.FormEvent) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className="pb-6 w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center neumorph-pressed shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Sertifikat & Kelulusan Praktik</h1>
          <p className="text-xs text-slate-500 font-medium">Input Nilai Ujian Khusus, Qiroatul Kutub & Muhafadhah</p>
        </div>
      </div>

      {isSaved && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl mb-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">Data sertifikat berhasil disinkronisasi! (Mode Simulasi)</span>
        </motion.div>
      )}

      {/* Info Card */}
      <GlassCard variant="neumorph" className="p-4 mb-6 text-xs text-slate-500 font-semibold border-l-4 border-l-teal-500">
        Mengacu pada **Bab 12 & 14 Blueprint Akademik**:
        Nilai sertifikasi hanya diambil dari komponen Ujian Khusus, Qiroatul Kutub, dan Muhafadhah (bukan nilai Tamrin harian).
      </GlassCard>

      {/* Spreadsheet Table */}
      <GlassCard variant="neumorph" className="p-0 overflow-hidden border border-slate-200/60 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-40">Nama Santri</th>
                <th className="py-3 px-4 w-28 text-center">Tajhiz Mayit (Praktik)</th>
                <th className="py-3 px-4 w-24 text-center">Qiroatul Kutub</th>
                <th className="py-3 px-4 w-24 text-center">Muhafadhah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-xs">
              {data.map((row, index) => (
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
                  <td className="py-2 px-3 text-center">
                    <select
                      value={row.tajhizMayit}
                      onChange={(e) => handleCellChange(index, 'tajhizMayit', e.target.value)}
                      className="w-24 h-9 px-2 text-[11px] font-bold bg-white border border-slate-200 rounded-lg text-slate-700 outline-none"
                    >
                      <option value="Lulus">Lulus</option>
                      <option value="Belum">Belum Lulus</option>
                    </select>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="number"
                      min="4"
                      max="9"
                      value={row.qiroatulKutub}
                      onChange={(e) => handleCellChange(index, 'qiroatulKutub', e.target.value)}
                      className="w-14 h-9 text-center neumorph-pressed rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-300/30 outline-none"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="number"
                      min="4"
                      max="9"
                      value={row.muhafadhah}
                      onChange={(e) => handleCellChange(index, 'muhafadhah', e.target.value)}
                      className="w-14 h-9 text-center neumorph-pressed rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-300/30 outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <PremiumButton
        onClick={handleSave}
        className="w-full h-12 shadow-floating"
        leftIcon={<Save className="w-5 h-5" />}
      >
        Simpan Nilai Sertifikasi
      </PremiumButton>

      {/* Prototype Modal */}
      <PrototypeModal 
        isOpen={showProtoModal} 
        onClose={handleConfirmMockSave} 
        featureName="Simpan Nilai Ujian Kelulusan Praktik" 
      />
    </motion.div>
  );
};
