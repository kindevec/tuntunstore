import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, UserProfile } from '../../types';
import { PWAProductCard } from './PWAProductCard';
import { PWABottomSheet } from './PWABottomSheet';
import { Wallet, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, Zap } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWACatalogViewProps {
  products: Product[];
  currentUser: UserProfile | null;
  onPurchaseProduct: (product: Product, playerId: string) => Promise<boolean | void>;
  onNavigateToWallet: () => void;
  onOpenLogin: () => void;
}

export const PWACatalogView: React.FC<PWACatalogViewProps> = ({
  products,
  currentUser,
  onPurchaseProduct,
  onNavigateToWallet,
  onOpenLogin,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');


  // Lista única sin filtros ni buscador (los 6 productos directos ordenados por diamantes de menor a mayor)
  const displayProducts = useMemo(() => {
    const activeList = products.filter((p) => p.active !== false);
    const list = activeList.length > 0 ? activeList : products;
    return [...list].sort((a, b) => (a.diamonds || a.priceUSD || 0) - (b.diamonds || b.priceUSD || 0));
  }, [products]);

  // Estado y tracking de "pasar el dedo por encima" en móvil
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const lastActiveIdRef = useRef<string | null>(null);

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const card = el?.closest('[data-product-card-id]');
    const cardId = card?.getAttribute('data-product-card-id') || null;

    if (cardId && cardId !== lastActiveIdRef.current) {
      lastActiveIdRef.current = cardId;
      setActiveCardId(cardId);
      triggerHaptic('light');
    } else if (!cardId && lastActiveIdRef.current) {
      lastActiveIdRef.current = null;
      setActiveCardId(null);
    }
  };

  const handleTouchEnd = () => {
    lastActiveIdRef.current = null;
    setActiveCardId(null);
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setErrorMsg('');
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onPurchaseProduct(selectedProduct, currentUser?.playerIdDefault || 'N/A');
      triggerHaptic('success');
      setSelectedProduct(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la compra');
      triggerHaptic('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const walletBalance = currentUser?.walletBalanceUSD ?? 0;
  const hasEnoughBalance = selectedProduct ? walletBalance >= selectedProduct.priceUSD : false;

  return (
    <div className="h-full w-full max-h-full bg-[#020b08] text-white flex flex-col justify-between overflow-hidden px-2.5 sm:px-3 pt-1 sm:pt-1.5 pb-[calc(56px+env(safe-area-inset-bottom,0px)+8px)] select-none">
      {/* Cabecera Gamer Compacta (shrink-0) */}
      <div className="shrink-0 flex items-center justify-between px-1 py-0.5 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399] shrink-0" />
          <div className="leading-tight">
            <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-400 block">
              Catálogo Oficial
            </span>
            <h2 className="text-xs sm:text-sm font-black uppercase italic tracking-tight text-white leading-none">
              PACKS Y <span className="text-amber-400">DIAMANTES</span>
            </h2>
          </div>
        </div>

        {currentUser?.role === 'admin' ? (
          <a
            href="#admin/catalog"
            onClick={() => triggerHaptic('light')}
            className="text-[9px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-transform shrink-0"
          >
            <span>⚙️ CRUD</span>
          </a>
        ) : (
          <div className="flex items-center gap-1.5 bg-[#051810]/90 border border-emerald-500/25 px-2.5 py-0.5 rounded-full shrink-0">
            <span className="text-[8.5px] font-bold text-zinc-400 uppercase">Garena</span>
            <span className="text-[8.5px] font-black text-emerald-400">⚡ PIN Directo</span>
          </div>
        )}
      </div>

      {/* Grid de los 6 Productos en 3 filas proporcionales exactas (flex-1 min-h-0) */}
      {displayProducts.length > 0 ? (
        <div
          className="flex-1 min-h-0 grid grid-cols-2 grid-rows-3 gap-2 touch-pan-y"
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {displayProducts.map((product) => (
            <PWAProductCard
              key={product.id}
              product={product}
              isExternalActive={activeCardId === product.id}
              onSelect={handleOpenProduct}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-zinc-400 text-xs">No hay productos disponibles en este momento.</p>
        </div>
      )}

      {/* Bottom Sheet de Compra Inmediata */}
      <PWABottomSheet
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Confirmar Pedido"
        subtitle={selectedProduct?.name}
      >
        {selectedProduct && (
          <div className="space-y-4">
            {/* Tarjeta de Resumen del Producto */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#071f16] border border-emerald-500/30">
              <div className="w-12 h-12 rounded-xl bg-[#03130d] border border-emerald-500/20 flex items-center justify-center shrink-0">
                <img
                  src={
                    selectedProduct.imageType === 'diamond-large' || (!selectedProduct.imageType && selectedProduct.diamonds >= 2000)
                      ? '/coofre.webp'
                      : selectedProduct.imageType === 'diamond-medium' || (!selectedProduct.imageType && selectedProduct.diamonds >= 500 && selectedProduct.diamonds < 2000)
                      ? '/cofresito.webp'
                      : '/diamante.webp'
                  }
                  alt={selectedProduct.name}
                  className="w-9 h-9 object-contain drop-shadow"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-xs font-black truncate">{selectedProduct.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-emerald-400 font-mono text-xs font-bold">
                    💎 {selectedProduct.diamonds.toLocaleString()}
                  </span>
                  {selectedProduct.bonusDiamonds && selectedProduct.bonusDiamonds > 0 && (
                    <span className="text-amber-300 text-[10px] font-bold">
                      +{selectedProduct.bonusDiamonds} Bono
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block uppercase">Total</span>
                <span className="text-base font-black font-mono text-white">
                  ${selectedProduct.priceUSD.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Verificación de Autenticación */}
            {!currentUser ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                <p className="text-xs text-amber-200">
                  Debes iniciar sesión con tu cuenta para comprar y recibir tu código instantáneo.
                </p>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    onOpenLogin();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-md"
                >
                  Iniciar Sesión Ahora
                </button>
              </div>
            ) : (
              <>
                {/* Info de Entrega Inmediata de Código Oficial Garena */}
                <div className="p-3 rounded-2xl bg-[#03140e] border border-emerald-500/25 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-black uppercase text-white block leading-tight">
                      Entrega Automática e Inmediata
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 leading-snug">
                      Recibirás tu código oficial de Garena listo para canjear en Mis Pedidos.
                    </span>
                  </div>
                </div>

                {/* Comprobación de Saldo de Billetera */}
                <div className="p-3 rounded-2xl bg-[#03140e] border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Tu Saldo Disponible</span>
                      <span className="text-xs font-mono font-black text-emerald-300">
                        ${walletBalance.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {hasEnoughBalance ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Saldo suficiente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <AlertCircle className="w-3 h-3" /> Falta ${(selectedProduct.priceUSD - walletBalance).toFixed(2)}
                    </span>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Botón de Acción según Saldo */}
                {hasEnoughBalance ? (
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isSubmitting
                        ? 'Procesando entrega...'
                        : `Pagar $${selectedProduct.priceUSD.toFixed(2)} y Recibir Código`}
                    </span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        setSelectedProduct(null);
                        onNavigateToWallet();
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Recargar Saldo en Billetera</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-[10.5px] text-center text-zinc-400">
                      Aceptamos Banco Pichincha, Guayaquil, DeUna y Tarjeta PayPhone.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </PWABottomSheet>
    </div>
  );
};
