import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWABottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const PWABottomSheet: React.FC<PWABottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = '88vh',
}) => {
  // Manejo de tecla Escape y bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerHaptic('light');
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center select-none">
          {/* Fondo oscuro con desenfoque suave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Contenedor del Drawer deslizante */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{ maxHeight }}
            className="relative w-full max-w-lg bg-gradient-to-b from-[#091a14] via-[#05130e] to-[#020b08] border-t border-emerald-500/30 rounded-t-[28px] shadow-[0_-12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(16,185,129,0.12)] flex flex-col z-10 overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra de arrastre táctil superior */}
            <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-zinc-600/70 rounded-full" />
            </div>

            {/* Cabecera del Bottom Sheet */}
            {(title || subtitle) && (
              <div className="flex items-center justify-between px-5 pt-1 pb-3 border-b border-emerald-950/60">
                <div className="min-w-0 pr-3">
                  {title && (
                    <h3 className="text-white text-base font-black tracking-tight truncate">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-emerald-300/80 text-xs mt-0.5 truncate">
                      {subtitle}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Contenido scrolleable del Bottom Sheet */}
            <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain pb-[calc(env(safe-area-inset-bottom,0px)+28px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
