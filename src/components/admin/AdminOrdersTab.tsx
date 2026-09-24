import React, { useState, useEffect } from 'react';
import { Search, Copy, Check, Layers, Clock, RefreshCw, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { Order, OrderStatus, AdminDashboardStats } from '../../types';

interface AdminOrdersTabProps {
  orders?: Order[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: any) => void;
  filteredOrders: Order[];
  handleCopyPlayerId: (id: string) => void;
  copiedPlayerId: string | null;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  setSelectedReceiptUrl?: (url: string | null) => void;
  isPWA?: boolean;
  adminStats?: AdminDashboardStats;
}

const formatCount = (n: number): string => {
  if (!n) return '';
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '')}k`;
  return n.toString();
};

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filteredOrders,
  handleCopyPlayerId,
  copiedPlayerId,
  onUpdateOrderStatus,
  isPWA = false,
  adminStats,
}) => {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Status configuration for PWA icon filters
  const statusConfigs = [
    {
      id: 'all' as const,
      label: 'Todos los pedidos',
      icon: Layers,
      activeBg: 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      inactiveText: 'text-zinc-400 hover:text-zinc-200',
      count: adminStats?.total_orders ?? orders?.length ?? filteredOrders.length,
      badgeBg: '',
    },
    {
      id: 'Pendiente' as const,
      label: 'Pedidos pendientes',
      icon: Clock,
      activeBg: 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]',
      inactiveText: 'text-amber-400 hover:text-amber-300',
      count: adminStats?.pending_orders ?? (orders ? orders.filter(o => o.status === 'Pendiente').length : 0),
      badgeBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'En proceso' as const,
      label: 'En proceso de carga a ID',
      icon: RefreshCw,
      activeBg: 'bg-sky-400 text-black shadow-[0_0_15px_rgba(56,189,248,0.4)]',
      inactiveText: 'text-sky-400 hover:text-sky-300',
      count: adminStats?.in_progress_orders ?? (orders ? orders.filter(o => o.status === 'En proceso').length : 0),
      badgeBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    },
    {
      id: 'Completado' as const,
      label: 'Pedidos completados',
      icon: CheckCircle2,
      activeBg: 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      inactiveText: 'text-emerald-400 hover:text-emerald-300',
      count: adminStats?.completed_orders ?? (orders ? orders.filter(o => o.status === 'Completado').length : 0),
      badgeBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'Cancelado' as const,
      label: 'Pedidos cancelados',
      icon: XCircle,
      activeBg: 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]',
      inactiveText: 'text-rose-400 hover:text-rose-300',
      count: adminStats?.cancelled_orders ?? (orders ? orders.filter(o => o.status === 'Cancelado').length : 0),
      badgeBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Controls Bar: Amplio, limpio y ergonómico */}
      <div className="bg-gradient-to-b from-zinc-900/95 via-zinc-900/80 to-[#040c09] p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl space-y-3">
        {/* Search input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por ID jugador, orden o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-semibold text-xs sm:text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs font-black p-1 rounded-md cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Section */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] sm:text-xs text-zinc-400 font-black uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" /> Filtrar por Estado
            </span>
            <span className="text-[10px] font-bold text-zinc-500">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>

          {isPWA ? (
            /* Spacious 5-column icon bar for PWA with floating count badges */
            <div className="grid grid-cols-5 gap-2 w-full pt-1 select-none">
              {statusConfigs.map((cfg) => {
                const Icon = cfg.icon;
                const isActive = statusFilter === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => setStatusFilter(cfg.id)}
                    title={cfg.label}
                    aria-label={cfg.label}
                    className={`relative flex items-center justify-center h-11 rounded-xl transition-all duration-200 cursor-pointer select-none border ${
                      isActive
                        ? `${cfg.activeBg} border-transparent shadow-lg scale-105 ring-1 ring-white/25`
                        : `bg-black/50 ${cfg.inactiveText} border-white/10 hover:border-white/20 hover:bg-zinc-800/80 active:scale-95`
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    {cfg.count > 0 && (
                      <span
                        className={`absolute -top-1.5 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center leading-none shadow-md ${
                          isActive
                            ? 'bg-black text-white border border-white/30'
                            : cfg.badgeBg || 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {formatCount(cfg.count)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Original text buttons for normal desktop/browser */
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-hide">
              {(['all', 'Pendiente', 'En proceso', 'Completado', 'Cancelado'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-700/60'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card List (Visible on mobile/tablet) */}
      <div className="grid grid-cols-1 gap-3.5 lg:hidden">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order) => (
            <div key={order.id} className="bg-zinc-800 rounded-2xl border border-zinc-700/50 p-4 space-y-3 shadow-lg flex flex-col">
              {/* Top bar: Order ID, Status, Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-700/50 pb-2.5">
                <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                  <span className="font-mono font-black text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    #{order.id}
                  </span>
                  <span className="text-[10px] sm:text-xs text-zinc-400 font-bold">{order.date}</span>
                </div>
                <div className="self-end sm:self-auto">
                  {order.status === 'Pendiente' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30 whitespace-nowrap">
                      🟡 Pendiente
                    </span>
                  )}
                  {order.status === 'En proceso' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-400/10 text-sky-400 border border-sky-400/30 whitespace-nowrap">
                      🔵 En Proceso
                    </span>
                  )}
                  {order.status === 'Completado' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                      🟢 Completado
                    </span>
                  )}
                  {order.status === 'Cancelado' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 whitespace-nowrap">
                      🔴 Cancelado
                    </span>
                  )}
                </div>
              </div>

              {/* Player ID & Name block */}
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">ID Jugador FF:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono font-black text-sm sm:text-base text-amber-300 break-all">
                      {order.playerId}
                    </span>
                    <button
                      onClick={() => handleCopyPlayerId(order.playerId)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 active:scale-95 transition-transform cursor-pointer shrink-0"
                      title="Copiar ID para Free Fire"
                    >
                      {copiedPlayerId === order.playerId ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="sm:text-right border-t border-zinc-700/50 sm:border-0 pt-2 sm:pt-0">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Cliente:</span>
                  <span className="text-xs sm:text-sm font-bold text-white break-words">{order.userName}</span>
                </div>
              </div>

              {/* Product details & Price */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-700/50 flex-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Producto:</span>
                  <p className="font-black text-white uppercase text-xs sm:text-sm line-clamp-2" title={order.productName}>
                    {order.productName}
                  </p>
                  {order.isWalletTopUp ? (
                    <span className="text-[9px] sm:text-[10px] bg-amber-400/20 text-amber-300 font-black px-1.5 py-0.5 rounded inline-block mt-1 uppercase">
                      💰 Recarga USD
                    </span>
                  ) : (
                    <span className="text-[10px] sm:text-xs text-emerald-400 font-black block mt-1">
                      {order.diamondsTotal?.toLocaleString() || 0} 💎
                    </span>
                  )}
                </div>

                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-700/50 flex-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Monto / Pago:</span>
                  <p className="font-black text-emerald-300 text-sm sm:text-base mt-0.5">${(order.priceUSD || 0).toFixed(2)} USD</p>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mt-1 truncate" title={order.paymentMethod === 'wallet_balance' ? 'Saldo Billetera' : order.bankName}>
                    {order.paymentMethod === 'wallet_balance' ? '⚡ Saldo Billetera' : order.bankName}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-1 border-t border-zinc-700/50">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-2">Acción de Estado:</span>
                <div className="w-full">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                    className="w-full py-3 px-3 rounded-xl bg-zinc-900 border border-zinc-600 text-white text-xs sm:text-sm font-black uppercase transition-colors focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none"
                  >
                    <option value="Pendiente">🟡 Pendiente</option>
                    <option value="En proceso">🔵 En Proceso</option>
                    <option value="Completado">🟢 Completado / Acreditar</option>
                    <option value="Cancelado">🔴 Cancelar</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-zinc-900/60 p-6 sm:p-8 rounded-2xl border border-white/10 text-center text-zinc-500 font-bold uppercase text-xs sm:text-sm flex flex-col items-center justify-center gap-2">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 opacity-50 mb-2" />
            No hay pedidos que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* Orders Desktop Central Table (Hidden on mobile) */}
      <div className="hidden lg:block bg-zinc-800 rounded-2xl border border-zinc-700/50 shadow-xl overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-zinc-900/80 text-emerald-400 uppercase font-black text-[10px] sm:text-xs tracking-widest border-b border-zinc-700">
              <tr>
                <th className="p-4 w-32">Orden</th>
                <th className="p-4">Jugador / ID</th>
                <th className="p-4">Producto & Diamantes</th>
                <th className="p-4">Monto / Banco</th>
                <th className="p-4 w-32">Estado</th>
                <th className="p-4 w-40 text-right">Acción de Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-700/30 transition-colors">
                    {/* Order ID & Date */}
                    <td className="p-4">
                      <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 text-xs">
                        #{order.id}
                      </span>
                      <span className="text-[10px] sm:text-xs text-zinc-500 font-bold block mt-1.5">{order.date}</span>
                    </td>

                    {/* Player ID with Quick Copy */}
                    <td className="p-4 max-w-[200px] truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs sm:text-sm text-white bg-zinc-900 px-2.5 py-1 rounded border border-zinc-700/50">
                          {order.playerId}
                        </span>
                        <button
                          onClick={() => handleCopyPlayerId(order.playerId)}
                          className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 transition-colors"
                          title="Copiar ID para Free Fire"
                        >
                          {copiedPlayerId === order.playerId ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-zinc-400 block mt-1 truncate" title={order.userName}>{order.userName}</span>
                    </td>

                    {/* Product & Diamonds */}
                    <td className="p-4 max-w-[250px] truncate">
                      <span className="font-black text-white uppercase text-xs sm:text-sm block truncate" title={order.productName}>{order.productName}</span>
                      {order.isWalletTopUp ? (
                        <span className="text-[9px] sm:text-[10px] bg-amber-400 text-black font-black px-1.5 py-0.5 rounded inline-block mt-1.5 uppercase">
                          💰 Recarga de Billetera USD
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-emerald-400 font-black block mt-1">
                          {order.diamondsTotal?.toLocaleString() || 0} 💎 Totales
                        </span>
                      )}
                    </td>

                    {/* Price & Bank */}
                    <td className="p-4 max-w-[180px] truncate">
                      <span className="font-black text-sm sm:text-base text-white">${(order.priceUSD || 0).toFixed(2)} USD</span>
                      {order.paymentMethod === 'wallet_balance' ? (
                        <span className="text-[9px] sm:text-[10px] text-emerald-400 font-black block uppercase mt-1">
                          ⚡ Saldo Billetera TunTun
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-zinc-400 block uppercase font-bold mt-1 truncate" title={order.bankName}>{order.bankName}</span>
                      )}
                    </td>

                    {/* Current Status Badge */}
                    <td className="p-4">
                      {order.status === 'Pendiente' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30">
                          🟡 Pendiente
                        </span>
                      )}
                      {order.status === 'En proceso' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase bg-sky-400/10 text-sky-400 border border-sky-400/30">
                          🔵 En Proceso
                        </span>
                      )}
                      {order.status === 'Completado' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          🟢 Completado
                        </span>
                      )}
                      {order.status === 'Cancelado' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          🔴 Cancelado
                        </span>
                      )}
                    </td>

                    {/* State Change Buttons for Admin */}
                    <td className="p-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-600 text-white text-[10px] sm:text-xs font-black uppercase transition-colors focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none text-right"
                      >
                        <option value="Pendiente">🟡 Pendiente</option>
                        <option value="En proceso">🔵 En Proceso</option>
                        <option value="Completado">🟢 Completar / Acreditar</option>
                        <option value="Cancelado">🔴 Cancelar</option>
                      </select>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-bold uppercase">
                    No hay pedidos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > 0 && (
        <div className="p-4 border-t border-zinc-700/50 flex items-center justify-between bg-zinc-900/50 rounded-xl sm:rounded-2xl">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 text-xs font-black rounded-xl uppercase transition-colors cursor-pointer"
          >
            Anterior
          </button>
          <span className="text-xs text-zinc-400 font-bold">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 text-xs font-black rounded-xl uppercase transition-colors cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
