import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { GlassCard } from './GlassCard';

export const NotificationRenderer = () => {
  const { toasts, confirmDialog, dismissToast } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getGradient = (type: string) => {
    switch (type) {
      case 'success':
        return 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20';
      case 'error':
        return 'from-rose-500/10 to-red-500/5 border-rose-500/20';
      case 'warning':
        return 'from-amber-500/10 to-orange-500/5 border-amber-500/20';
      default:
        return 'from-blue-500/10 to-indigo-500/5 border-blue-500/20';
    }
  };

  return (
    <>
      {/* Toast Notifications Container */}
      <div className="fixed top-5 right-5 z-9999 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="pointer-events-auto"
            >
              <GlassCard
                variant="neumorph"
                className={`flex items-start gap-3 p-4 border bg-white/75 backdrop-blur-md rounded-2xl shadow-[5px_5px_15px_rgba(0,0,0,0.05),-5px_-5px_15px_rgba(255,255,255,0.8)] border-white/60 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}
              >
                {/* 3D Glass overlay */}
                <div className={`absolute inset-0 bg-linear-to-br ${getGradient(toast.type)} -z-10`} />
                <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-blue-500 to-indigo-500" style={{
                  backgroundImage: toast.type === 'success' ? 'linear-gradient(to bottom, #10b981, #14b8a6)' :
                                   toast.type === 'error' ? 'linear-gradient(to bottom, #f43f5e, #ef4444)' :
                                   toast.type === 'warning' ? 'linear-gradient(to bottom, #f59e0b, #f97316)' :
                                   'linear-gradient(to bottom, #3b82f6, #6366f1)'
                }} />

                {getIcon(toast.type)}

                <div className="flex-1 pr-4">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{toast.message}</p>
                </div>

                <button
                  onClick={() => dismissToast(toast.id)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100/50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialogs Container */}
      <AnimatePresence>
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-9998">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full max-w-sm"
            >
              <GlassCard
                variant="neumorph"
                className="p-6 border border-white/60 shadow-[20px_20px_60px_rgba(0,0,0,0.1),-20px_-20px_60px_rgba(255,255,255,0.8)] relative bg-white/80 backdrop-blur-md rounded-3xl"
              >
                {/* 3D Depth Top glow */}
                <div className="absolute top-0 inset-x-0 h-10 bg-linear-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl" />

                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide border-b border-slate-200/60 pb-3 mb-4">
                  {confirmDialog.title}
                </h3>
                
                <p className="text-xs text-slate-600 font-semibold leading-relaxed mb-6">
                  {confirmDialog.message}
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={confirmDialog.onCancel}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xs select-none active:scale-95 transition-transform"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmDialog.onConfirm}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 select-none active:scale-95 transition-transform"
                  >
                    Oke
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
