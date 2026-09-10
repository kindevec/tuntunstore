import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWAOrdersViewProps {
  orders: Order[];
  currentUserEmail?: string;
  onOpenWhatsAppSupport: (order?: Order) => void;
  onNavigateToCatalog: () => void;
}

export const PWAOrdersView: React.FC<PWAOrdersViewProps> = ({
  orders,
  currentUserEmail,
  onOpenWhatsAppSupport,
  onNavigateToCatalog,
}) => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  const handleCopyCode = (orderId: string, code: string) => {
    triggerHaptic('success');
    navigator.clipboard.writeText(code);
    setCopiedCodeId(orderId);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completado':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Completado
          </span>
        );
      case 'En proceso':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full">
            <RefreshCw className="w-3 h-3 animate-spin" /> En proceso
          </span>
        );
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-300 bg-rose-500/20 border border-rose-400/40 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020b08] text-white pb-28 px-3.5 pt-3 select-none">
      {/* Cabecera y Filtros Segmentados */}
      <div className="mb-3">
        <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
          <span>Mis Pedidos y Pines</span>
          <span className="text-xs text-zinc-500 font-mono">({orders.length})</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-0.5">
          Aquí encuentras tus códigos de canje Free Fire listos para canjear.
        </p>

        {/* Píldoras de Filtro */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-1">
          {(['all', 'Completado', 'En proceso', 'Pendiente'] as const).map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => {
                  triggerHaptic('light');
                  setStatusFilter(st);
                }}
                className={`h-7 px-3 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-400 text-black shadow-md'
                    : 'bg-[#061711] border border-emerald-500/20 text-zinc-400 hover:text-white'
                }`}
              >
                {st === 'all' ? 'Todos' : st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Pedidos (Estilo Tarjeta de Loot Gamer) */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const hasCode = !!order.redemptionCode;

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-gradient-to-b from-[#091a13] via-[#05140f] to-[#020b08] border border-emerald-500/30 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              >
                {/* Cabecera del pedido colapsable */}
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setExpandedOrderId(isExpanded ? null : order.id);
                  }}
                  className="p-3.5 flex items-center justify-between gap-2 cursor-pointer active:bg-emerald-950/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#03140e] border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <img src="/diamante.webp" alt="Diamante" className="w-6 h-6 object-contain drop-shadow" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-white truncate leading-tight">
                        {order.productName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-zinc-400 font-mono">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          ${order.priceUSD.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusBadge(order.status)}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Detalle Desplegable */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-emerald-950/80 space-y-3">
                    {/* CÓDIGO DE RECANJE DESTACADO */}
                    {hasCode ? (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-[#0c2a1e] to-[#041d14] border border-emerald-400/50 shadow-inner">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            Código PIN de Canje Oficial
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono">
                            Garena Free Fire
                          </span>
                        </div>

                        {/* Caja del código monoespaciado */}
                        <div className="flex items-center justify-between bg-black/60 border border-emerald-500/30 rounded-xl px-3 py-2">
                          <span className="text-xs sm:text-sm font-black font-mono text-emerald-300 tracking-wider select-all truncate pr-2">
                            {order.redemptionCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(order.id, order.redemptionCode!)}
                            className="h-7 px-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shrink-0 active:scale-90 transition-all shadow-sm"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedCodeId === order.id ? '¡Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>

                        {/* Botón directo a Garena */}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <a
                            href="https://redeempins.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir Página de Canje (Garena)</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#061711] border border-emerald-500/20 text-center">
                        <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <span className="text-xs text-zinc-300 font-bold block">
                          Generando tu código PIN...
                        </span>
                        <span className="text-[10.5px] text-zinc-500 block mt-0.5">
                          Tu código aparecerá aquí automáticamente en breves momentos.
                        </span>
                      </div>
                    )}

                    {/* Metadatos del Pedido */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-xl bg-[#04130d] border border-emerald-500/15">
                        <span className="text-zinc-500 block text-[9.5px] uppercase">ID Jugador:</span>
                        <span className="font-mono text-zinc-200 font-bold">{order.playerId || 'No especificado'}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#04130d] border border-emerald-500/15">
                        <span className="text-zinc-500 block text-[9.5px] uppercase">Fecha:</span>
                        <span className="text-zinc-200 font-bold">
                          {new Date(order.date).toLocaleDateString('es-EC', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Botón de soporte por pedido */}
                    <button
                      type="button"
                      onClick={() => onOpenWhatsAppSupport(order)}
                      className="w-full py-2 rounded-xl bg-[#061c14] border border-emerald-500/30 text-emerald-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>Soporte WhatsApp para este pedido</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-[#061711] border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-7 h-7 text-emerald-400" />
          </div>
          <p className="text-white text-sm font-bold">No tienes pedidos en esta sección</p>
          <p className="text-zinc-500 text-xs mt-1">Explora el catálogo para recargar diamantes al instante.</p>
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigateToCatalog();
            }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-md"
          >
            Ver Catálogo
          </button>
        </div>
      )}
    </div>
  );
};
