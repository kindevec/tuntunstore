import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, ShieldCheck, Zap } from 'lucide-react';
import { useInstallPWA } from '../hooks/useInstallPWA';
import { useIsPWA } from '../hooks/useIsPWA';

interface PWATopBarProps {
  visible?: boolean;
  onTriggerInstall?: () => void;
}

export const PWATopBar: React.FC<PWATopBarProps> = ({ visible = true, onTriggerInstall }) => {
  const { isInstalled } = useInstallPWA();
  const isPWA = useIsPWA();

  const handleBarClick = useCallback(() => {
    onTriggerInstall?.();
  }, [onTriggerInstall]);

  // Si ya está instalada o se está ejecutando como PWA autónoma, no mostrar la barra
  if (isInstalled || isPWA) return null;

  return (
    <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div 
              id="pwa-top-bar"
              onClick={handleBarClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBarClick(); }}
              className="w-full bg-gradient-to-r from-[#023326] via-[#057a55] to-[#022c22] text-white text-xs py-1.5 px-3 sm:px-6 lg:px-8 font-medium flex items-center justify-between cursor-pointer group hover:brightness-110 active:brightness-95 transition-all border-b border-emerald-400/40 shadow-[0_2px_15px_rgba(16,185,129,0.3)] relative overflow-hidden select-none"
              title="Toca aquí para instalar la App Web de TunTun Store"
            >
              {/* Shimmer / Destello sutil al pasar el mouse */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

        <div className="w-full flex items-center justify-between text-center sm:text-left gap-2 sm:gap-4">
          {/* Lado Izquierdo: Badge Cyber + Texto Promocional */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Badge APP WEB — Estilo Cyber Gamer con baliza viva */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-black/80 via-[#062c1d]/90 to-black/80 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.25)] shrink-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
              </span>
              <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                APP WEB
              </span>
            </div>

            {/* Texto en móviles (compacto y directo) */}
            <span className="inline sm:hidden truncate text-[11px] font-bold text-white group-hover:text-emerald-100 transition-colors">
              ¡Instala TunTun App Web! Recargas en 1 clic y más rápido
            </span>

            {/* Texto en pantallas medianas y grandes */}
            <span className="hidden sm:inline truncate text-[11px] lg:text-xs font-semibold text-white tracking-tight group-hover:text-emerald-50 transition-colors">
              Descarga gratis la <strong className="text-amber-300 font-black underline decoration-amber-400/60 decoration-2 underline-offset-2">App Web Oficial TunTun Store</strong> — Recargas instantáneas, ofertas exclusivas y acceso directo
            </span>
          </div>

          {/* Lado Derecho: Beneficios + Botón CTA de descarga */}
          <div className="hidden md:flex items-center gap-3 xl:gap-4 text-[11px] shrink-0">
            <div className="flex items-center gap-3 pr-3 border-r border-emerald-400/30 text-emerald-100 font-medium">
              <span className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                100% Gratis & Seguro
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                Acreditación Inmediata
              </span>
            </div>

            {/* Botón CTA llamativo estilo botón dorado */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-black font-black text-[11px] uppercase tracking-wider rounded-lg shadow-[0_0_12px_rgba(245,158,11,0.5)] group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(245,158,11,0.8)] transition-all">
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Instalar App Web</span>
            </div>
          </div>

          {/* Botón CTA mini en móviles */}
          <div className="flex md:hidden items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black text-[10px] uppercase tracking-wider rounded-md shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            <Download className="w-3 h-3 stroke-[2.5]" />
            <span>Instalar</span>
          </div>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

  );
};

export default PWATopBar;
