import React from 'react';

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
  handleUploadCodes: () => void;
  isUploadingCodes: boolean;
  codesStats: CodeStat[];
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
  return (
    <div className="space-y-6">
      <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
        🔑 Gestión de Códigos de Recarga
      </h2>
      
      {/* Upload Section */}
      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">Subir Códigos Nuevos</h3>
        
        <div>
          <label className="block text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase mb-2">
            Seleccionar Producto
          </label>
          <select
            value={codesProductId}
            onChange={(e) => setCodesProductId(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
          >
            <option value="">-- Selecciona un producto --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — ${p.priceUSD} USD</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase mb-2">
            Códigos (uno por línea)
          </label>
          <textarea
            value={codesText}
            onChange={(e) => setCodesText(e.target.value)}
            rows={6}
            placeholder="ABCD-1234-EFGH&#10;IJKL-5678-MNOP&#10;QRST-9012-UVWX"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono placeholder-zinc-600 resize-none"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <p className="text-[10px] md:text-xs text-zinc-500">
            {codesText.split('\n').filter(c => c.trim().length > 0).length} códigos detectados
          </p>
          <button
            onClick={handleUploadCodes}
            disabled={!codesProductId || !codesText.trim() || isUploadingCodes}
            className="w-full sm:w-auto justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black text-[10px] md:text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            {isUploadingCodes ? 'Subiendo...' : '⬆ Subir Códigos'}
          </button>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">Inventario de Códigos por Producto</h3>
        
        {codesStats.length === 0 ? (
          <p className="text-xs md:text-sm text-zinc-500 text-center py-6 md:py-8">No hay códigos cargados aún.</p>
        ) : (
          <div className="space-y-3">
            {codesStats.map((stat) => (
              <div key={stat.product_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 bg-black/30 rounded-xl border border-white/5">
                <div className="w-full sm:w-auto border-b border-white/5 sm:border-0 pb-2 sm:pb-0">
                  <p className="text-sm font-bold text-white">{stat.product_name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">ID: {stat.product_id.slice(0, 8)}...</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-center flex-1 sm:flex-none bg-black/20 sm:bg-transparent rounded-lg p-2 sm:p-0">
                    <p className="text-base md:text-lg font-black text-emerald-400">{stat.available}</p>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
