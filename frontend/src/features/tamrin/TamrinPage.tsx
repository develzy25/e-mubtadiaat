import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save, CheckCircle2, FileText } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { SANTRI_LIRBOYO_SEED } from '../../mocks/santri.seed';
import { PrototypeModal } from '../../components/ui/PrototypeModal';

interface TamrinSchedule {
  id: string;
  tamrinKe: number;
  kitab: string;
  bagianClass: string;
  lokalRoom: string;
  waktu: string;
  status: 'Draft' | 'Terjadwal' | 'Berlangsung' | 'Selesai' | 'Ditutup';
}

interface StudentTamrinInput {
  santriId: string;
  namaLengkap: string;
  nisn: string;
  kehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Udzur Syar\'i' | 'Belum Mengikuti';
  nilai: number; // 4 - 9
  catatan: string;
}

export const TamrinPage: React.FC = () => {
  // Mock Tamrin schedules for Charis Wahyudi (Bagian A, Lokal 01)
  const mockSchedules: TamrinSchedule[] = [
    {
      id: 'tmr-001',
      tamrinKe: 1,
      kitab: 'Mukhtashor Jiddan',
      bagianClass: 'Bagian A',
      lokalRoom: 'Lokal 01',
      waktu: 'Sabtu, Hishah 1 (07:30 - 08:30)',
      status: 'Berlangsung',
    },
    {
      id: 'tmr-002',
      tamrinKe: 2,
      kitab: 'Sullamut Taufiq',
      bagianClass: 'Bagian A',
      lokalRoom: 'Lokal 01',
      waktu: 'Sabtu, Hishah 2 (09:00 - 10:00)',
      status: 'Terjadwal',
    },
  ];

  const [selectedSchedule, setSelectedSchedule] = useState<TamrinSchedule | null>(null);
  const [inputs, setInputs] = useState<StudentTamrinInput[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [showProtoModal, setShowProtoModal] = useState(false);

  const handleSelectSchedule = (sched: TamrinSchedule) => {
    setSelectedSchedule(sched);
    // Initialize student input list matching Bagian A
    setInputs(
      SANTRI_LIRBOYO_SEED.filter((s) => s.bagianClass === 'Bagian A').map((s) => ({
        santriId: s.id,
        namaLengkap: s.namaLengkap,
        nisn: s.nisn,
        kehadiran: 'Hadir',
        nilai: 7, // Default mid value (4 - 9 scale)
        catatan: '',
      }))
    );
  };

  const handleValueChange = (
    index: number,
    field: 'kehadiran' | 'nilai' | 'catatan',
    val: string | number
  ) => {
    const updated = [...inputs];
    if (field === 'nilai') {
      let num = typeof val === 'string' ? parseInt(val, 10) : val;
      if (isNaN(num) || num < 4) num = 4;
      if (num > 9) num = 9;
      updated[index].nilai = num;
    } else if (field === 'kehadiran') {
      updated[index].kehadiran = val as any;
      // If student is not present, value of grade is set to min (4) automatically
      if (val !== 'Hadir') {
        updated[index].nilai = 4;
      }
    } else {
      updated[index].catatan = val as string;
    }
    setInputs(updated);
  };

  const handleSaveTamrin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProtoModal(true);
  };

  const handleConfirmMockSave = () => {
    setShowProtoModal(false);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setSelectedSchedule(null);
    }, 2000);
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
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Pelaksanaan Tamrin</h1>
          <p className="text-xs text-slate-500 font-medium">Pengisian Nilai Tamrin Berkala Ustadzah</p>
        </div>
      </div>

      {isSaved && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl mb-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">Data Tamrin berhasil disimpan! (Mode Simulasi)</span>
        </motion.div>
      )}

      {selectedSchedule ? (
        /* Student Input List for Selected Tamrin */
        <GlassCard variant="neumorph" className="p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Tamrin Ke-{selectedSchedule.tamrinKe} • {selectedSchedule.kitab}
              </span>
              <h2 className="text-sm font-extrabold text-slate-700 mt-0.5">{selectedSchedule.waktu}</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSchedule(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Kembali
            </button>
          </div>

          <form onSubmit={handleSaveTamrin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {inputs.map((input, idx) => (
                <div key={input.santriId} className="p-3.5 rounded-2xl neumorph-pressed flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                        {input.namaLengkap.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-extrabold text-slate-800 truncate">{input.namaLengkap}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{input.nisn}</span>
                      </div>
                    </div>

                    {/* Nilai Input (Strict 4 - 9 scale) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500">Nilai:</span>
                      <input
                        type="number"
                        min="4"
                        max="9"
                        disabled={input.kehadiran !== 'Hadir'}
                        value={input.nilai}
                        onChange={(e) => handleValueChange(idx, 'nilai', e.target.value)}
                        className="w-11 h-9 text-center bg-white rounded-lg text-xs font-extrabold text-slate-800 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-300/30"
                      />
                    </div>
                  </div>

                  {/* Presence Selector & Comment Row */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <div className="flex-1">
                      <select
                        value={input.kehadiran}
                        onChange={(e) => handleValueChange(idx, 'kehadiran', e.target.value)}
                        className="w-full h-9 px-2 text-[11px] font-bold bg-white border border-slate-200 rounded-lg text-slate-700 outline-none"
                      >
                        <option value="Hadir">Hadir</option>
                        <option value="Izin">Izin</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Alpa">Alpa</option>
                        <option value="Udzur Syar'i">Udzur Syar'i</option>
                        <option value="Belum Mengikuti">Belum Mengikuti</option>
                      </select>
                    </div>

                    <div className="flex-2">
                      <input
                        type="text"
                        placeholder="Catatan mustahiq..."
                        value={input.catatan}
                        onChange={(e) => handleValueChange(idx, 'catatan', e.target.value)}
                        className="w-full h-9 px-3 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-2">
              <PremiumButton
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedSchedule(null)}
              >
                Batal
              </PremiumButton>
              <PremiumButton
                type="submit"
                variant="primary"
                className="flex-1"
                leftIcon={<Save className="w-5 h-5" />}
              >
                Simpan Tamrin
              </PremiumButton>
            </div>
          </form>
        </GlassCard>
      ) : (
        /* Select Active Tamrin Schedule */
        <div className="flex flex-col gap-4">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">
            Jadwal Pelaksanaan Tamrin Hari Ini
          </span>

          <div className="flex flex-col gap-3">
            {mockSchedules.map((sched) => (
              <GlassCard
                key={sched.id}
                variant="neumorph"
                hoverEffect
                className="p-4 flex items-center justify-between cursor-pointer border-l-4 border-l-blue-500"
                onClick={() => handleSelectSchedule(sched)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">
                      Tamrin Ke-{sched.tamrinKe} • {sched.kitab}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {sched.waktu}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {sched.status}
                </span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Prototype Modal */}
      <PrototypeModal 
        isOpen={showProtoModal} 
        onClose={handleConfirmMockSave} 
        featureName="Simpan Tamrin Harian" 
      />
    </motion.div>
  );
};
