import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Search, PlusCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { SoftInput } from '../../components/ui/SoftInput';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { SANTRI_LIRBOYO_SEED, type Santri } from '../../mocks/santri.seed';
import { PrototypeModal } from '../../components/ui/PrototypeModal';

export const MemorizationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [nadzomTitle, setNadzomTitle] = useState('Tuhfatul Athfal');
  const [baitInput, setBaitInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showProtoModal, setShowProtoModal] = useState(false);

  const filteredSantri = SANTRI_LIRBOYO_SEED.filter((s) =>
    s.bagianClass === 'Bagian A' && (
      s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm)
    )
  );

  const handleSaveSetoran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri || !baitInput) return;

    setShowProtoModal(true);
  };

  const handleConfirmMockSave = () => {
    setShowProtoModal(false);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setSelectedSantri(null);
      setBaitInput('');
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className="pb-6 max-w-xl mx-auto"
    >
      {/* Page Title Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center neumorph-pressed shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Setoran Nadzom</h1>
          <p className="text-xs text-slate-500 font-medium">Input & Monitoring Setoran Bait Nadzom Kitab</p>
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
          <span className="text-sm font-semibold">Setoran Nadzom berhasil disimpan! (Mode Simulasi)</span>
        </motion.div>
      )}

      {/* Form Input Setoran Nadzom */}
      {selectedSantri ? (
        <GlassCard variant="neumorph" className="p-5 mb-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Santri Terpilih</span>
              <h2 className="text-base font-bold text-slate-800">{selectedSantri.namaLengkap}</h2>
              <span className="text-xs text-slate-500">{selectedSantri.bagianClass} - {selectedSantri.asramaKamar}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSantri(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Ganti Santri
            </button>
          </div>

          <form onSubmit={handleSaveSetoran} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Kitab Nadzom</label>
              <select
                value={nadzomTitle}
                onChange={(e) => setNadzomTitle(e.target.value)}
                className="w-full neumorph-pressed rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-300/30"
              >
                <option value="Tuhfatul Athfal">Tuhfatul Athfal (61 Bait)</option>
                <option value="Khoridatul Bahiyyah">Khoridatul Bahiyyah (100 Bait)</option>
              </select>
            </div>

            <SoftInput
              label="Jumlah Bait Disetorkan"
              type="number"
              value={baitInput}
              onChange={(e) => setBaitInput(e.target.value)}
              placeholder="Contoh: 15 (bait 110 - 125)"
              leftIcon={<BookOpen className="w-5 h-5" />}
              required
            />

            <div className="flex gap-3 mt-2">
              <PremiumButton
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedSantri(null)}
              >
                Batal
              </PremiumButton>
              <PremiumButton
                type="submit"
                variant="primary"
                className="flex-1"
                leftIcon={<PlusCircle className="w-5 h-5" />}
              >
                Simpan Setoran
              </PremiumButton>
            </div>
          </form>
        </GlassCard>
      ) : (
        /* Search & Select Santri List */
        <div className="flex flex-col gap-4">
          <SoftInput
            label="Cari Santri Putri"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ketik nama santri..."
            leftIcon={<Search className="w-5 h-5" />}
          />

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-500">Pilih Santri untuk Input Setoran</span>
            {filteredSantri.map((santri) => (
              <GlassCard
                key={santri.id}
                variant="neumorph"
                hoverEffect
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedSantri(santri)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full neumorph flex items-center justify-center font-bold text-blue-700 shrink-0">
                    {santri.namaLengkap.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{santri.namaLengkap}</span>
                    <span className="text-xs text-slate-500">{santri.bagianClass} • {santri.asramaKamar}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {santri.setoranNadzomTerakhir?.baitCompleted || 0} Bait
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {santri.setoranNadzomTerakhir?.kitabNadzom || 'Belum ada'}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Prototype Modal */}
      <PrototypeModal 
        isOpen={showProtoModal} 
        onClose={handleConfirmMockSave} 
        featureName="Simpan Setoran Nadzom Ke Database" 
      />
    </motion.div>
  );
};
