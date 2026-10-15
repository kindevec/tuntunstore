import React, { useState } from 'react';
import { AlertTriangle, Wrench, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { MAINTENANCE_CONFIG } from '../config/maintenance';

interface MaintenanceBannerProps {
  isAdmin?: boolean;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ isAdmin = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!MAINTENANCE_CONFIG.enabled) return null;

  const handleWhatsAppSupport = () => {
    const phone = '593968729952';
    const msg = 'Hola TunTun Store, deseo consultar información mientras la tienda está en mantenimiento.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      role="alert" 
      aria-live="polite"
      className="w-full bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-yellow-950/90 border-b border-amber-500/50 text-white shadow-[0_4px_25px_rgba(245,158,11,0.25)] relative z-40 backdrop-blur-md transition-all"
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Main Info */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Wrench className="w-4 h-4 animate-spin-slow" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/50 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  {MAINTENANCE_CONFIG.badge}
                </span>

                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black uppercase text-emerald-300">
                    Modo Admin (Acceso Habilitado)
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-100 font-semibold tracking-tight mt-0.5 leading-snug">
                {MAINTENANCE_CONFIG.message}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleWhatsAppSupport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 hover:text-emerald-200 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
              title="Atención al cliente por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Soporte WhatsApp</span>
            </button>

            {MAINTENANCE_CONFIG.details && (
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                aria-expanded={showDetails}
              >
                <span>{showDetails ? 'Ocultar' : 'Detalles'}</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible details */}
        {showDetails && MAINTENANCE_CONFIG.details && (
          <div className="mt-2.5 pt-2.5 border-t border-amber-500/20 text-xs text-amber-100/90 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {MAINTENANCE_CONFIG.details}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
