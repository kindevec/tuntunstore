import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Upload, X, AlertTriangle, CheckCircle2, FileText, Trash2, Shield, Sparkles, AlertOctagon, Zap, Gem, Check, Search, Layers, ChevronDown } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  priceUSD: number;
}

export interface CodeStat {
  product_id: string;
  product_name: string;
  available: number;
  used: number;
  total: number;
}

export interface AdminCodesTabProps {
  products: Product[];
  codesProductId: string;
  setCodesProductId: (id: string) => void;
  codesText: string;
  setCodesText: (text: string) => void;
  handleUploadCodes: (codes?: string[]) => Promise<{ success: boolean; error?: string; count?: number; blockedDuplicates?: string[] } | void>;
  isUploadingCodes: boolean;
  codesStats: CodeStat[];
}

// Sanitize and parse raw text into unique, cleaned codes
function parseCodes(raw: string): { valid: string[]; duplicates: string[]; empty: number } {
  const lines = raw.split(/[\n,;\s]+/).map(l => l.trim().toUpperCase()).filter(Boolean);
  const seen = new Set<string>();
  const valid: string[] = [];
  const duplicates: string[] = [];
  let empty = 0;

  for (const line of lines) {
    if (!line) { empty++; continue; }
    if (seen.has(line)) {
      duplicates.push(line);
    } else {
      seen.add(line);
      valid.push(line);
    }
  }
  return { valid, duplicates, empty };
}

export const AdminCodesTab: React.FC<AdminCodesTabProps> = ({
  products,
  codesProductId,
  setCodesProductId,
  codesText,
  setCodesText,
  handleUploadCodes,
  isUploadingCodes,
  codesStats,
}) => {
  const [chips, setChips] = useState<string[]>([]);
  const [duplicatesFound, setDuplicatesFound] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.priceUSD.toString().includes(q));
  }, [products, productSearch]);

  const selectedProduct = useMemo(
    () => products.find(p => p.id === codesProductId),
    [products, codesProductId]
  );

  // Products with 10 or fewer available codes
  const lowStockProducts = useMemo(
    () => codesStats.filter(s => s.available <= 10),
    [codesStats]
  );

  // Process raw text into chips
  const processInput = useCallback((raw: string) => {
    const { valid, duplicates } = parseCodes(raw);
    setChips(valid);
    setDuplicatesFound(duplicates);
    setCodesText(valid.join('\n'));
    setShowConfirmation(false);
  }, [setCodesText]);

  // Handle paste event on the input area
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    // Merge with existing chips
    const combined = [...chips, ...pasted.split(/[\n,;\s]+/).map(l => l.trim().toUpperCase()).filter(Boolean)];
    const uniqueSet = new Set<string>();
    const newDups: string[] = [];
    const uniqueCodes: string[] = [];
    for (const c of combined) {
      if (uniqueSet.has(c)) { newDups.push(c); } else { uniqueSet.add(c); uniqueCodes.push(c); }
    }
    setChips(uniqueCodes);
    setDuplicatesFound(newDups);
    setCodesText(uniqueCodes.join('\n'));
    setShowConfirmation(false);
  }, [chips, setCodesText]);

  // Handle file drop or selection
  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(txt|csv)$/i)) {
      setNotification({ type: 'error', message: 'Solo se permiten archivos .txt o .csv' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const combined = [...chips, ...text.split(/[\n,;\s]+/).map(l => l.trim().toUpperCase()).filter(Boolean)];
      const uniqueSet = new Set<string>();
      const newDups: string[] = [];
      const uniqueCodes: string[] = [];
      for (const c of combined) {
        if (uniqueSet.has(c)) { newDups.push(c); } else { uniqueSet.add(c); uniqueCodes.push(c); }
      }
      setChips(uniqueCodes);
      setDuplicatesFound(newDups);
      setCodesText(uniqueCodes.join('\n'));
      setShowConfirmation(false);
    };
    reader.readAsText(file);
  }, [chips, setCodesText]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeChip = useCallback((index: number) => {
    setChips(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setCodesText(updated.join('\n'));
      return updated;
    });
    setShowConfirmation(false);
  }, [setCodesText]);

  const clearAll = useCallback(() => {
    setChips([]);
    setDuplicatesFound([]);
    setCodesText('');
    setShowConfirmation(false);
  }, [setCodesText]);

  // Two-step flow
  const handleStep1 = () => {
    if (!codesProductId || chips.length === 0) return;
    setShowConfirmation(true);
  };

  const handleStep2Confirm = async () => {
    const result = await handleUploadCodes(chips);
    if (result && result.success) {
      setChips([]);
      setDuplicatesFound([]);
      setShowConfirmation(false);
      if (result.blockedDuplicates && result.blockedDuplicates.length > 0) {
        setNotification({
          type: 'success',
          message: `¡${result.count} códigos nuevos subidos exitosamente! 🛡️ Se omitieron ${result.blockedDuplicates.length} código(s) por ya existir en la base de datos.`
        });
      } else {
        setNotification({ type: 'success', message: `¡${result.count} códigos subidos exitosamente con verificación de unicidad!` });
      }
      setTimeout(() => setNotification(null), 8000);
    } else if (result && result.error) {
      setNotification({ type: 'error', message: result.error });
      setTimeout(() => setNotification(null), 8000);
    }
  };

  const handleSelectProductForUpload = (productId: string) => {
    setCodesProductId(productId);
    setShowConfirmation(false);
    dropZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          🔑 Gestión de Códigos de Recarga
        </h2>
        {lowStockProducts.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-black uppercase tracking-wider animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            {lowStockProducts.length} producto(s) en stock crítico (≤10)
          </span>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* LOW STOCK CRITICAL ALERT BANNER                     */}
      {/* ═══════════════════════════════════════════════════ */}
      {lowStockProducts.length > 0 && !dismissedAlert && (
        <div className="relative bg-gradient-to-r from-rose-950/90 via-amber-950/80 to-rose-950/90 border-2 border-rose-500/70 rounded-2xl p-4 md:p-5 shadow-[0_0_30px_rgba(244,63,94,0.35)] space-y-4 animate-in fade-in slide-in-from-top-3">
          <button
            onClick={() => setDismissedAlert(true)}
            className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-black/30 transition-colors"
            title="Ocultar banner de alerta"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-3 pr-6">
            <div className="w-10 h-10 rounded-xl bg-rose-500/25 border border-rose-500/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <AlertOctagon className="w-6 h-6 text-rose-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-rose-200 uppercase tracking-wider flex items-center gap-2">
                🚨 ALERTA CRÍTICA: HAGA UNA RECARGA DE PINES
              </h3>
              <p className="text-xs text-zinc-300 font-medium mt-1 leading-relaxed">
                ¡Atención Admin! Hay <span className="font-black text-rose-400 underline">{lowStockProducts.length} producto(s)</span> con <span className="font-black text-amber-300 font-mono">10 o menos</span> pines disponibles. Es necesario hacer una recarga de códigos inmediatamente para garantizar las ventas automáticas.
              </p>
            </div>
          </div>

          {/* Quick Reload Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {lowStockProducts.map((p) => (
              <div 
                key={p.product_id} 
                className={`bg-black/60 border rounded-xl p-3 flex items-center justify-between gap-2.5 transition-all ${
                  p.available === 0 ? 'border-rose-500/80 bg-rose-500/10' : 'border-amber-500/60 bg-amber-500/5'
                }`}
              >
                <div className="truncate">
                  <p className="text-xs font-black text-white truncate">{p.product_name}</p>
                  <p className={`text-[11px] font-bold font-mono mt-0.5 ${p.available === 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {p.available === 0 ? '❌ AGOTADO (0 pines)' : `⚠️ Quedan solo ${p.available} pin(es)`}
                  </p>
                </div>
                <button
                  onClick={() => handleSelectProductForUpload(p.product_id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-md hover:scale-105"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Recargar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* UPLOAD SECTION - Modern Redesign                    */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Upload className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">Subir Códigos Nuevos</h3>
              <p className="text-[10px] text-zinc-500">Pega los códigos o escríbelos manualmente</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1.5 self-start sm:self-auto">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Protección Anti-Duplicados Activa
          </span>
        </div>

        {/* ── Notification Banner ── */}
        {notification && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border animate-in slide-in-from-top-2 ${
            notification.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <p className="text-sm font-bold mt-0.5">{notification.message}</p>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto p-1 hover:bg-black/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Product Selector (Mobile Custom Dropdown + Desktop Visual Cards Grid) ── */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs md:text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Gem className="w-4 h-4 text-amber-400" />
              1. Seleccionar Producto para la Carga ({products.length})
            </label>

            {/* Desktop Search Filter */}
            {products.length > 3 && (
              <div className="hidden sm:block relative w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-amber-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* MOBILE ONLY: Custom Dropdown Component (block sm:hidden) */}
          <div className="block sm:hidden relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-2 rounded-2xl p-3.5 text-left flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer shadow-xl ${
                isDropdownOpen
                  ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                  : selectedProduct
                  ? 'border-amber-500/50 hover:border-amber-400 bg-amber-500/5'
                  : 'border-white/10 hover:border-amber-500/40'
              }`}
            >
              {selectedProduct ? (
                (() => {
                  const stat = codesStats.find(s => s.product_id === selectedProduct.id);
                  const available = stat ? stat.available : 0;
                  const isLow = available <= 10 && available > 0;
                  const isOut = available === 0;

                  return (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black shrink-0 shadow-md">
                        <Gem className="w-4.5 h-4.5" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-white truncate">{selectedProduct.name}</h4>
                          <span className="text-[10px] font-black text-amber-400 font-mono bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                            ${selectedProduct.priceUSD.toFixed(2)} USD
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          <span>Stock:</span>
                          {isOut ? (
                            <span className="text-rose-400 font-black">🚨 AGOTADO (0)</span>
                          ) : isLow ? (
                            <span className="text-amber-400 font-bold">⚠️ URGENTE ({available})</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">✓ {available} dispon.</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2.5 text-zinc-400">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                    <Gem className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs font-bold">-- Selecciona un producto --</span>
                </div>
              )}

              <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform duration-300 shrink-0 ${
                isDropdownOpen ? 'rotate-180 text-amber-300' : ''
              }`} />
            </button>

            {/* Floating Dropdown Menu Options */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0a0a0a]/95 backdrop-blur-2xl border-2 border-amber-500/40 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                {products.length > 3 && (
                  <div className="relative mb-1.5">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-center text-xs text-zinc-500 font-bold">
                      No se encontraron productos
                    </div>
                  ) : (
                    filteredProducts.map((p, idx) => {
                      const stat = codesStats.find(s => s.product_id === p.id);
                      const available = stat ? stat.available : 0;
                      const isSelected = codesProductId === p.id;
                      const isLow = available <= 10 && available > 0;
                      const isOut = available === 0;

                      const isEven = idx % 2 === 0;
                      const bgClass = isSelected
                        ? 'bg-gradient-to-r from-amber-500/30 via-amber-500/20 to-zinc-900 border-2 border-amber-400 text-white shadow-md'
                        : isEven
                        ? 'bg-[#161619] hover:bg-zinc-800 border border-white/5 text-zinc-200'
                        : 'bg-[#0d0d0f] hover:bg-zinc-800 border border-white/[0.03] text-zinc-200';

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setCodesProductId(p.id);
                            setShowConfirmation(false);
                            setIsDropdownOpen(false);
                          }}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2.5 ${bgClass}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-amber-400 text-black font-black' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              <Gem className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <h5 className="text-xs font-black truncate">{p.name}</h5>
                              <span className="text-[10px] font-mono text-amber-400 font-bold">
                                ${p.priceUSD.toFixed(2)} USD
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                            {isOut ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-black border border-rose-500/30">
                                🚨 0
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                ⚠️ {available}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                                ✓ {available}
                              </span>
                            )}

                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shadow">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP ONLY: Visual Cards Grid (hidden sm:grid) */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar p-0.5">
            {filteredProducts.map((p) => {
              const stat = codesStats.find(s => s.product_id === p.id);
              const available = stat ? stat.available : 0;
              const isSelected = codesProductId === p.id;
              const isLow = available <= 10 && available > 0;
              const isOut = available === 0;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setCodesProductId(p.id);
                    setShowConfirmation(false);
                  }}
                  className={`group relative rounded-xl p-3.5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-500/20 via-zinc-900 to-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                      : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected 
                          ? 'bg-amber-400 text-black shadow-md' 
                          : 'bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25'
                      }`}>
                        <Gem className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs md:text-sm font-black text-white truncate group-hover:text-amber-300 transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-[11px] font-black text-amber-400 font-mono">
                          ${p.priceUSD.toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 shadow-md animate-in zoom-in-50">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Stock status footer badge */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1 text-[10px]">
                    <span className="text-zinc-400 font-medium">Stock en BD:</span>
                    {isOut ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-black border border-rose-500/30 flex items-center gap-1 animate-pulse">
                        🚨 AGOTADO (0)
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                        ⚠️ URGENTE ({available})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                        ✓ {available} dispon.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!codesProductId && (
            <p className="text-[11px] text-amber-400/90 font-bold bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              Selecciona uno de los productos para asociarle los nuevos códigos.
            </p>
          )}
        </div>

        {/* ── Drag & Drop Zone + Paste Area ── */}
        <div
          ref={dropZoneRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_30px_rgba(251,191,36,0.15)]'
              : 'border-white/10 hover:border-white/20 bg-black/30'
          }`}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-amber-500/10 backdrop-blur-sm">
              <FileText className="w-10 h-10 text-amber-400 mb-2 animate-bounce" />
              <p className="text-sm font-black text-amber-400 uppercase">Suelta el archivo aquí</p>
            </div>
          )}

          <div className="p-4 space-y-3">
            {/* Chip display area */}
            {chips.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {chips.map((code, idx) => (
                  <span
                    key={`${code}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] md:text-[11px] font-mono font-bold group hover:bg-emerald-500/25 transition-all"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    {code}
                    <button
                      onClick={() => removeChip(idx)}
                      className="ml-0.5 text-emerald-400/50 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Eliminar código"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-zinc-500" />
                </div>
                <p className="text-xs text-zinc-400 font-semibold mb-1">Pega tus códigos en el campo de abajo</p>
              </div>
            )}

            {/* Hidden textarea for paste input */}
            <textarea
              value=""
              onPaste={handlePaste}
              onChange={(e) => {
                // If user types directly, also process
                const raw = e.target.value;
                if (raw.includes('\n') || raw.length > 5) {
                  processInput([...chips, raw].join('\n'));
                  e.target.value = '';
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const target = e.target as HTMLTextAreaElement;
                  const val = target.value.trim().toUpperCase();
                  if (val) {
                    if (chips.includes(val)) {
                      setDuplicatesFound(prev => [...prev, val]);
                    } else {
                      setChips(prev => [...prev, val]);
                      setCodesText([...chips, val].join('\n'));
                    }
                    target.value = '';
                    setShowConfirmation(false);
                  }
                }
              }}
              rows={2}
              placeholder={chips.length > 0 ? 'Pega más códigos o escribe uno y presiona Enter...' : 'Pega los códigos aquí (Ctrl+V) o escribe uno y presiona Enter...'}
              className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500/40 font-mono placeholder-zinc-600 resize-none"
            />

            {/* Clear All button */}
            <div className="flex items-center gap-2">
              {chips.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpiar todo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Duplicates Warning ── */}
        {duplicatesFound.length > 0 && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-amber-300">
                {duplicatesFound.length} código{duplicatesFound.length > 1 ? 's' : ''} duplicado{duplicatesFound.length > 1 ? 's' : ''} eliminado{duplicatesFound.length > 1 ? 's' : ''}
              </p>
              <p className="text-[10px] text-amber-400/60 mt-0.5">
                {duplicatesFound.slice(0, 5).join(', ')}{duplicatesFound.length > 5 ? ` y ${duplicatesFound.length - 5} más...` : ''}
              </p>
            </div>
          </div>
        )}

        {/* ── Stats bar ── */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300 font-bold">{chips.length}</span>
            <span className="text-emerald-400/60">válidos</span>
          </div>
          {duplicatesFound.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-amber-300 font-bold">{duplicatesFound.length}</span>
              <span className="text-amber-400/60">duplicados</span>
            </div>
          )}
          {selectedProduct && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-blue-300 font-bold">{selectedProduct.name}</span>
            </div>
          )}
        </div>

        {/* ── Two-Step Confirmation Flow ── */}
        {!showConfirmation ? (
          <button
            onClick={handleStep1}
            disabled={!codesProductId || chips.length === 0 || isUploadingCodes}
            className="w-full sm:w-auto justify-center px-5 md:px-6 py-2.5 md:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black text-[10px] md:text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/20"
          >
            <Shield className="w-4 h-4" />
            Revisar y Confirmar
          </button>
        ) : (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 animate-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-black text-white">¿Confirmar subida?</p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Vas a subir <span className="text-amber-300 font-bold">{chips.length}</span> código{chips.length > 1 ? 's' : ''} para el producto{' '}
                  <span className="text-amber-300 font-bold">{selectedProduct?.name}</span>.
                  {duplicatesFound.length > 0 && (
                    <> <span className="text-amber-400">{duplicatesFound.length}</span> duplicado{duplicatesFound.length > 1 ? 's' : ''} ya fueron omitidos.</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleStep2Confirm}
                disabled={isUploadingCodes}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] md:text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/20"
              >
                {isUploadingCodes ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar subida de {chips.length} código{chips.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isUploadingCodes}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] md:text-xs uppercase transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* INVENTORY STATS SECTION                            */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">Inventario de Códigos por Producto</h3>
        
        {codesStats.length === 0 ? (
          <p className="text-xs md:text-sm text-zinc-500 text-center py-6 md:py-8">No hay códigos cargados aún.</p>
        ) : (
          <div className="space-y-3">
            {codesStats.map((stat) => {
              const isLowStock = stat.available <= 10;
              const isOutOfStock = stat.available === 0;

              return (
                <div
                  key={stat.product_id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 md:p-4 rounded-xl border transition-all ${
                    isOutOfStock
                      ? 'bg-rose-950/20 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : isLowStock
                      ? 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-black/30 border-white/5'
                  }`}
                >
                  <div className="w-full sm:w-auto border-b border-white/5 sm:border-0 pb-2 sm:pb-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white">{stat.product_name}</p>
                      {isOutOfStock && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/50 text-rose-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-400" /> ¡Agotado!
                        </span>
                      )}
                      {!isOutOfStock && isLowStock && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> Recarga requerida (≤10)
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {stat.product_id.slice(0, 8)}...</p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className={`text-center flex-1 sm:flex-none rounded-lg p-2 sm:p-0 ${isLowStock ? (isOutOfStock ? 'bg-rose-500/10 sm:bg-transparent' : 'bg-amber-500/10 sm:bg-transparent') : 'bg-black/20 sm:bg-transparent'}`}>
                      <p className={`text-base md:text-lg font-black ${isOutOfStock ? 'text-rose-500 animate-pulse font-mono' : isLowStock ? 'text-amber-400 animate-pulse font-mono' : 'text-emerald-400'}`}>
                        {stat.available}
                      </p>
                      <p className="text-[8px] md:text-[9px] text-zinc-500 uppercase font-bold">Disponibles</p>
                    </div>
                    <div className="text-center flex-1 sm:flex-none bg-black/20 sm:bg-transparent rounded-lg p-2 sm:p-0">
                      <p className="text-base md:text-lg font-black text-zinc-500">{stat.used}</p>
                      <p className="text-[8px] md:text-[9px] text-zinc-500 uppercase font-bold">Usados</p>
                    </div>
                    <div className="text-center flex-1 sm:flex-none bg-black/20 sm:bg-transparent rounded-lg p-2 sm:p-0">
                      <p className="text-base md:text-lg font-black text-white">{stat.total}</p>
                      <p className="text-[8px] md:text-[9px] text-zinc-500 uppercase font-bold">Total</p>
                    </div>

                    {isLowStock && (
                      <button
                        onClick={() => handleSelectProductForUpload(stat.product_id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-md hover:scale-105"
                        title="Seleccionar este producto para cargar códigos"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>⚡ Recargar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

