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
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

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
    <section id="my-orders-section" className="py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 sm:space-y-10">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-emerald-900/30 pb-6 sm:pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest">Seguimiento en Tiempo Real</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 uppercase tracking-tight">
            Mis Pedidos
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm uppercase font-semibold tracking-wider max-w-lg">
            Revisa el estado de tus compras y obtén tus códigos de canje al instante.
          </p>
        </div>

        {/* Status Filters */}
        <div className="w-full md:w-auto flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-xl overflow-x-auto text-[11px] sm:text-xs font-black uppercase tracking-wider scrollbar-none">
          {(['all', 'Pendiente', 'En proceso', 'Completado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
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
              className="bg-[#131315] border border-zinc-800/80 hover:border-emerald-500/30 rounded-[24px] overflow-hidden shadow-2xl transition-all relative group"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent group-hover:via-emerald-400/50 transition-colors" />

              {/* Order Card Header */}
              <div className="bg-gradient-to-r from-zinc-900 to-[#131315] p-5 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="bg-zinc-950 p-2 sm:p-3 rounded-2xl border border-zinc-800 shadow-inner flex flex-col items-center justify-center shrink-0 min-w-[70px]">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Orden</span>
                    <span className="font-mono text-sm sm:text-base font-black text-white">#{order.id}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-base sm:text-xl font-black uppercase text-zinc-100 block truncate tracking-tight">{order.productName}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-500 block uppercase tracking-widest">{order.date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-4 sm:pt-0 border-t border-zinc-800 sm:border-0">
                  {getStatusBadge(order.status)}
                  <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight shrink-0 flex items-center gap-1">
                      <span className="text-xs text-emerald-500/70 font-bold -mt-2">$</span>
                      {order.priceUSD.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-5 sm:p-8 space-y-6 bg-[#0a0a0b]/40">
                
                {/* Product Instructions */}
                <div className="bg-[#18181b] p-5 sm:p-7 rounded-2xl border border-zinc-800/80 shadow-lg relative overflow-hidden">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                  <span className="text-[10px] sm:text-xs font-black text-amber-500 uppercase tracking-widest block mb-5 flex items-center gap-2">
                    <DiamondIcon size="sm" variant="gold" />
                    Instrucciones del producto
                  </span>

                  <div className="text-zinc-300 text-sm sm:text-base space-y-4 font-medium relative z-10">
                    <p className="flex items-start gap-2">
                      <span className="text-zinc-500 font-black">1.</span> 
                      <span>Accede al sitio oficial de canje de Free Fire <a href="https://redeempins.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold underline decoration-emerald-500/30 underline-offset-4 hover:text-emerald-300 hover:decoration-emerald-400 transition-colors">https://redeempins.com/</a></span>
                    </p>
                    
                    <div className="bg-zinc-950 border border-amber-500/20 p-4 sm:p-5 rounded-xl shadow-inner ml-0 sm:ml-5 flex flex-col gap-3">
                      <p className="flex items-start gap-2 text-zinc-400">
                        <span className="text-amber-500/50 font-black">2.</span>
                        Copia este código:
                      </p>
                      
                      {order.redemptionCode ? (
                        <div className="flex items-center justify-between bg-[#0a0a0b] p-2.5 rounded-lg border border-zinc-800 shadow-sm group">
                          <span className="font-mono text-emerald-400 font-black tracking-[0.2em] text-lg sm:text-2xl px-3">{order.redemptionCode}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(order.redemptionCode || '');
                              setCopiedCodeId(order.id);
                              setTimeout(() => setCopiedCodeId(null), 2000);
                            }}
                            className={`p-3 rounded-md transition-all flex items-center justify-center ${
                              copiedCodeId === order.id 
                                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white group-hover:border-zinc-600'
                            }`}
                            title="Copiar código"
                          >
                            {copiedCodeId === order.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3 bg-[#0a0a0b] p-4 rounded-lg border border-zinc-800/80 border-dashed">
                           <RefreshCw className="w-5 h-5 text-amber-500/40 animate-spin-slow" />
                           <span className="text-amber-500/60 text-sm font-semibold">El código estará disponible cuando se complete tu pedido.</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="flex items-start gap-2 text-zinc-400"><span className="text-zinc-600 font-black">3.</span> Pon tu ID de Free Fire.</p>
                    <p className="flex items-start gap-2 text-zinc-400"><span className="text-zinc-600 font-black">4.</span> Toca <strong className="text-zinc-300 px-1">«Verificar ID»</strong>.</p>
                    <p className="flex items-start gap-2 text-zinc-400"><span className="text-zinc-600 font-black">5.</span> Toca <strong className="text-zinc-300 px-1">«Canjear»</strong>.</p>
                    <p className="flex items-start gap-2"><span className="text-emerald-500/50 font-black">6.</span> <span className="text-zinc-100 font-bold">Entra al juego y disfruta tus diamantes. 🎉</span></p>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <span className="text-[11px] text-zinc-500 uppercase font-bold text-center sm:text-left flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-500/40" />
                    ¿Dudas con este pedido? Contacta a soporte por WhatsApp.
                  </span>

                  <button
                    onClick={() => onOpenWhatsAppSupport(order)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-800 text-zinc-200 font-black uppercase text-xs flex items-center justify-center gap-2.5 border border-zinc-700 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all cursor-pointer shadow-lg group"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:text-black shrink-0 transition-colors" />
                    <span>Soporte WhatsApp</span>
                  </button>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#131315] rounded-[32px] p-10 sm:p-16 text-center border border-zinc-800/80 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
            <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-600 mx-auto mb-6" />
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">No hay pedidos registrados</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto font-medium">
              Realiza tu primera compra en el catálogo para darle seguimiento y obtener tus códigos aquí.
            </p>
          </div>
        )}
      </div>

    </section>
  );
};
