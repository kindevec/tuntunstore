import React, { useState, useRef, useEffect } from 'react';
import { Product, HeroSlide, UserProfile } from '../../types';
import { PWAProductCard } from './PWAProductCard';
import {
  Sparkles,
  Wallet,
  ShoppingBag,
  ShieldCheck,
  Zap,
  ArrowRight,
  MessageCircle,
  Clock,
  Crown,
  Flame,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWAHomeViewProps {
  products: Product[];
  heroSlides?: HeroSlide[];
  currentUser?: UserProfile | null;
  onSelectProduct: (product: Product) => void;
  onNavigateToWallet: () => void;
  onNavigateToCatalog: (category?: string) => void;
}

export const PWAHomeView: React.FC<PWAHomeViewProps> = ({
  products,
  heroSlides = [],
  currentUser,
  onSelectProduct,
  onNavigateToWallet,
  onNavigateToCatalog,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Diapositivas por defecto si no hay de BD
  const defaultSlides = [
    { id: '1', image_url: '/slide1.webp', title: 'Agenda Semanal Free Fire' },
    { id: '2', image_url: '/slide2.webp', title: 'Recargas Inmediatas 24/7' },
  ];
  const slides = heroSlides.length > 0 ? heroSlides : defaultSlides;

  // Auto-scroll del slider de banners cada 5 segundos
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % slides.length;
        if (sliderRef.current) {
          sliderRef.current.scrollTo({
            left: next * sliderRef.current.clientWidth,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSliderScroll = () => {
    if (sliderRef.current) {
      const idx = Math.round(sliderRef.current.scrollLeft / sliderRef.current.clientWidth);
      if (idx !== activeSlide) setActiveSlide(idx);
    }
  };

  // Productos destacados
  const featuredProducts = products.filter((p) => p.isPopular || p.diamonds >= 100).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#020b08] text-white pb-28 select-none">
      {/* 🎠 CARRUSEL DE BANNERS TÁCTIL (FULL-BLEED CON SNAP NATIVO) */}
      <div className="relative pt-2 px-3.5">
        <div
          ref={sliderRef}
          onScroll={handleSliderScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.8)] border border-emerald-500/25"
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id || i}
              className="w-full flex-shrink-0 snap-center relative aspect-[16/9] max-h-48 overflow-hidden bg-[#03130d]"
            >
              <img
                src={slide.image_url}
                alt={slide.title || 'TunTun Banner'}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* Indicadores de bolitas */}
        {slides.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === i ? 'w-5 bg-emerald-400' : 'w-1.5 bg-zinc-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 🚀 ACCESOS RÁPIDOS NATIVOS (4 BOTONES GAMER) */}
      <div className="grid grid-cols-4 gap-2 px-3.5 my-3.5">
        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigateToCatalog('diamonds');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#0a1e16] to-[#04120c] border border-emerald-500/30 active:scale-95 transition-transform cursor-pointer shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-1 text-lg shadow-sm">
            💎
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight text-white">Diamantes</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigateToCatalog('passes');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#0a1e16] to-[#04120c] border border-emerald-500/30 active:scale-95 transition-transform cursor-pointer shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-1 text-lg shadow-sm">
            👑
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight text-white">Pases</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigateToCatalog('memberships');
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#0a1e16] to-[#04120c] border border-emerald-500/30 active:scale-95 transition-transform cursor-pointer shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-1 text-lg shadow-sm">
            🎟️
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight text-white">Membresías</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigateToWallet();
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-[#0a1e16] to-[#04120c] border border-emerald-500/30 active:scale-95 transition-transform cursor-pointer shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-1 text-lg shadow-sm">
            💰
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight text-emerald-300">Billetera</span>
        </button>
      </div>

      {/* 💳 WIDGET RESUMEN DE SALDO BILLETERA */}
      {currentUser && (
        <div className="mx-3.5 p-3 rounded-2xl bg-gradient-to-r from-[#0a271c] to-[#041710] border border-emerald-500/30 flex items-center justify-between shadow-md mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold">Tu Saldo Disponible</span>
              <span className="text-sm font-black font-mono text-emerald-300">
                ${(currentUser.walletBalanceUSD ?? 0).toFixed(2)} USD
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('medium');
              onNavigateToWallet();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all"
          >
            + Recargar
          </button>
        </div>
      )}

      {/* 🔥 SECCIÓN: OFERTAS DESTACADAS Y MÁS VENDIDOS */}
      <div className="px-3.5 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Más Vendidos en Ecuador
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigateToCatalog();
            }}
            className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5"
          >
            <span>Ver todo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Grid de 2 Columnas para los Más Vendidos */}
        <div className="grid grid-cols-2 gap-2.5">
          {featuredProducts.slice(0, 4).map((product) => (
            <PWAProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </div>

      {/* 📱 BANNER OFICIAL CANAL DE WHATSAPP */}
      <div className="mx-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#032e18] to-[#011a0d] border border-emerald-400/40 shadow-lg flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white truncate">Canal Oficial TunTun Store</h4>
            <p className="text-[10px] text-emerald-200/90 truncate">Promociones y alertas de la agenda semanal</p>
          </div>
        </div>
        <a
          href="https://whatsapp.com/channel/0029Vb9yB8z545v7YF2Cq43Z"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-[11px] uppercase tracking-wider shrink-0 active:scale-95 transition-all"
        >
          Unirme
        </a>
      </div>

      {/* 🛡️ BADGES DE GARANTÍA RÁPIDOS */}
      <div className="mx-3.5 grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-400">
        <div className="p-2 rounded-xl bg-[#051711] border border-emerald-500/15">
          <Zap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="font-bold text-white block">Automático</span>
          <span>Entrega de PIN</span>
        </div>
        <div className="p-2 rounded-xl bg-[#051711] border border-emerald-500/15">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="font-bold text-white block">100% Seguro</span>
          <span>Sin riesgo de baneo</span>
        </div>
        <div className="p-2 rounded-xl bg-[#051711] border border-emerald-500/15">
          <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="font-bold text-white block">Soporte 24/7</span>
          <span>En WhatsApp</span>
        </div>
      </div>
    </div>
  );
};
