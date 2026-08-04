import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { DiamondIcon } from './DiamondIcon';
import { 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageCircle, 
  Image as ImageIcon,
  Search,
  Filter,
  ShieldAlert
} from 'lucide-react';

interface MyOrdersProps {
  orders: Order[];
  currentUserEmail?: string;
  onOpenWhatsAppSupport: (order?: Order) => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
  orders,
  currentUserEmail,
  onOpenWhatsAppSupport,
}) => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/30 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            Pendiente
          </span>
        );
      case 'En proceso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/30 shrink-0">
            <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            En proceso
          </span>
        );
      case 'Completado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Completado 💎
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Cancelado
          </span>
        );
    }
  };

  return (
    <section id="my-orders-section" className="py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-28 sm:pb-16">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-4 sm:pb-6">
        <div>
          <span className="text-emerald-400 font-black text-[10px] sm:text-xs uppercase tracking-widest block">Seguimiento en Tiempo Real</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
            Mis Pedidos de Recargas 📋
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 uppercase font-semibold tracking-wider">
            Consulta el avance de acreditación de tus diamantes cargados a tu ID de jugador.
          </p>
        </div>

        {/* Status Filters - Touch scrollable on mobile */}
        <div className="w-full md:w-auto flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-emerald-500/20 overflow-x-auto text-[11px] sm:text-xs font-black uppercase tracking-wider scrollbar-none">
          {(['all', 'Pendiente', 'En proceso', 'Completado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4 sm:space-y-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              id={`order-card-${order.id}`}
              className="bg-zinc-900/60 border border-emerald-500/20 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Order Card Top Bar */}
              <div className="bg-black text-white p-3.5 sm:p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="font-mono text-xs sm:text-sm font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 shrink-0">
                    #{order.id}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-black uppercase text-white block truncate">{order.productName}</span>
                    <span className="text-[10px] font-bold text-zinc-400 block">{order.date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t border-white/10 sm:border-0">
                  {getStatusBadge(order.status)}
                  <span className="text-lg sm:text-xl font-black text-white shrink-0">${order.priceUSD.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
                
                {/* Details Grid - Responsive 2 columns on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
                  <div className="bg-black/50 p-2.5 sm:p-3.5 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                    <span className="text-zinc-400 font-extrabold uppercase text-[9px] sm:text-[10px] block">ID del Jugador:</span>
                    <div className="flex items-center justify-between mt-1 gap-1.5">
                      <span className="font-mono font-black text-sm sm:text-base text-white truncate">{order.playerId}</span>
                      <button
                        onClick={() => handleCopy(order.playerId)}
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors shrink-0 cursor-pointer"
                        title="Copiar ID"
                      >
                        {copiedId === order.playerId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/50 p-2.5 sm:p-3.5 rounded-xl border border-white/10">
                    <span className="text-zinc-400 font-extrabold uppercase text-[9px] sm:text-[10px] block">Total Diamantes:</span>
                    <span className="font-black text-sm sm:text-base text-emerald-400 mt-1 block">
                      {order.diamondsTotal.toLocaleString()} 💎
                    </span>
                  </div>

                  <div className="bg-black/50 p-2.5 sm:p-3.5 rounded-xl border border-white/10">
                    <span className="text-zinc-400 font-extrabold uppercase text-[9px] sm:text-[10px] block">Banco Utilizado:</span>
                    <span className="font-black text-xs sm:text-sm text-white mt-1 block truncate">{order.bankName}</span>
                  </div>

                  <div className="bg-black/50 p-2.5 sm:p-3.5 rounded-xl border border-white/10 col-span-2 sm:col-span-1 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-zinc-400 font-extrabold uppercase text-[9px] sm:text-[10px] block">Baucher Comprobante:</span>
                      <span className="font-bold text-zinc-300 text-[10px] sm:text-[11px] truncate block">
                        {order.receiptFileName || 'Ver imagen'}
                      </span>
                    </div>
                    <button
                      onClick={() => setViewingReceiptUrl(order.receiptUrl)}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-black text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Ver</span>
                    </button>
                  </div>
                </div>

                {/* Status Progress Timeline */}
                <div className="bg-black/40 p-3 sm:p-4 rounded-xl border border-white/10 space-y-2.5 sm:space-y-3">
                  <span className="text-[10px] sm:text-xs font-black text-emerald-400 uppercase tracking-widest block">
                    Línea de Tiempo de Acreditación
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                    
                    {/* Step 1: Registered */}
                    <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-start gap-2 sm:gap-2.5">
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div>
                        <p className="font-black text-white text-xs uppercase">1. Pedido Registrado</p>
                        <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold">Comprobante recibido.</p>
                      </div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className={`p-2.5 sm:p-3.5 rounded-xl border flex items-start gap-2 sm:gap-2.5 ${
                      order.status === 'En proceso' || order.status === 'Completado'
                        ? 'bg-zinc-950 border-emerald-500/40'
                        : 'bg-zinc-950/40 border-white/5 opacity-40'
                    }`}>
                      <div className={`p-1 rounded-full mt-0.5 shrink-0 ${
                        order.status === 'En proceso'
                          ? 'bg-sky-500/20 text-sky-400 animate-pulse'
                          : order.status === 'Completado'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/10 text-zinc-500'
                      }`}>
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div>
                        <p className="font-black text-white text-xs uppercase">2. En Proceso</p>
                        <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold">Cargando diamantes al ID.</p>
                      </div>
                    </div>

                    {/* Step 3: Completed */}
                    <div className={`p-2.5 sm:p-3.5 rounded-xl border flex items-start gap-2 sm:gap-2.5 ${
                      order.status === 'Completado'
                        ? 'bg-emerald-500/10 border-emerald-500/50'
                        : 'bg-zinc-950/40 border-white/5 opacity-40'
                    }`}>
                      <div className={`p-1 rounded-full mt-0.5 shrink-0 ${
                        order.status === 'Completado' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-zinc-500'
                      }`}>
                        <DiamondIcon size="sm" variant={order.status === 'Completado' ? 'emerald' : 'gold'} />
                      </div>
                      <div>
                        <p className="font-black text-white text-xs uppercase">3. Entregado</p>
                        <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-semibold">Verifica en tu juego.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] sm:text-xs text-zinc-400 uppercase font-semibold text-center sm:text-left">
                    ¿Dudas con este pedido? Contacta a soporte por WhatsApp.
                  </span>

                  <button
                    onClick={() => onOpenWhatsAppSupport(order)}
                    className="w-full sm:w-auto px-4 sm:px-5 py-3.5 min-h-[44px] rounded-xl bg-emerald-500 text-black font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Consultar WhatsApp (Pedido #{order.id})</span>
                  </button>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="bg-zinc-900/60 rounded-2xl p-8 sm:p-12 text-center border border-zinc-800 space-y-3 text-white">
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-500 mx-auto" />
            <h3 className="text-base sm:text-lg font-black uppercase">No hay pedidos registrados</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto uppercase">
              Realiza tu primera recarga en el Catálogo para darle seguimiento aquí.
            </p>
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-4 rounded-2xl max-w-xl w-full border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between text-white border-b border-zinc-800 pb-2">
              <span className="font-bold text-sm">Visualizador de Baucher Comprobante</span>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>
            <div className="overflow-hidden rounded-xl max-h-[70vh] bg-black flex items-center justify-center">
              <img src={viewingReceiptUrl} alt="Baucher" className="max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
