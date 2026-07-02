import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, MapPin, Search } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { SoftInput } from '../../components/ui/SoftInput';
import { SANTRI_LIRBOYO_SEED } from '../../mocks/santri.seed';
import { useSession } from '../../lib/auth.client';

export const KelasPage: React.FC = () => {
  const { data: sessionData } = useSession();

  const mockMustahiq = {
    name: sessionData?.user?.name || 'Pengajar',
    role: 'Mustahiq',
    bagianClass: 'Bagian A',
    lokalRoom: 'Lokal 01',
  };

  const [searchTerm, setSearchTerm] = useState('');

  // Lock to Mustahiq's assigned class
  const selectedBagian = mockMustahiq.bagianClass;
  const selectedLokal = mockMustahiq.lokalRoom;

  const classSantri = SANTRI_LIRBOYO_SEED.filter(
    (s) => s.bagianClass === selectedBagian &&
    (s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className="pb-6 max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center neumorph-pressed shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Kelas Binaan Saya</h1>
          <p className="text-xs text-slate-500 font-medium">Manajemen Kelas & Daftar Santri Putri</p>
        </div>
      </div>

      {/* Selected Class Banner Info */}
      <GlassCard variant="neumorph" className="p-4 mb-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Kelas Binaan Aktif</span>
            <h2 className="text-lg font-extrabold text-slate-800 mt-0.5">{selectedBagian}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> {selectedLokal}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> {classSantri.length} Santri Binaan
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              Wali Kelas: {mockMustahiq.name}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Search Input */}
      <div className="mb-6">
        <SoftInput
          label="Cari Santri di Kelas Binaan"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ketik nama santri..."
          leftIcon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Santri List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Daftar Santri Binaan</span>
          <span className="text-xs font-bold text-slate-400">Total: {classSantri.length}</span>
        </div>
        {classSantri.length > 0 ? (
          classSantri.map((santri) => (
            <GlassCard key={santri.id} variant="neumorph" className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full neumorph flex items-center justify-center font-bold text-blue-700 shrink-0">
                  {santri.namaLengkap.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">{santri.namaLengkap}</span>
                  <span className="text-xs text-slate-500 font-medium">NISN: {santri.nisn} • {santri.asramaKamar}</span>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Aktif
              </span>
            </GlassCard>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm font-semibold neumorph rounded-2xl">
            Tidak ada santri ditemukan di kelas ini.
          </div>
        )}
      </div>
    </motion.div>
  );
};
