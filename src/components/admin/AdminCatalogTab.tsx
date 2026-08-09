import React, { useState } from 'react';
import { Product } from '../../types';
import { DiamondIcon } from '../DiamondIcon';
import { Sparkles, Plus, Edit, Save, Trash2 } from 'lucide-react';

export interface AdminCatalogTabProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const AdminCatalogTab: React.FC<AdminCatalogTabProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-zinc-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-700/50">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Catálogo de Productos
          </h2>
          <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold">Añade, modifica o elimina denominaciones de diamantes, pases o membresías.</p>
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
          className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wide"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Product CRUD Form Modal/Section */}
      {isAddingProduct && (
        <form id="admin-product-form" onSubmit={handleSaveProduct} className="bg-zinc-800 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-700/50 shadow-2xl space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-700/50 pb-2 sm:pb-3">
            <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
              <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <span className="truncate">{editingProductId ? `Editar: ${productForm.name || 'Producto'}` : 'Crear Nuevo Producto'}</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAddingProduct(false);
                setEditingProductId(null);
              }}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-zinc-400 mb-1 sm:mb-1.5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Nombre del Producto</label>
              <input
                type="text"
                required
                placeholder="Ej: 572 Diamantes"
                value={productForm.name || ''}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="bg-amber-500/10 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-amber-500/30">
              <label className="block text-amber-300 mb-1 sm:mb-1.5 font-black uppercase tracking-wider text-[9px] sm:text-[10px]">
                💲 Precio USD ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.priceUSD ?? 0}
                onChange={(e) => setProductForm({ ...productForm, priceUSD: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-zinc-900 border-2 border-amber-400/40 text-amber-300 font-extrabold text-xs sm:text-sm text-right focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 sm:mb-1.5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Cantidad Diamantes</label>
              <input
                type="number"
                required
                value={productForm.diamonds ?? 0}
                onChange={(e) => setProductForm({ ...productForm, diamonds: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 sm:mb-1.5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Bono Diamantes Extra</label>
              <input
                type="number"
                value={productForm.bonusDiamonds ?? 0}
                onChange={(e) => setProductForm({ ...productForm, bonusDiamonds: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 sm:mb-1.5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Categoría</label>
              <select
                value={productForm.category || 'diamonds'}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="diamonds">Diamantes Directos</option>
                <option value="memberships">Membresías VIP (Dorado 🟡)</option>
                <option value="passes">Pases de Nivel</option>
                <option value="promos">Promociones Especiales</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 sm:mb-1.5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wide">Texto de Badge</label>
              <input
                type="text"
                placeholder="Ej: MÁS VENDIDO ⚡"
                value={productForm.badgeText || ''}
                onChange={(e) => setProductForm({ ...productForm, badgeText: e.target.value })}
                className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 sm:mb-1.5 font-bold text-[9px] sm:text-[10px] uppercase tracking-wide">Descripción</label>
            <input
              type="text"
              placeholder="Descripción rápida del producto..."
              value={productForm.description || ''}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-600 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-300 pt-1 sm:pt-2">
            <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-zinc-700/50 hover:border-amber-400/30 transition-colors w-full sm:w-auto">
              <input
                type="checkbox"
                checked={productForm.isGoldPromo}
                onChange={(e) => setProductForm({ ...productForm, isGoldPromo: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500"
              />
              <span className="font-bold">Estilo Dorado (VIP)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-zinc-700/50 hover:border-emerald-400/30 transition-colors w-full sm:w-auto">
              <input
                type="checkbox"
                checked={productForm.isPopular}
                onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500"
              />
              <span className="font-bold">Destacar como "Más Vendido"</span>
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-zinc-700/50">
            <button
              type="button"
              onClick={() => {
                setIsAddingProduct(false);
                setEditingProductId(null);
              }}
              className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg uppercase transition-all"
            >
              <Save className="w-4 h-4 fill-current" />
              <span>{editingProductId ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Mobile Catalog Cards (Visible on mobile/tablet) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {products.map((p) => {
          const isEditingInline = editingInlinePriceId === p.id;
          return (
            <div key={p.id} className="bg-zinc-800 rounded-xl border border-zinc-700/50 overflow-hidden shadow-lg">
              {/* Card Header */}
              <div className="bg-emerald-600 px-2.5 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <DiamondIcon size="sm" variant={p.isGoldPromo || p.category === 'memberships' ? 'gold' : 'emerald'} />
                  <div className="min-w-0">
                    <p className="font-black text-white text-xs sm:text-sm truncate">{p.name}</p>
                    <span className="text-[9px] sm:text-[10px] text-emerald-100/80 font-bold uppercase">{p.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {p.badgeText && (
                    <span className="text-[8px] sm:text-[9px] text-white font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                      {p.badgeText}
                    </span>
                  )}
                  {p.isGoldPromo && (
                    <span className="bg-amber-400 text-black text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full">
                      VIP
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 space-y-2.5">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-900/60 p-2 sm:p-3 rounded-lg border border-zinc-700/40 text-center">
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase block mb-0.5">Diamantes</span>
                    <p className="font-black text-emerald-400 text-sm sm:text-base">
                      {p.diamonds.toLocaleString()}
                    </p>
                    {p.bonusDiamonds > 0 && (
                      <span className="text-[8px] sm:text-[9px] text-emerald-300/70 font-bold">+{p.bonusDiamonds} bonus</span>
                    )}
                  </div>

                  <div className="bg-zinc-900/60 p-2 sm:p-3 rounded-lg border border-zinc-700/40 text-center">
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase block mb-0.5">Precio USD</span>
                    {isEditingInline ? (
                      <input
                        type="number"
                        step="0.01"
                        value={inlinePriceValue}
                        onChange={(e) => setInlinePriceValue(e.target.value)}
                        className="w-full px-1.5 py-1 rounded-md bg-zinc-800 border-2 border-amber-400 text-amber-300 font-black text-xs sm:text-sm text-center focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <p className="font-black text-white text-sm sm:text-base">${p.priceUSD.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
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
                        className="col-span-2 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] sm:text-xs font-black rounded-lg cursor-pointer uppercase transition-colors text-center"
                      >
                        ✓ Guardar
                      </button>
                      <button
                        onClick={() => setEditingInlinePriceId(null)}
                        className="py-1.5 sm:py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[10px] sm:text-xs font-bold rounded-lg cursor-pointer transition-colors text-center"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingInlinePriceId(p.id);
                          setInlinePriceValue(p.priceUSD.toString());
                        }}
                        className="py-1.5 bg-zinc-700 hover:bg-zinc-600 text-amber-400 font-black text-[9px] sm:text-[10px] rounded-lg uppercase transition-colors cursor-pointer text-center"
                      >
                        💲 Precio
                      </button>

                      <button
                        onClick={() => startEditProduct(p)}
                        className="py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] sm:text-[10px] rounded-lg uppercase transition-colors cursor-pointer text-center"
                      >
                        ✏️ Editar
                      </button>

                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-black text-[9px] sm:text-[10px] rounded-lg border border-rose-500/30 transition-colors cursor-pointer text-center flex justify-center items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
