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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-black/20 text-amber-300 border border-amber-300/30 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            Pendiente
          </span>
        );
      case 'En proceso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-black/20 text-sky-200 border border-sky-200/30 shrink-0">
            <RefreshCw className="w-3.5 h-3.5 text-sky-200 animate-spin" />
            En proceso
          </span>
        );
      case 'Completado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-black/20 text-white border border-white/30 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            Completado 💎
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-black/20 text-rose-200 border border-rose-200/30 shrink-0">
            <XCircle className="w-3.5 h-3.5 text-rose-200" />
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
      <div className="space-y-6 sm:space-y-8">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              id={`order-card-${order.id}`}
              className="bg-zinc-800 border border-zinc-700 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-2xl transition-all relative group"
            >
              {/* Subtle top glow line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent group-hover:via-emerald-400 transition-colors" />

              {/* Order Card Top Bar */}
              <div className="bg-emerald-600 text-white p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-700">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs sm:text-sm font-black text-white bg-black/20 px-3 py-1.5 rounded-lg border border-white/20 shrink-0">
                    #{order.id}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-base font-black uppercase text-white block truncate">{order.productName}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-100 block">{order.date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t border-emerald-700/50 sm:border-0">
                  {getStatusBadge(order.status)}
                  <span className="text-lg sm:text-xl font-black text-white shrink-0">${order.priceUSD.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-4 sm:p-6 space-y-6">
                
                {/* Details Grid - Responsive 2 columns on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
                  <div className="bg-zinc-700 p-3 sm:p-4 rounded-xl border border-zinc-600/50 col-span-2 sm:col-span-1 shadow-sm">
                    <span className="text-zinc-400 font-extrabold uppercase text-[10px] block mb-1">ID del Jugador:</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-sm sm:text-base text-zinc-100 truncate">{order.playerId}</span>
                      <button
                        onClick={() => handleCopy(order.playerId)}
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors shrink-0 cursor-pointer"
                        title="Copiar ID"
                      >
                        {copiedId === order.playerId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-700 p-3 sm:p-4 rounded-xl border border-zinc-600/50 shadow-sm">
                    <span className="text-zinc-400 font-extrabold uppercase text-[10px] block mb-1">Total Diamantes:</span>
                    <span className="font-black text-sm sm:text-base text-emerald-400 block">
                      {order.diamondsTotal.toLocaleString()} 💎
                    </span>
                  </div>

                  <div className="bg-zinc-700 p-3 sm:p-4 rounded-xl border border-zinc-600/50 shadow-sm">
                    <span className="text-zinc-400 font-extrabold uppercase text-[10px] block mb-1">Banco Utilizado:</span>
                    <span className="font-black text-sm text-zinc-100 block truncate">{order.bankName}</span>
                  </div>

                  <div className="bg-zinc-700 p-3 sm:p-4 rounded-xl border border-zinc-600/50 col-span-2 sm:col-span-1 flex items-center justify-between shadow-sm">
                    <div className="min-w-0 pr-2">
                      <span className="text-zinc-400 font-extrabold uppercase text-[10px] block mb-1">Comprobante:</span>
                      <span className="font-bold text-zinc-300 text-xs truncate block">
                        {order.receiptFileName || 'Ver imagen'}
                      </span>
                    </div>
                    <button
                      onClick={() => setViewingReceiptUrl(order.receiptUrl)}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Ver</span>
                    </button>
                  </div>
                </div>

                {/* Status Progress Timeline */}
                <div className="bg-zinc-700/50 p-4 sm:p-5 rounded-xl border border-zinc-600/50 space-y-4">
                  <span className="text-[10px] sm:text-xs font-black text-emerald-400/80 uppercase tracking-widest block">
                    Línea de Tiempo de Acreditación
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    
                    {/* Step 1: Registered */}
                    <div className="p-3 sm:p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 flex items-start gap-3 shadow-inner">
                      <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-zinc-100 text-xs uppercase mb-0.5">1. Pedido Registrado</p>
                        <p className="text-[10px] text-zinc-400 uppercase font-bold">Comprobante recibido.</p>
                      </div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className={`p-3 sm:p-4 rounded-xl border flex items-start gap-3 shadow-inner ${
                      order.status === 'En proceso' || order.status === 'Completado'
                        ? 'bg-zinc-700 border-emerald-500/30'
                        : 'bg-zinc-800 border-zinc-600/50 opacity-60'
                    }`}>
                      <div className={`p-1.5 rounded-full shrink-0 ${
                        order.status === 'En proceso'
                          ? 'bg-sky-500/20 text-sky-400 animate-pulse'
                          : order.status === 'Completado'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`font-black text-xs uppercase mb-0.5 ${order.status === 'En proceso' || order.status === 'Completado' ? 'text-zinc-100' : 'text-zinc-500'}`}>2. En Proceso</p>
                        <p className="text-[10px] text-zinc-400 uppercase font-bold">Cargando diamantes al ID.</p>
                      </div>
                    </div>

                    {/* Step 3: Completed */}
                    <div className={`p-3 sm:p-4 rounded-xl border flex items-start gap-3 shadow-inner ${
                      order.status === 'Completado'
                        ? 'bg-emerald-950/20 border-emerald-500/50'
                        : 'bg-zinc-800 border-zinc-700/50 opacity-60'
                    }`}>
                      <div className={`p-1.5 rounded-full shrink-0 ${
                        order.status === 'Completado' ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        <DiamondIcon size="sm" variant={order.status === 'Completado' ? 'emerald' : 'gold'} />
                      </div>
                      <div>
                        <p className={`font-black text-xs uppercase mb-0.5 ${order.status === 'Completado' ? 'text-zinc-100' : 'text-zinc-500'}`}>3. Entregado</p>
                        <p className="text-[10px] text-zinc-400 uppercase font-bold">Verifica en tu juego.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-zinc-800">
                  <span className="text-xs text-zinc-400 uppercase font-bold text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-500/70" />
                    ¿Dudas con este pedido? Contacta a soporte por WhatsApp.
                  </span>

                  <button
                    onClick={() => onOpenWhatsAppSupport(order)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 text-black font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:scale-[1.02] transition-all cursor-pointer"
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
