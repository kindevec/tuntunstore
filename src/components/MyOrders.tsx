import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  ChevronDown,
  ChevronUp
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
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  useEffect(() => {
    if (filteredOrders.length > 0) {
      setExpandedOrderId(filteredOrders[0].id);
    } else {
      setExpandedOrderId(null);
    }
  }, [orders, statusFilter]);

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
    <section id="my-orders-section" className="pt-4 pb-2 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 sm:space-y-10">
      
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

        {/* Status Filters - Distributed Horizontally on Mobile */}
        <div className="w-full md:w-auto grid grid-cols-4 sm:flex items-center gap-1 sm:gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-zinc-800 shadow-xl text-[10px] sm:text-xs font-black uppercase tracking-wider">
          {(['all', 'Pendiente', 'En proceso', 'Completado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-1 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all cursor-pointer text-center truncate ${
                statusFilter === st
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
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
              className="bg-zinc-800 border border-zinc-700 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl transition-all relative group"
            >
              {/* Order Card Header - Compact & Responsive */}
              <div 
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 sm:p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-emerald-700 cursor-pointer transition-colors"
              >
                {/* Top / Left Block */}
                <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] sm:text-xs font-black text-white bg-black/25 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-white/20 shrink-0">
                      #{order.id.length > 10 ? order.id.slice(0, 8) : order.id}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-base font-black uppercase text-white block truncate">{order.productName}</span>
                      <span className="text-[9px] sm:text-xs font-medium text-emerald-100/90 block truncate">{order.date}</span>
                    </div>
                  </div>

                  {/* Price + Chevron on Mobile Right */}
                  <div className="flex items-center gap-1.5 sm:hidden shrink-0">
                    <span className="text-xs font-black text-white">${order.priceUSD.toFixed(2)}</span>
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="w-4 h-4 text-emerald-200" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-emerald-200" />
                    )}
                  </div>
                </div>

                {/* Bottom / Right Block */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1.5 sm:pt-0 border-t border-emerald-500/30 sm:border-0">
                  {getStatusBadge(order.status)}
                  
                  {/* Desktop Price + Chevron */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <span className="text-lg sm:text-xl font-black text-white">${order.priceUSD.toFixed(2)} USD</span>
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="w-5 h-5 text-emerald-200 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-emerald-200 shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Order Content - Simplified & Collapsible */}
              {expandedOrderId === order.id && (
                <div className="p-4 sm:p-6 space-y-5 bg-zinc-800">
                  
                  {/* Product Instructions */}
                  <div className="text-zinc-300 text-sm space-y-4 font-semibold">
                    <span className="text-[10px] sm:text-xs font-black text-emerald-400 uppercase tracking-widest block mb-2">
                      Instrucciones de Canje
                    </span>

                    <p>1. Ingresa al sitio oficial de Free Fire <a href="https://redeempins.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300">https://redeempins.com/</a></p>
                    
                    <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl shadow-inner flex flex-col gap-3">
                      <p className="text-zinc-400">2. Copia este código:</p>
                      
                      {order.redemptionCode ? (
                        <div className="flex items-center justify-between gap-3 bg-black p-3 rounded-lg border border-zinc-800 min-w-0">
                          <span className="font-mono text-emerald-400 font-black tracking-widest text-sm sm:text-lg break-all min-w-0 select-all">
                            {order.redemptionCode}
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(order.redemptionCode || '');
                              setCopiedCodeId(order.id);
                              setTimeout(() => setCopiedCodeId(null), 2000);
                            }}
                            className={`p-2.5 rounded-lg transition-all shrink-0 ${
                              copiedCodeId === order.id 
                                ? 'bg-emerald-500 text-black' 
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                            }`}
                            title="Copiar código"
                          >
                            {copiedCodeId === order.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 bg-black/50 p-4 rounded-lg border border-zinc-800/80">
                           <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin-slow" />
                           <span className="text-zinc-500 text-sm">El código se generará al completar el pedido.</span>
                        </div>
                      )}
                    </div>
                    
                    <p>3. Pon tu ID de Free Fire y toca «Verificar ID».</p>
                    <p>4. Toca «Canjear» y entra al juego para disfrutar tus diamantes. 🎉</p>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="pt-4 border-t border-zinc-700 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWhatsAppSupport(order);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-black uppercase text-xs flex items-center justify-center gap-2 border border-zinc-700 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all cursor-pointer group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] group-hover:text-black shrink-0 transition-colors">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span>Soporte WhatsApp</span>
                    </button>
                  </div>

                </div>
              )}
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
