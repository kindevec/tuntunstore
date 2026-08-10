import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X } from 'lucide-react';

interface AdminConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      border: 'border-red-500/40',
      iconBg: 'bg-red-500/20 text-red-400',
      icon: <AlertCircle className="w-6 h-6" />,
      btnBg: 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    },
    warning: {
      border: 'border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
      icon: <AlertTriangle className="w-6 h-6" />,
      btnBg: 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    },
    info: {
      border: 'border-cyan-500/40',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      icon: <Info className="w-6 h-6" />,
      btnBg: 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    },
    success: {
      border: 'border-emerald-500/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      icon: <CheckCircle2 className="w-6 h-6" />,
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md bg-[#0a0a0a] rounded-2xl border ${style.border} p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${style.iconBg} shrink-0`}>
              {style.icon}
            </div>
            <h3 className="text-lg font-black uppercase text-white tracking-tight leading-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-zinc-300 font-medium leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${style.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
