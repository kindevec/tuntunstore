import React from 'react';
import { Product } from '../../types';
import { ShoppingBag, Flame, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWAProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const PWAProductCard: React.FC<PWAProductCardProps> = ({ product, onSelect }) => {
  // Elegir imagen del diamante / cofre según el tipo de producto
  const getProductImage = () => {
    if (product.imageType === 'diamond-large' || product.diamonds >= 2000) {
      return '/coofre.webp';
    }
    if (product.imageType === 'diamond-medium' || product.diamonds >= 310) {
      return '/cofresito.webp';
    }
    return '/diamante.webp';
  };

  const handleClick = () => {
    triggerHaptic('medium');
    onSelect(product);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="relative flex flex-col justify-between bg-gradient-to-b from-[#091a13] via-[#05140f] to-[#020b08] border border-emerald-500/25 hover:border-emerald-400/50 rounded-2xl p-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.6)] active:scale-[0.97] transition-all cursor-pointer select-none overflow-hidden group"
    >
      {/* Resplandor sutil superior */}
      <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

      {/* Badges superiores (Popular / Bono) */}
      <div className="flex items-center justify-between gap-1 mb-1 relative z-10">
        {product.isPopular ? (
          <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            <Flame className="w-2.5 h-2.5 fill-black" />
            Popular
          </span>
        ) : product.bonusDiamonds && product.bonusDiamonds > 0 ? (
          <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            +{product.bonusDiamonds} Bono
          </span>
        ) : (
          <span className="text-[8.5px] text-zinc-500 font-bold uppercase tracking-wider">
            {product.category === 'memberships' ? 'Membresía' : 'Recarga'}
          </span>
        )}

        {product.badgeText && (
          <span className="text-[7.5px] bg-zinc-800 text-zinc-300 font-mono font-bold px-1 rounded">
            {product.badgeText}
          </span>
        )}
      </div>

      {/* Gráfico central del diamante / cofre */}
      <div className="relative my-2 flex items-center justify-center h-20">
        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
        <img
          src={getProductImage()}
          alt={product.name}
          className="relative max-h-16 max-w-[80px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Título y Diamantes */}
      <div className="relative z-10 mb-2">
        <h4 className="text-white text-xs font-black tracking-tight leading-tight line-clamp-1">
          {product.name}
        </h4>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-emerald-400 text-[11px] font-mono font-bold">
            💎 {product.diamonds.toLocaleString()}
          </span>
          {product.bonusDiamonds && product.bonusDiamonds > 0 && (
            <span className="text-amber-300 text-[9.5px] font-mono font-bold">
              +{product.bonusDiamonds}
            </span>
          )}
        </div>
      </div>

      {/* Precio y Botón de compra ergonómico */}
      <div className="relative z-10 flex items-center justify-between gap-1 pt-1.5 border-t border-emerald-950/70">
        <div className="flex flex-col leading-none">
          <span className="text-[8.5px] text-zinc-400 font-bold uppercase">Precio</span>
          <span className="text-sm font-black font-mono text-white">
            ${product.priceUSD.toFixed(2)}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="h-7 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-[0_2px_8px_rgba(16,185,129,0.4)] active:scale-90 transition-all shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-3 h-3 stroke-[2.5]" />
          <span>Pedir</span>
        </button>
      </div>
    </div>
  );
};
