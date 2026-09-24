import React, { useState } from 'react';
import { Product } from '../../types';
import { DiamondIcon } from '../DiamondIcon';
import { Sparkles, Plus, Edit, Edit3, Save, Trash2, DollarSign, Check, X } from 'lucide-react';

export interface AdminCatalogTabProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  isPWA?: boolean;
}

export const AdminCatalogTab: React.FC<AdminCatalogTabProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  isPWA = false,
}) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingInlinePriceId, setEditingInlinePriceId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState<string>('');

  const [productForm, setProductForm] = useState({
    name: '',
    diamonds: 572,
    bonusDiamonds: 57,
    priceUSD: 5.80,
    category: 'diamonds' as Product['category'],
    description: '',
    isPopular: false,
    isGoldPromo: false,
    badgeText: '',
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      onUpdateProduct({
        ...productForm,
        id: editingProductId,
      } as Product);
      setEditingProductId(null);
    } else {
      onAddProduct(productForm);
    }
    setIsAddingProduct(false);
    setProductForm({
      name: '',
      diamonds: 572,
      bonusDiamonds: 57,
      priceUSD: 5.80,
      category: 'diamonds',
      description: '',
      isPopular: false,
      isGoldPromo: false,
      badgeText: '',
    });
  };

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      diamonds: product.diamonds,
      bonusDiamonds: product.bonusDiamonds || 0,
      priceUSD: product.priceUSD,
      category: product.category,
      description: product.description || '',
      isPopular: !!product.isPopular,
      isGoldPromo: !!product.isGoldPromo,
      badgeText: product.badgeText || '',
    });
    setIsAddingProduct(true);
    // Smooth scroll to product form
    setTimeout(() => {
      const formEl = document.getElementById('admin-product-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 bg-zinc-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-700/50">
        <div className="space-y-0.5 w-full sm:w-auto">
          <h2 className="text-sm sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
            Catálogo de Productos
          </h2>
          <p className="text-[9px] sm:text-xs text-zinc-400 font-semibold">Añade, modifica o elimina denominaciones de diamantes, pases o membresías.</p>
        </div>

        <button
          onClick={() => {
            setIsAddingProduct(!isAddingProduct);
            setEditingProductId(null);
            setProductForm({
              name: '',
              diamonds: 572,
              bonusDiamonds: 57,
              priceUSD: 5.80,
              category: 'diamonds',
              description: '',
              isPopular: false,
              isGoldPromo: false,
              badgeText: '',
            });
          }}
          className="w-full sm:w-auto px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wide"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Product CRUD Form Modal/Section */}
      {isAddingProduct && (
        <form id="admin-product-form" onSubmit={handleSaveProduct} className="bg-zinc-800 text-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-700/50 shadow-2xl space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-700/50 pb-2">
            <h3 className="text-xs sm:text-base font-black text-amber-300 flex items-center gap-2">
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span className="truncate">{editingProductId ? `Editar: ${productForm.name || 'Producto'}` : 'Crear Nuevo Producto'}</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAddingProduct(false);
                setEditingProductId(null);
              }}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-bold rounded-md cursor-pointer shrink-0 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm">
            <div>
              <label className="block text-zinc-400 mb-0.5 sm:mb-1 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Nombre del Producto</label>
              <input
                type="text"
                required
                placeholder="Ej: 572 Diamantes"
                value={productForm.name || ''}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full p-2 sm:p-2.5 rounded-lg bg-zinc-900 border border-zinc-600 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="bg-amber-500/10 p-2 sm:p-2.5 rounded-lg border border-amber-500/30">
              <label className="block text-amber-300 mb-0.5 sm:mb-1 font-black uppercase tracking-wider text-[9px] sm:text-[10px]">
                💲 Precio USD ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.priceUSD ?? 0}
                onChange={(e) => setProductForm({ ...productForm, priceUSD: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 sm:p-2.5 rounded-lg bg-zinc-900 border-2 border-amber-400/40 text-amber-300 font-extrabold text-xs sm:text-sm text-right focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-0.5 sm:mb-1 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Cantidad Diamantes</label>
              <input
                type="number"
                required
                value={productForm.diamonds ?? 0}
                onChange={(e) => setProductForm({ ...productForm, diamonds: parseInt(e.target.value) || 0 })}
                className="w-full p-2 sm:p-2.5 rounded-lg bg-zinc-900 border border-zinc-600 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-0.5 sm:mb-1 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Bono Diamantes Extra</label>
              <input
                type="number"
                value={productForm.bonusDiamonds ?? 0}
                onChange={(e) => setProductForm({ ...productForm, bonusDiamonds: parseInt(e.target.value) || 0 })}
                className="w-full p-2 sm:p-2.5 rounded-lg bg-zinc-900 border border-zinc-600 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-0.5 sm:mb-1 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Categoría</label>
              <select
                value={productForm.category || 'diamonds'}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                className="w-full p-2 sm:p-2.5 rounded-lg bg-zinc-900 border border-zinc-600 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="diamonds">Diamantes Directos</option>
                <option value="memberships">Membresías VIP (Dorado 🟡)</option>
                <option value="passes">Pases de Nivel</option>
                <option value="promos">Promociones Especiales</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-0.5 sm:mb-1 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Texto de Badge</label>
              <input
                type="text"
                placeholder="Ej: MÁS VENDIDO ⚡"
                value={productForm.badgeText || ''}
                onChange={(e) => setProductForm({ ...productForm, badgeText: e.target.value })}
                className="w-full p-2 sm:p-2.5 rounded-lg bg-zinc-900 border border-zinc-600 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-0.5 sm:mb-1 font-bold text-[9px] sm:text-[10px] uppercase tracking-wide">Descripción</label>
            <input
              type="text"
              placeholder="Descripción rápida del producto..."
              value={productForm.description || ''}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full p-2 sm:p-2.5 rounded-lg bg-zinc-900 border border-zinc-600 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 text-xs text-zinc-300 pt-1">
            <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-zinc-700/50 hover:border-amber-400/30 transition-colors w-full sm:w-auto">
              <input
                type="checkbox"
                checked={productForm.isGoldPromo}
                onChange={(e) => setProductForm({ ...productForm, isGoldPromo: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-amber-500"
              />
              <span className="font-bold text-[11px] sm:text-xs">Estilo Dorado (VIP)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-zinc-700/50 hover:border-emerald-400/30 transition-colors w-full sm:w-auto">
              <input
                type="checkbox"
                checked={productForm.isPopular}
                onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-emerald-500"
              />
              <span className="font-bold text-[11px] sm:text-xs">Destacar como "Más Vendido"</span>
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2.5 sm:pt-3 border-t border-zinc-700/50">
            <button
              type="button"
              onClick={() => {
                setIsAddingProduct(false);
                setEditingProductId(null);
              }}
              className="w-full sm:w-auto px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold text-xs cursor-pointer transition-colors text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md uppercase transition-all"
            >
              <Save className="w-3.5 h-3.5 fill-current" />
              <span>{editingProductId ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Mobile Catalog Cards (Visible on mobile/tablet) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {products.map((p) => {
          const isEditingInline = editingInlinePriceId === p.id;
          const isGold = p.isGoldPromo || p.category === 'memberships';
          return (
            <div 
              key={p.id} 
              className={`relative overflow-hidden rounded-2xl border transition-all duration-200 shadow-lg ${
                isGold 
                  ? 'bg-gradient-to-br from-[#121008] via-[#0d0c07] to-[#080703] border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.08)]' 
                  : 'bg-gradient-to-br from-zinc-900/95 via-[#08120e] to-[#030906] border-emerald-500/25 shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
              }`}
            >
              {/* Ambient Radial Glow */}
              <div 
                className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none ${
                  isGold ? 'bg-amber-500/15' : 'bg-emerald-500/12'
                }`} 
              />

              {/* Top Accent Gradient Line */}
              <div 
                className={`h-1 w-full ${
                  isGold 
                    ? 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600' 
                    : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500'
                }`} 
              />

              <div className="p-3.5 space-y-3 relative z-10">
                {/* Header: Icon, Name & Badges */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isGold 
                          ? 'bg-amber-500/15 border-amber-500/35 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                          : 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      }`}
                    >
                      <DiamondIcon size="sm" variant={isGold ? 'gold' : 'emerald'} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-white text-sm sm:text-base leading-tight truncate">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isGold ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {p.category}
                        </span>
                        {p.isPopular && (
                          <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30">
                            ★ Top
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges on right */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {p.badgeText && (
                      <span className="text-[9px] font-black text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap uppercase tracking-wide">
                        {p.badgeText}
                      </span>
                    )}
                    {p.isGoldPromo && (
                      <span className="bg-amber-400 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                        VIP DORADO
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics Bar: Integrated, no ugly box-in-box */}
                <div className="bg-black/50 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-center justify-between gap-3">
                  {/* Diamantes */}
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block">
                      Diamantes FF
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-base sm:text-lg font-black text-emerald-400 tracking-tight">
                        {p.diamonds.toLocaleString()}
                      </span>
                      {p.bonusDiamonds > 0 && (
                        <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-500/30 leading-none">
                          +{p.bonusDiamonds} bonus
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-8 w-px bg-white/10 shrink-0" />

                  {/* Precio USD */}
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block">
                      Precio Venta
                    </span>
                    {isEditingInline ? (
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-amber-400 font-black text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inlinePriceValue}
                          onChange={(e) => setInlinePriceValue(e.target.value)}
                          className="w-20 px-2 py-0.5 rounded-lg bg-black border-2 border-amber-400 text-amber-300 font-black text-sm text-center focus:outline-none shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-end gap-1 mt-0.5">
                        <span className="text-base sm:text-lg font-black text-white tracking-tight">
                          ${p.priceUSD.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black text-zinc-400">USD</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center gap-2 pt-0.5">
                  {isEditingInline ? (
                    <>
                      <button
                        onClick={() => {
                          const val = parseFloat(inlinePriceValue);
                          if (!isNaN(val) && val >= 0) {
                            onUpdateProduct({ ...p, priceUSD: val });
                          }
                          setEditingInlinePriceId(null);
                        }}
                        className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase rounded-xl cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Guardar</span>
                      </button>
                      <button
                        onClick={() => setEditingInlinePriceId(null)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingInlinePriceId(p.id);
                          setInlinePriceValue(p.priceUSD.toString());
                        }}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title="Cambio rápido de precio"
                      >
                        <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Precio</span>
                      </button>

                      <button
                        onClick={() => startEditProduct(p)}
                        className="flex-[1.2] py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all active:scale-95 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Catalog Table */}
      <div className="hidden md:block bg-zinc-800 rounded-2xl border border-zinc-700/50 shadow-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[600px]">
          <thead className="bg-zinc-900/80 text-emerald-400 uppercase font-black text-[10px] tracking-widest border-b border-zinc-700">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Diamantes</th>
              <th className="p-4">Precio USD ($)</th>
              <th className="p-4">Tipo</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700/50">
            {products.map((p) => {
              const isEditingInline = editingInlinePriceId === p.id;
              return (
                <tr key={p.id} className="hover:bg-zinc-700/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <DiamondIcon size="sm" variant={p.isGoldPromo || p.category === 'memberships' ? 'gold' : 'emerald'} />
                      <div>
                        <p className="font-extrabold text-white text-sm">{p.name}</p>
                        {p.badgeText && (
                          <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30 inline-block mt-0.5">
                            {p.badgeText}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="text-zinc-300 font-bold uppercase text-[11px]">{p.category}</span>
                  </td>

                  <td className="p-4">
                    <span className="font-black text-emerald-400">{p.diamonds.toLocaleString()} 💎</span>
                    {p.bonusDiamonds > 0 && (
                      <span className="text-emerald-300/60 font-bold text-[10px] ml-1">(+{p.bonusDiamonds})</span>
                    )}
                  </td>

                  <td className="p-4">
                    {isEditingInline ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={inlinePriceValue}
                          onChange={(e) => setInlinePriceValue(e.target.value)}
                          className="w-20 px-2 py-1.5 rounded-lg bg-zinc-900 border-2 border-amber-400 text-amber-300 font-black text-xs text-right focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            const val = parseFloat(inlinePriceValue);
                            if (!isNaN(val) && val >= 0) {
                              onUpdateProduct({ ...p, priceUSD: val });
                            }
                            setEditingInlinePriceId(null);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-500 text-black text-[10px] font-black rounded-lg cursor-pointer hover:bg-emerald-400 transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingInlinePriceId(null)}
                          className="px-2 py-1.5 bg-zinc-700 text-zinc-400 text-[10px] font-bold rounded-lg cursor-pointer hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-black">
                          ${p.priceUSD.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingInlinePriceId(p.id);
                            setInlinePriceValue(p.priceUSD.toString());
                          }}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 hover:border-amber-400/40 transition-colors"
                        >
                          Cambiar
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    {p.isGoldPromo ? (
                      <span className="bg-amber-400/15 text-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-amber-400/30">
                        🟡 DORADO
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-[10px]">Estándar</span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEditProduct(p)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center gap-1.5 cursor-pointer transition-all text-xs uppercase"
                      >
                        <Edit className="w-3.5 h-3.5 stroke-[2.5]" />
                        Editar
                      </button>

                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
