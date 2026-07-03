import React from 'react';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string; // e.g. max-w-3xl, max-w-md, max-w-xl
  onSubmit?: (e: React.FormEvent) => void;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidthClass = 'max-w-3xl',
  onSubmit
}: ModalProps) => {
  if (!isOpen) return null;

  const content = (
    <GlassCard 
      variant="neumorph" 
      className={`w-full ${maxWidthClass} max-h-[90vh] flex flex-col p-6 border border-white/60 overflow-hidden shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4 shrink-0">
        <h3 className="font-extrabold text-slate-800 text-base">
          {title}
        </h3>
        <button 
          type="button"
          onClick={onClose} 
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors group"
        >
          <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
        </button>
      </div>

      {/* Body */}
      {onSubmit ? (
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-1.5 py-1 space-y-4">
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-6 shrink-0">
              {footer}
            </div>
          )}
        </form>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-1.5 py-1 space-y-4">
            {children}
          </div>
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-6 shrink-0">
              {footer}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      {content}
    </div>
  );
};
