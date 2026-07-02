import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Shield, MapPin, ChevronRight } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { signOut, useSession } from '../../lib/auth.client';
import { useNavigate } from 'react-router';
import { PrototypeModal } from '../../components/ui/PrototypeModal';

export const ProfilPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessionData } = useSession();
  const [showProtoModal, setShowProtoModal] = useState(false);
  const [protoFeature, setProtoFeature] = useState('');

  const user = {
    name: sessionData?.user?.name || 'Pengajar',
    role: 'Mustahiq (Wali Kelas)',
    nipg: 'MPHM-2026-0001',
    assignedClass: 'Bagian A (Lokal 01)',
    email: sessionData?.user?.email || '',
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const triggerPrototype = (feature: string) => {
    setProtoFeature(feature);
    setShowProtoModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className="pb-6 max-w-xl mx-auto"
    >
      {/* User Profile Card */}
      <GlassCard variant="neumorph" className="p-6 text-center flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full neumorph flex items-center justify-center p-1.5 mb-4 relative">
          <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-3xl font-extrabold text-blue-700">
            {user.name.charAt(0)}
          </div>
        </div>

        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">{user.name}</h1>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-1 mb-2">
          {user.role}
        </span>
        <p className="text-xs text-slate-500 font-medium">{user.email}</p>
      </GlassCard>

      {/* Account Info Details */}
      <div className="flex flex-col gap-3 mb-6">
        <span className="text-xs font-bold text-slate-500">Detail Pengajar</span>

        <GlassCard variant="neumorph" className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center neumorph-pressed shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium">NIPG Pengajar</span>
              <span className="text-sm font-bold text-slate-800">{user.nipg}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="neumorph" className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center neumorph-pressed shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium">Kelas Binaan</span>
              <span className="text-sm font-bold text-slate-800">{user.assignedClass}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Application Settings & Logout */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-500">Sistem & Keamanan</span>

        <GlassCard 
          variant="neumorph" 
          hoverEffect 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => triggerPrototype('Ubah Kata Sandi')}
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-bold text-slate-700">Ubah Kata Sandi</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </GlassCard>

        <PremiumButton
          variant="secondary"
          onClick={handleLogout}
          className="w-full mt-4 text-red-600 border border-red-200 hover:bg-red-50 py-3"
          leftIcon={<LogOut className="w-5 h-5 text-red-500" />}
        >
          Keluar dari Aplikasi
        </PremiumButton>
      </div>

      {/* Prototype Modal */}
      <PrototypeModal 
        isOpen={showProtoModal} 
        onClose={() => setShowProtoModal(false)} 
        featureName={protoFeature} 
      />
    </motion.div>
  );
};
