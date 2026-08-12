import React, { useState } from 'react';
import { Product, ProductCategory, UserProfile } from '../types';
import { DiamondIcon } from './DiamondIcon';
import { DiamondChestGraphic } from './DiamondChestGraphic';
import { Sparkles, Trophy, Flame, ShoppingCart, Check, Zap, HelpCircle, Wallet, Plus, Edit, Trash2, ShieldCheck, X, Save, DollarSign } from 'lucide-react';
import { AdminConfirmModal } from './admin/AdminConfirmModal';

interface ProductCatalogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  currentUser?: UserProfile | null;
  onOpenWalletModal?: () => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onAddProduct?: (product: Omit<Product, 'id'>) => void;
}

export const CyanProductCard: React.FC<{
  product: Product;
  isAdmin?: boolean;
  carouselMode?: boolean;
  isFeaturedMode?: boolean;
  forceActive?: boolean;
  quickPriceId?: string | null;
  quickPriceValue?: string;
  setQuickPriceId?: (id: string | null) => void;
  setQuickPriceValue?: (val: string) => void;
  handleSaveQuickPrice?: (p: Product) => void;
  handleOpenEdit?: (p: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onSelectProduct: (p: Product) => void;
}> = ({
  product,
  isAdmin = false,
  carouselMode = false,
  isFeaturedMode = false,
  forceActive,
  quickPriceId = null,
  quickPriceValue = '',
  setQuickPriceId = (_id: string | null) => {},
  setQuickPriceValue = (_val: string) => {},
  handleSaveQuickPrice = (_p: Product) => {},
  handleOpenEdit = (_p: Product) => {},
  onDeleteProduct,
  onSelectProduct,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Only apply the effect on mobile devices (width < 640px is tailwind's 'sm' breakpoint)
    const isMobile = window.innerWidth < 640;
    
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        // For vertical scroll (default) use -49% 0px -49% 0px
        // For horizontal carousel, use 0px -49% 0px -49%
        rootMargin: carouselMode ? '0px -49% 0px -49%' : '-49% 0px -49% 0px', 
        threshold: 0, 
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isQuickEditing = quickPriceId === product.id;
  const activeClass = isVisible ? 'mobile-active' : '';
  const isActive = forceActive !== undefined ? forceActive : isVisible;
  const shouldLoadSecondary = isHovered || isActive;

  return (
    <div
      ref={cardRef}
      id={`product-card-${product.id}`}
      data-active={forceActive !== undefined ? forceActive : isVisible}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-gradient-to-b from-zinc-800 to-zinc-900 border transition-all duration-500 rounded-xl flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative overflow-hidden h-full ${
        carouselMode
          ? 'data-[active=false]:scale-90 data-[active=false]:opacity-50 data-[active=false]:z-0 data-[active=true]:scale-[1.05] data-[active=true]:z-20 data-[active=true]:opacity-100'
          : 'hover:scale-[1.03] hover:z-10 data-[active=true]:scale-[1.03] data-[active=true]:z-10'
      } ${
        isAdmin
          ? 'border-amber-500/40 hover:border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)] data-[active=true]:border-amber-400'
          : 'border-emerald-500/20 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] data-[active=true]:border-emerald-400 data-[active=true]:shadow-[0_0_25px_rgba(6,182,212,0.25)]'
      }`}
    >
      {/* Top section: badge + image + title overlaid */}
      <div className="relative px-3 pt-2.5 sm:px-4 sm:pt-3 pb-1">
        {/* Badge row */}
        <div className="flex items-center justify-between mb-1">
          {product.badgeText ? (
            <span className="bg-emerald-500 text-black font-black uppercase text-[9px] sm:text-[10px] tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow">
              {product.badgeText}
            </span>
          ) : (
            <span></span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-center text-base sm:text-lg font-black text-white uppercase tracking-tight group-hover:text-emerald-400 group-data-[active=true]:text-emerald-400 transition-colors leading-tight">
          {product.name}
        </h3>

        {/* Diamond Image — fills card width nicely */}
        <div className="flex-1 flex items-center justify-center py-1 sm:py-3 min-h-0">
          <div className="relative flex items-center justify-center w-full h-full group-hover:scale-110 group-data-[active=true]:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[18px] sm:blur-[25px] rounded-full animate-pulse group-hover:bg-emerald-400/30 group-data-[active=true]:bg-emerald-400/30 transition-colors" />
            {product.imageType === 'diamond-medium' ? (
              <>
                <img 
                  src="/cofresito.webp" 
                  loading="lazy"
                  alt="Cofre de Diamantes" 
                  className={`${isFeaturedMode ? 'w-full h-full max-h-[160px] sm:max-h-[200px]' : 'w-20 h-20 sm:w-36 sm:h-36'} object-contain relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-opacity duration-300 group-hover:opacity-0 group-data-[active=true]:opacity-0`}
                />
                {shouldLoadSecondary && (
                  <img 
                    src="/cofresito2.webp" 
                    loading="lazy"
                    alt="Cofre de Diamantes 2" 
                    className={`absolute inset-0 m-auto ${isFeaturedMode ? 'w-full h-full max-h-[160px] sm:max-h-[200px]' : 'w-20 h-20 sm:w-36 sm:h-36'} object-contain z-10 drop-shadow-[0_0_25px_rgba(16,185,129,1)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-data-[active=true]:opacity-100`}
                  />
                )}
              </>
            ) : product.imageType === 'diamond-large' ? (
              <>
                <img 
                  src="/coofre.webp" 
                  loading="lazy"
                  alt="Cofre Grande" 
                  className={`${isFeaturedMode ? 'w-full h-full max-h-[160px] sm:max-h-[200px]' : 'w-20 h-20 sm:w-36 sm:h-36'} object-contain relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-opacity duration-300 group-hover:opacity-0 group-data-[active=true]:opacity-0`}
                />
                {shouldLoadSecondary && (
                  <img 
                    src="/coofre2.webp" 
                    loading="lazy"
                    alt="Cofre Grande 2" 
                    className={`absolute inset-0 m-auto ${isFeaturedMode ? 'w-full h-full max-h-[160px] sm:max-h-[200px]' : 'w-20 h-20 sm:w-36 sm:h-36'} object-contain z-10 drop-shadow-[0_0_25px_rgba(16,185,129,1)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-data-[active=true]:opacity-100`}
                  />
                )}
              </>
            ) : (
              <>
                <img 
                  src="/diamante.webp" 
                  loading="lazy"
                  alt="Diamante" 
                  className={`${isFeaturedMode ? 'w-full h-full max-h-[160px] sm:max-h-[200px]' : 'w-20 h-20 sm:w-36 sm:h-36'} object-contain relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-opacity duration-300 group-hover:opacity-0 group-data-[active=true]:opacity-0`}
                />
                {shouldLoadSecondary && (
                  <img 
                    src="/diamante-2.webp" 
                    loading="lazy"
                    alt="Diamante 2" 
                    className={`absolute inset-0 m-auto ${isFeaturedMode ? 'w-full h-full max-h-[160px] sm:max-h-[200px]' : 'w-20 h-20 sm:w-36 sm:h-36'} object-contain z-10 drop-shadow-[0_0_25px_rgba(16,185,129,1)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-data-[active=true]:opacity-100`}
                  />
                )}
              </>
            )}
            {product.bonusDiamonds > 0 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-3 bg-amber-400 text-black font-black text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] z-20 animate-bounce">
                +{product.bonusDiamonds}
              </div>
            )}
          </div>
        </div>

        {/* Diamond count pill */}
        {!isFeaturedMode && (
          <p className="text-center text-[11px] sm:text-xs text-white/80 font-bold uppercase tracking-wide">
            {product.diamonds} 💎 {product.bonusDiamonds ? `+ ${product.bonusDiamonds} bono` : ''}
          </p>
        )}
      </div>

      {/* Footer: Price + Button integrated */}
      <div className="px-3 pb-2.5 sm:px-4 sm:pb-3 pt-1.5 mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-emerald-400/60 font-bold uppercase">Precio</span>

          {isAdmin && isQuickEditing ? (
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                value={quickPriceValue}
                onChange={(e) => setQuickPriceValue(e.target.value)}
                className="w-20 px-2 py-1 bg-black border-2 border-emerald-400 text-emerald-300 rounded-lg text-sm font-black text-right focus:outline-none relative z-20"
                autoFocus
              />
              <button
                onClick={() => handleSaveQuickPrice(product)}
                className="p-1 bg-emerald-500 text-black rounded-lg text-[10px] font-black hover:bg-emerald-400 cursor-pointer relative z-20"
              >
                ✓
              </button>
              <button
                onClick={() => setQuickPriceId(null)}
                className="p-1 bg-zinc-800 text-zinc-400 rounded-lg text-[10px] hover:text-white cursor-pointer relative z-20"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-2xl font-black text-[#00e676] tracking-tight">
                ${product.priceUSD.toFixed(2)}
              </span>
              {isAdmin && (
                <button
                  onClick={() => {
                    setQuickPriceId(product.id);
                    setQuickPriceValue(product.priceUSD.toString());
                  }}
                  className="text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded font-bold underline cursor-pointer relative z-20"
                  title="Cambiar precio rápido"
                >
                  $ Edit
                </button>
              )}
            </div>
          )}
        </div>

        {isAdmin ? (
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-0.5">
            <button
              onClick={() => handleOpenEdit(product)}
              className="py-1.5 sm:py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-[9px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow relative z-20"
            >
              <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => onDeleteProduct && onDeleteProduct(product.id)}
              className="py-1.5 sm:py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 text-[9px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 relative z-20"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Eliminar</span>
            </button>
          </div>
        ) : (
          <button
            id={`btn-buy-${product.id}`}
            onClick={() => onSelectProduct(product)}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer relative z-20"
          >
            <ShoppingCart className="w-4 h-4 text-black" />
            <span>Comprar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onSelectProduct,
  selectedCategory,
  setSelectedCategory,
  currentUser,
  onOpenWalletModal,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [graphicStyle, setGraphicStyle] = useState<'pinxtore' | 'mascot'>('pinxtore');

  const isAdmin = currentUser?.role === 'admin';

  // Admin Catalog Editing States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [quickPriceId, setQuickPriceId] = useState<string | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  const [formState, setFormState] = useState({
    name: '',
    diamonds: 572,
    bonusDiamonds: 0,
    priceUSD: 4.80,
    category: 'diamonds' as ProductCategory,
    badgeText: '',
    description: '',
    isGoldPromo: false,
  });

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormState({
      name: p.name || '',
      diamonds: p.diamonds || 0,
      bonusDiamonds: p.bonusDiamonds || 0,
      priceUSD: p.priceUSD || 0,
      category: p.category || 'diamonds',
      badgeText: p.badgeText || '',
      description: p.description || '',
      isGoldPromo: !!p.isGoldPromo,
    });
  };

  const handleOpenCreate = () => {
    setIsCreatingProduct(true);
    setFormState({
      name: '',
      diamonds: 572,
      bonusDiamonds: 0,
      priceUSD: 4.80,
      category: 'diamonds',
      badgeText: '',
      description: 'Paquete oficial de diamantes Free Fire. Recarga directa a tu ID.',
      isGoldPromo: false,
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && onUpdateProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formState,
      });
      setEditingProduct(null);
    } else if (isCreatingProduct && onAddProduct) {
      onAddProduct(formState);
      setIsCreatingProduct(false);
    }
  };

  const handleSaveQuickPrice = (product: Product) => {
    const val = parseFloat(quickPriceValue);
    if (!isNaN(val) && val >= 0 && onUpdateProduct) {
      onUpdateProduct({
        ...product,
        priceUSD: val,
      });
    }
    setQuickPriceId(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' ? true : p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diamonds.toString().includes(searchQuery) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="catalog-section" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Admin Mode Special Control Bar (ONLY visible for Administrator) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-950/90 via-zinc-900 to-amber-950/90 p-4 rounded-2xl border-2 border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(251,191,36,0.2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  MODO ADMINISTRADOR — EDICIÓN DIRECTA DEL CATÁLOGO
                </span>
                <span className="text-[10px] bg-amber-400 text-black font-black px-2 py-0.5 rounded uppercase">
                  Vista Admin Activa ⚡
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-medium mt-0.5">
                Puedes editar precios, nombres y características de cualquier producto directamente desde esta vista.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Crear Producto Nuevo</span>
          </button>
        </div>
      )}

      {/* Wallet Banner Card (Visible for clients) */}
      {!isAdmin && onOpenWalletModal && (
        <div 
          onClick={onOpenWalletModal}
          className="bg-gradient-to-r from-emerald-950/80 via-black to-emerald-950/80 p-4 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all group"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-black transition-all">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-black text-white uppercase">Mi Billetera Virtual TunTun</span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500 text-black font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                  Acreditación Inmediata ⚡
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-medium mt-1 leading-tight">
                Paga tus recargas de diamantes al instante usando tu saldo depositado sin esperar verificación bancaria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
            <div className="text-left sm:text-right flex-1 sm:flex-initial">
              <span className="text-[10px] text-emerald-400/80 uppercase font-black block">Saldo Disponible</span>
              <span className="text-xl font-black text-emerald-300 font-mono">
                ${(currentUser?.walletBalanceUSD ?? 0).toFixed(2)} USD
              </span>
            </div>
            <div
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-[11px] sm:text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Recargar Saldo</span>
              <span className="sm:hidden">Recargar</span>
            </div>
          </div>
        </div>
      )}

      {/* Section Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-emerald-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
            <Zap className="w-4 h-4 text-emerald-400" />
            Catálogo Oficial Free Fire & Juegos LATAM
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
            Recargas de Diamantes 💎
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 uppercase font-semibold tracking-wider">
            {isAdmin
              ? 'Edición en tiempo real activada. Haz clic en "Editar" en cualquier tarjeta para cambiar sus datos.'
              : 'Selecciona el paquete deseado. Entrega directa e inmediata a tu ID de jugador.'}
          </p>
        </div>

        {/* Graphic Toggle & Search input */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Desktop Search input (Toggles removed) */}

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar código o diamantes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-white/30 text-xs font-bold focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>


      {/* Grid of Product Cards */}
      <div id="catalog-products-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-rows-2 lg:grid-flow-col gap-2.5 sm:gap-4 max-w-5xl mx-auto">
        {filteredProducts.map((product) => {
          const isGoldStyle = product.isGoldPromo || product.category === 'memberships';
          const isQuickEditing = quickPriceId === product.id;

          if (isGoldStyle) {
            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="relative p-0.5 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 shadow-[0_0_20px_rgba(251,191,36,0.25)] group hover:scale-105 transition-transform"
              >
                <div className="bg-zinc-800 rounded-[11px] p-2.5 sm:p-4 text-white space-y-1.5 sm:space-y-2 flex flex-col justify-between h-full">
                  {/* Card Header Top Labels & Admin Edit Button */}
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-400/80">
                    <span className="bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded">FREE FIRE VIP</span>
                    {isAdmin ? (
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="bg-amber-400 text-black px-2.5 py-1 rounded-md font-black flex items-center gap-1 cursor-pointer hover:bg-amber-300 shadow transition-colors"
                        title="Editar todos los campos de este producto"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <span className="bg-black/60 px-2 py-0.5 rounded text-white/70">TUNTUN STORE</span>
                    )}
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-center">
                      <h3 className="font-black text-base sm:text-xl text-amber-400 uppercase tracking-tight leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-amber-300/80 uppercase font-bold tracking-wider">
                        Beneficios Diarios 🟡
                      </p>
                    </div>

                    {/* Gold Diamond Graphic */}
                    <div className="py-1 px-2 rounded-lg bg-gradient-to-b from-amber-950/40 to-black border border-amber-500/30 flex items-center justify-center">
                      <DiamondIcon size="md" variant="gold" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-400/70 uppercase font-bold">Precio</span>
                      
                      {/* Price Display / Inline Edit */}
                      {isAdmin && isQuickEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={quickPriceValue}
                            onChange={(e) => setQuickPriceValue(e.target.value)}
                            className="w-20 px-2 py-1 bg-black border-2 border-amber-400 text-amber-300 rounded-lg text-sm font-black text-right focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveQuickPrice(product)}
                            className="p-1 bg-emerald-500 text-black rounded-lg text-[10px] font-black hover:bg-emerald-400 cursor-pointer"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setQuickPriceId(null)}
                            className="p-1 bg-zinc-800 text-zinc-400 rounded-lg text-[10px] hover:text-white cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-2xl font-black text-amber-400">${product.priceUSD.toFixed(2)}</span>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setQuickPriceId(product.id);
                                setQuickPriceValue(product.priceUSD.toString());
                              }}
                              className="text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-1 rounded font-bold underline cursor-pointer"
                              title="Editar precio de forma rápida"
                            >
                              $ Edit
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Client Action or Admin Action */}
                    {isAdmin ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar Producto</span>
                        </button>
                        <button
                          onClick={() => onDeleteProduct && onDeleteProduct(product.id)}
                          className="py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-buy-${product.id}`}
                        onClick={() => onSelectProduct(product)}
                        className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4 text-black" />
                        <span>Comprar Membresía</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Standard Cyan Pinxtore Style Card
          return (
            <CyanProductCard 
              key={product.id}
              product={product}
              isAdmin={isAdmin}
              quickPriceId={quickPriceId}
              quickPriceValue={quickPriceValue}
              setQuickPriceId={setQuickPriceId}
              setQuickPriceValue={setQuickPriceValue}
              handleSaveQuickPrice={handleSaveQuickPrice}
              handleOpenEdit={handleOpenEdit}
              onDeleteProduct={onDeleteProduct}
              onSelectProduct={onSelectProduct}
            />
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-zinc-900/60 rounded-2xl p-12 text-center border border-zinc-800 space-y-3 text-white">
          <HelpCircle className="w-12 h-12 text-zinc-500 mx-auto" />
          <h3 className="text-lg font-black uppercase">No se encontraron productos</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto uppercase">
            Prueba buscando otro término o seleccionando la pestaña "⭐ Todos los Productos".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-emerald-500 text-black font-black uppercase text-xs rounded-xl cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* ADMIN EDIT / CREATE PRODUCT MODAL */}
      {(editingProduct || isCreatingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-zinc-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-xl p-4 sm:p-6 space-y-4 sm:space-y-5 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <span>{editingProduct ? `Editar Producto: ${editingProduct.name}` : 'Crear Nuevo Producto'}</span>
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreatingProduct(false);
                }}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div>
                  <label className="block text-zinc-300 mb-0.5 font-bold text-[10px] sm:text-xs">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                  <label className="block text-amber-300 mb-0.5 font-black uppercase tracking-wider text-[10px] flex items-center gap-1">
                    💲 Precio USD ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formState.priceUSD}
                    onChange={(e) => setFormState({ ...formState, priceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full p-1.5 rounded-lg bg-black border-2 border-amber-400 text-amber-300 font-extrabold text-xs sm:text-sm text-right focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-0.5 font-bold text-[10px] sm:text-xs">Cantidad Diamantes</label>
                  <input
                    type="number"
                    required
                    value={formState.diamonds}
                    onChange={(e) => setFormState({ ...formState, diamonds: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-0.5 font-bold text-[10px] sm:text-xs">Bono Diamantes Extra</label>
                  <input
                    type="number"
                    value={formState.bonusDiamonds}
                    onChange={(e) => setFormState({ ...formState, bonusDiamonds: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-0.5 font-bold text-[10px] sm:text-xs">Categoría</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value as ProductCategory })}
                    className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-bold focus:outline-none"
                  >
                    <option value="diamonds">Diamantes Directos</option>
                    <option value="memberships">Membresías VIP (Dorado 🟡)</option>
                    <option value="passes">Pases de Nivel</option>
                    <option value="promos">Promos Especiales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-0.5 font-bold text-[10px] sm:text-xs">Texto Badge Overlay</label>
                  <input
                    type="text"
                    placeholder="Ej: MÁS VENDIDO ⚡"
                    value={formState.badgeText || ''}
                    onChange={(e) => setFormState({ ...formState, badgeText: e.target.value })}
                    className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-0.5 font-bold text-[10px] sm:text-xs">Descripción</label>
                <input
                  type="text"
                  placeholder="Descripción rápida..."
                  value={formState.description || ''}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 text-xs text-zinc-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isGoldPromo}
                    onChange={(e) => setFormState({ ...formState, isGoldPromo: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                  <span>Estilo Dorado Promo (Borde y Fondo VIP)</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                {editingProduct && onDeleteProduct ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmProduct(editingProduct);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1 border border-rose-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsCreatingProduct(false);
                    }}
                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg uppercase transition-all"
                  >
                    <Save className="w-4 h-4 fill-current" />
                    <span>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminConfirmModal
        isOpen={!!deleteConfirmProduct}
        title="¿Eliminar Producto?"
        message={`¿Estás seguro de que deseas eliminar "${deleteConfirmProduct?.name}" del catálogo? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirmProduct && onDeleteProduct) {
            onDeleteProduct(deleteConfirmProduct.id);
            setEditingProduct(null);
            setDeleteConfirmProduct(null);
          }
        }}
        onCancel={() => setDeleteConfirmProduct(null)}
      />
    </section>
  );
};

