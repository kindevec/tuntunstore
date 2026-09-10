import React, { useState, useMemo } from 'react';
import { Product, UserProfile, ProductCategory } from '../../types';
import { PWAProductCard } from './PWAProductCard';
import { PWABottomSheet } from './PWABottomSheet';
import { Search, Wallet, CheckCircle2, AlertCircle, ShoppingBag, X, ArrowRight, User } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [playerId, setPlayerId] = useState(currentUser?.playerIdDefault || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar ID de jugador si cambia el usuario
  React.useEffect(() => {
    if (currentUser?.playerIdDefault && !playerId) {
      setPlayerId(currentUser.playerIdDefault);
    }
  }, [currentUser, playerId]);

  // Categorías con íconos gamer
  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'Todos', icon: '💎' },
    { id: 'diamonds', label: 'Diamantes', icon: '⚡' },
    { id: 'passes', label: 'Pases', icon: '👑' },
    { id: 'memberships', label: 'Membresías', icon: '🎟️' },
    { id: 'promos', label: 'Promos', icon: '🔥' },
  ];

  // Filtrado reactivo en tiempo real
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setErrorMsg('');
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;
    if (!playerId.trim()) {
      setErrorMsg('Ingresa tu ID de jugador Free Fire');
      triggerHaptic('error');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onPurchaseProduct(selectedProduct, playerId.trim());
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
    <div className="min-h-screen bg-[#020b08] text-white pb-24">
      {/* Buscador Rápido Fijo */}
      <div className="px-3.5 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar recarga, diamantes, pase..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#071711] border border-emerald-500/25 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                triggerHaptic('light');
                setSearchQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Chips de Categorías Horizontales con Scroll Táctil */}
      <div className="flex items-center gap-2 px-3.5 pb-3 overflow-x-auto no-scrollbar select-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory(cat.id);
              }}
              className={`h-8 px-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'bg-[#071a13] border border-emerald-500/20 text-zinc-300 hover:text-white hover:border-emerald-500/40'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Resumen de Productos Encontrados */}
      <div className="px-3.5 pb-2 flex items-center justify-between text-[11px] text-zinc-400">
        <span>{filteredProducts.length} productos disponibles</span>
        {currentUser && (
          <span className="font-mono text-emerald-400 font-bold">
            Tu saldo: ${walletBalance.toFixed(2)}
          </span>
        )}
      </div>

      {/* Grid de 2 Columnas Móvil Gamer */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 px-3.5">
          {filteredProducts.map((product) => (
            <PWAProductCard key={product.id} product={product} onSelect={handleOpenProduct} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center px-4">
          <p className="text-zinc-400 text-sm">No encontramos productos con ese filtro.</p>
          <button
            onClick={() => {
              triggerHaptic('light');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
          >
            Ver todos los productos
          </button>
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
                    selectedProduct.diamonds >= 1000
                      ? '/coofre.webp'
                      : selectedProduct.diamonds >= 300
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
                {/* Input de ID de Free Fire */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    ID de Jugador Free Fire (Opcional para códigos PIN):
                  </label>
                  <input
                    type="text"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="Ej. 1234567890"
                    className="w-full px-3.5 py-2.5 bg-[#03130d] border border-emerald-500/30 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    ⚡ Se te entregará un código de canje oficial para canjear en Garena.
                  </span>
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
