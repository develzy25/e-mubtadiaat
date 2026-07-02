import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, X, CheckCircle, Printer } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { SANTRI_LIRBOYO_SEED } from '../../mocks/santri.seed';
import { PrototypeModal } from '../../components/ui/PrototypeModal';

interface StudentReport {
  id: string;
  name: string;
  nisn: string;
  class: string;
  lokal: string;
  kamar: string;
  tamrin: number;
  ujian: number;
  khosh: number;
  alBayan: string;
  akhlaq: number;
  izin: number;
  alpha: number;
  statusKenaikan: string;
}

export const ERaportPage: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(null);
  const [showProtoModal, setShowProtoModal] = useState(false);

  // Compile student report card mock records
  const reports: StudentReport[] = SANTRI_LIRBOYO_SEED.filter(
    (s) => s.bagianClass === 'Bagian A'
  ).map((s) => {
    const tamrinVal = 8;
    const ujianVal = 7;
    const khoshVal = Math.round((tamrinVal + ujianVal) / 2);
    return {
      id: s.id,
      name: s.namaLengkap,
      nisn: s.nisn,
      class: s.bagianClass,
      lokal: 'Lokal 01',
      kamar: s.asramaKamar,
      tamrin: tamrinVal,
      ujian: ujianVal,
      khosh: khoshVal,
      alBayan: khoshVal >= 8 ? 'الجيد الثاني' : 'المتوسط الأول',
      akhlaq: 8,
      izin: 2,
      alpha: 0,
      statusKenaikan: 'Naik Kelas',
    };
  });

  const handlePrintRaport = () => {
    setShowProtoModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className="pb-6 w-full max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center neumorph-pressed shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">E-Raport Santri</h1>
          <p className="text-xs text-slate-500 font-medium">Cetak & Preview Raport Digital Bagian A</p>
        </div>
      </div>

      {/* Student List */}
      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <GlassCard key={report.id} variant="neumorph" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 neumorph-pressed">
                {report.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-slate-800">{report.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">NISN: {report.nisn} • {report.kamar}</span>
              </div>
            </div>

            <PremiumButton
              onClick={() => setSelectedStudent(report)}
              variant="ghost"
              className="h-9 px-3 text-xs"
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Lihat Rapor
            </PremiumButton>
          </GlassCard>
        ))}
      </div>

      {/* Modal Preview Raport */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#F0F4F8] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/60 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full neumorph flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Rapor Header */}
              <div className="text-center mb-6 pt-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Raport Ujian Semester</span>
                <h2 className="text-base font-extrabold text-slate-800 mt-1">{selectedStudent.name}</h2>
                <p className="text-[10px] text-slate-400 font-medium">NISN: {selectedStudent.nisn} • {selectedStudent.class} ({selectedStudent.lokal})</p>
              </div>

              {/* Grades Table preview */}
              <div className="flex flex-col gap-2.5 mb-6">
                <div className="flex justify-between items-center text-xs p-3 rounded-xl neumorph-pressed">
                  <span className="font-extrabold text-slate-600">Nilai Tamrin</span>
                  <span className="font-bold text-slate-800">{selectedStudent.tamrin}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl neumorph-pressed">
                  <span className="font-extrabold text-slate-600">Nilai Ujian Semester</span>
                  <span className="font-bold text-slate-800">{selectedStudent.ujian}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-blue-500/5 border border-blue-200">
                  <span className="font-extrabold text-blue-700">Nilai Rapor (Khosh)</span>
                  <span className="font-extrabold text-blue-800 text-sm">{selectedStudent.khosh}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-emerald-500/5 border border-emerald-200">
                  <span className="font-extrabold text-emerald-700 font-arabic">البيان (Al-Bayan)</span>
                  <span className="font-extrabold text-emerald-800 font-arabic">{selectedStudent.alBayan}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl neumorph-pressed">
                  <span className="font-extrabold text-slate-600">Nilai Akhlaq</span>
                  <span className="font-bold text-slate-800">{selectedStudent.akhlaq}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl neumorph-pressed">
                  <span className="font-extrabold text-slate-600">Kehadiran (Izin / Alpha)</span>
                  <span className="font-bold text-slate-800">{selectedStudent.izin} / {selectedStudent.alpha} Hari</span>
                </div>
              </div>

              {/* Promoting status banner */}
              <div className="bg-emerald-100/60 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-extrabold text-emerald-700 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Kenaikan Kelas</span>
                </div>
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px]">
                  {selectedStudent.statusKenaikan}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <PremiumButton
                  onClick={handlePrintRaport}
                  variant="secondary"
                  className="flex-1 text-xs"
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Cetak Raport
                </PremiumButton>
                <PremiumButton
                  onClick={() => setSelectedStudent(null)}
                  variant="primary"
                  className="flex-1 text-xs"
                >
                  Tutup
                </PremiumButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prototype Modal */}
      <PrototypeModal 
        isOpen={showProtoModal} 
        onClose={() => setShowProtoModal(false)} 
        featureName="Cetak Raport Fisik PDF" 
      />
    </motion.div>
  );
};
