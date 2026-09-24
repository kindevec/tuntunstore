import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types';
import { ShoppingBag, Sparkles, Crown } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWAProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isExternalActive?: boolean;
  forceActive?: boolean;
}

export const PWAProductCard: React.FC<PWAProductCardProps> = ({
  product,
  onSelect,
  isExternalActive,
  forceActive,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isGold = product.category === 'memberships' || !!product.isGoldPromo;

  // Activo si: está presionado con el dedo, se pasa el dedo por encima (isExternalActive), o hover de cursor
  const isActive = forceActive !== undefined ? forceActive : (isExternalActive || isHovered || isPressed);

  // Elegir imágenes (primaria y secundaria brillante) según el tipo de producto o cantidad
  const getProductImages = () => {
    if (product.imageType === 'diamond-large' || (!product.imageType && product.diamonds >= 2000)) {
      return {
        primary: '/coofre.webp',
        secondary: '/coofre2.webp',
        alt: 'Cofre Grande',
        altSecondary: 'Cofre Grande 2',
      };
    }
    if (product.imageType === 'diamond-medium' || (!product.imageType && product.diamonds >= 500 && product.diamonds < 2000)) {
      return {
        primary: '/cofresito.webp',
        secondary: '/cofresito2.webp',
        alt: 'Cofre de Diamantes',
        altSecondary: 'Cofre de Diamantes 2',
      };
    }
    return {
      primary: '/diamante.webp',
      secondary: '/diamante-2.webp',
      alt: 'Diamante',
      altSecondary: 'Diamante 2',
    };
  };

  const images = getProductImages();

  const handleClick = () => {
    triggerHaptic('medium');
    onSelect(product);
  };

  return (
    <div
      ref={cardRef}
      data-product-card-id={product.id}
      onClick={handleClick}
      onTouchStart={() => {
        setIsPressed(true);
        triggerHaptic('light');
      }}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      role="button"
      tabIndex={0}
      className={`relative h-full min-h-0 flex flex-col justify-between rounded-xl sm:rounded-2xl p-2 sm:p-2.5 active:scale-[0.97] transition-all duration-300 cursor-pointer select-none overflow-hidden group ${
        isGold
          ? isActive
            ? 'bg-gradient-to-b from-[#241a06] via-[#140e03] to-[#070501] border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-[1.01]'
            : 'bg-gradient-to-b from-[#161004] via-[#0d0902] to-[#070501] border border-amber-500/30'
          : isActive
            ? 'bg-gradient-to-b from-[#0c241a] via-[#061711] to-[#020b08] border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.01]'
            : 'bg-gradient-to-b from-[#071710] via-[#04120c] to-[#020b08] border border-emerald-500/20'
      }`}
    >
      {/* Resplandor superior activo */}
      <div
        className={`absolute top-0 inset-x-0 h-8 pointer-events-none transition-opacity duration-300 ${
          isGold
            ? isActive ? 'bg-gradient-to-b from-amber-500/30 to-transparent opacity-100' : 'opacity-0'
            : isActive ? 'bg-gradient-to-b from-emerald-500/25 to-transparent opacity-100' : 'opacity-0'
        }`}
      />

      {/* Badge superior */}
      <div className="flex items-center justify-between gap-1 min-h-[16px] max-h-[18px] relative z-10 shrink-0">
        {product.badgeText ? (
          <span className="bg-emerald-500 text-black font-black uppercase text-[7.5px] sm:text-[8px] tracking-wide px-1.5 py-0.5 rounded shadow-sm leading-none">
            {product.badgeText}
          </span>
        ) : isGold ? (
          <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[7.5px] sm:text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm leading-none">
            <Crown className="w-2 h-2 fill-black" />
            VIP
          </span>
        ) : product.bonusDiamonds && product.bonusDiamonds > 0 ? (
          <span className="inline-flex items-center gap-0.5 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-[7.5px] sm:text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm leading-none">
            <Sparkles className="w-2 h-2 text-emerald-400" />
            +{product.bonusDiamonds} Bono
          </span>
        ) : (
          <div className="h-3" />
        )}
      </div>

      {/* Gráfico central: "El muñeco" con escalado vertical fluido */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center w-full py-0.5 overflow-visible">
        {/* Halo resplandeciente animado */}
        <div
          className={`absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full blur-xl transition-all duration-500 ${
            isGold
              ? isActive ? 'bg-amber-400/40 scale-125' : 'bg-amber-500/10 scale-90'
              : isActive ? 'bg-emerald-400/35 scale-125' : 'bg-emerald-500/10 scale-90'
          }`}
        />

        {/* Imagen Primaria (Cofre cerrado / Diamante estándar) */}
        <img
          src={images.primary}
          alt={images.alt}
          className={`max-h-full max-w-full h-auto w-auto object-contain relative z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-all duration-300 ${
            isActive ? 'opacity-0 scale-90 rotate-[-6deg] pointer-events-none' : 'opacity-100 scale-100 rotate-0'
          }`}
          loading="lazy"
        />

        {/* Imagen Secundaria (Cofre abierto brillante con diamantes al pasar el dedo o presionar) */}
        <img
          src={images.secondary}
          alt={images.altSecondary}
          className={`absolute inset-0 m-auto max-h-full max-w-full h-auto w-auto object-contain z-10 transition-all duration-300 ${
            isGold
              ? 'drop-shadow-[0_0_20px_rgba(251,191,36,0.95)]'
              : 'drop-shadow-[0_0_20px_rgba(16,185,129,0.95)]'
          } ${
            isActive ? 'opacity-100 scale-110 rotate-0 pointer-events-auto' : 'opacity-0 scale-90 rotate-[6deg] pointer-events-none'
          }`}
          loading="lazy"
        />
      </div>

      {/* Nombre del Producto y Cantidad de Diamantes */}
      <div className="relative z-10 shrink-0 text-center px-0.5">
        <h4
          className={`text-[10px] sm:text-xs font-black tracking-tight leading-tight truncate transition-colors ${
            isGold
              ? isActive ? 'text-amber-200' : 'text-zinc-200'
              : isActive ? 'text-emerald-300' : 'text-white'
          }`}
        >
          {product.name}
        </h4>
        <p className="text-[8.5px] sm:text-[9.5px] text-white/80 font-bold uppercase tracking-wide leading-none mt-0.5">
          {product.diamonds} 💎 {product.bonusDiamonds ? `+ ${product.bonusDiamonds} bono` : ''}
        </p>
      </div>

      {/* Barra de Precio y Compra Rápida compacta */}
      <div
        className={`relative z-10 flex items-center justify-between gap-1 pt-1 border-t shrink-0 transition-colors ${
          isGold
            ? isActive ? 'border-amber-500/40' : 'border-amber-950/60'
            : isActive ? 'border-emerald-500/30' : 'border-emerald-950/50'
        }`}
      >
        <div className="flex flex-col leading-none">
          <span className="text-[7.5px] sm:text-[8px] text-emerald-400/60 font-bold uppercase tracking-wider">
            Precio
          </span>
          <span
            className={`text-xs sm:text-sm font-black font-mono leading-tight mt-0.5 ${
              isGold ? 'text-amber-400' : 'text-[#00e676]'
            }`}
          >
            ${product.priceUSD.toFixed(2)}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`h-6 sm:h-6.5 px-2 sm:px-2.5 rounded-lg font-black text-[9.5px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 active:scale-90 transition-all shrink-0 cursor-pointer shadow-md ${
            isGold
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-[0_2px_8px_rgba(245,158,11,0.35)]'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
          }`}
        >
          <ShoppingBag className="w-3 h-3 stroke-[2.5]" />
          <span>Comprar</span>
        </button>
      </div>
    </div>
  );
};
