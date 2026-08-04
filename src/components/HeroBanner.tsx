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
    <div id="hero-banner-section" className="relative overflow-hidden bg-[#050505] border-b border-emerald-900/30 text-white py-8 sm:py-12 px-3 sm:px-6 lg:px-8">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Main Hero Copy (Left 7 cols) */}
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

              <button
                onClick={() => onSelectProductGroup('memberships')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-amber-400 text-black font-black uppercase text-xs tracking-wider shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:bg-amber-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Membresías VIP (Oro 🟡)</span>
              </button>
            </div>
          </div>

          {/* Right Highlight Card - GOLD PROMO FEATURE */}
          <div className="lg:col-span-5">
            <div id="gold-promo-card-hero" className="relative p-0.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
              <div className="bg-[#0a0a0a] rounded-[14px] p-6 text-white space-y-4">
                
                {/* Exclusive Gold Badge Tag */}
                <div className="flex items-center justify-between">
                  <div className="bg-amber-400 text-black text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    OFERTA DORADA VIP
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-400/80 tracking-widest">Soporte TunTun Store 🇪🇨</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30">
                    <DiamondIcon size="lg" variant="gold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase text-amber-400 leading-tight">
                      Membresía Mensual VIP
                    </h2>
                    <p className="text-xs font-bold text-amber-400/70 uppercase tracking-tight">
                      2,600 Diamantes Totales + Badge
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-amber-400/30 space-y-2 text-xs font-bold">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" /> 70 Diamantes diarios x 30 días
                    </span>
                    <span className="text-amber-400">2,100💎</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" /> Bono instantáneo de compra
                    </span>
                    <span className="text-amber-400">+500💎</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" /> Marco Especial Perfil
                    </span>
                    <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black uppercase">
                      EXCLUSIVO
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-white/40 line-through mr-2 font-bold">$14.99</span>
                    <span className="text-3xl font-black text-amber-400">$10.99</span>
                  </div>

                  <button
                    onClick={() => onSelectProductGroup('memberships')}
                    className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Adquirir Membresía 🟡
                  </button>
                </div>

                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest text-center border-t border-amber-500/20 pt-2 flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Acreditación Garantizada TunTun Store</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
