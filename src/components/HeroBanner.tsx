import React from 'react';
import { DiamondIcon } from './DiamondIcon';
import { ShieldCheck, Zap, CreditCard, Sparkles, Trophy, Flame, ChevronRight, Check } from 'lucide-react';

interface HeroBannerProps {
  onSelectProductGroup: (category: 'diamonds' | 'memberships' | 'promos') => void;
  onOpenQuickIDCheck: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectProductGroup,
  onOpenQuickIDCheck,
}) => {
  return (
    <div id="hero-banner-section" className="relative overflow-hidden bg-[#050505] text-white py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              <span>SISTEMA AUTOMÁTICO • ID DE JUGADOR</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight sm:leading-none text-white">
              RECARGA DIAMANTES <br className="hidden sm:inline" />
              <span className="text-emerald-500">TUNTUN STORE 💎</span>
            </h1>

            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl leading-relaxed uppercase font-semibold tracking-wider">
              Acreditación directa a tu ID de Juego. Sin contraseñas • 100% Garantizado en Ecuador 🇪🇨
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <div className="flex items-center gap-2 bg-[#0a0a0a] p-2.5 sm:p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-xs uppercase tracking-tight text-white">100% Seguro</p>
                  <p className="text-[10px] text-emerald-500/80 uppercase font-bold tracking-widest">Solo ID Juego</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#0a0a0a] p-2.5 sm:p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-xs uppercase tracking-tight text-white">5-15 Minutos</p>
                  <p className="text-[10px] text-emerald-500/80 uppercase font-bold tracking-widest">Entrega Rápida</p>
                </div>
              </div>

              <div className="xs:col-span-2 sm:col-span-1 flex items-center gap-2 bg-[#0a0a0a] p-2.5 sm:p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-xs uppercase tracking-tight text-white">Bancos Ecuador</p>
                  <p className="text-[10px] text-emerald-500/80 uppercase font-bold tracking-widest">Pichincha / Deuna</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons - Full width on mobile for easy tapping */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => onSelectProductGroup('diamonds')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 text-black font-black uppercase text-xs tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <DiamondIcon size="sm" variant="emerald" />
                <span>Ver Catálogo Diamantes</span>
                <ChevronRight className="w-4 h-4 text-black stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Right Logo Banner */}
          <div className="hidden lg:flex lg:col-span-5 justify-center relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <img 
              src="/logo-transparent.webp" 
              alt="TunTun Store" 
              className="w-full max-w-[380px] object-contain drop-shadow-[0_0_50px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform duration-700" 
            />
          </div>

        </div>
      </div>
    </div>
  );
};
