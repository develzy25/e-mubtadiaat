import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

interface PrototypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export const PrototypeModal: React.FC<PrototypeModalProps> = ({ isOpen, onClose, featureName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-9999 select-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-[#F0F4F8] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/60 relative text-center flex flex-col items-center"
          >
            {/* Close Icon Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full neumorph flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Info Container */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4 neumorph-pressed">
              <ShieldAlert className="w-7 h-7" />
            </div>

            {/* Header Title */}
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight mb-2">
              Fitur Prototipe Aktif
            </h3>

            {/* Feature Description */}
            <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6 px-2">
              {featureName ? (
                <>Fitur <span className="font-extrabold text-slate-800">"{featureName}"</span> saat ini masih dalam tahap pengembangan (prototipe).</>
              ) : (
                'Fungsi ini saat ini masih dalam tahap pengembangan (prototipe).'
              )}
              <br />
              Silakan konfirmasi kepada developer <span className="font-bold text-blue-600">DEVELZY</span> untuk aktivasi fitur ini secara penuh.
            </p>

            {/* Confirm Action Button */}
            <PremiumButton onClick={onClose} variant="primary" className="w-full h-11">
              Saya Mengerti
            </PremiumButton>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
