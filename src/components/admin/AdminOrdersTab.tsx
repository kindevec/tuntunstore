import React from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface AdminOrdersTabProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  filteredOrders: Order[];
  handleCopyPlayerId: (id: string) => void;
  copiedPlayerId: string | null;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filteredOrders,
  handleCopyPlayerId,
  copiedPlayerId,
  onUpdateOrderStatus
}) => {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-700/50">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por ID jugador, orden o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-zinc-400 font-black uppercase mb-1 sm:mb-0">Estado:</span>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {(['all', 'Pendiente', 'En proceso', 'Completado', 'Cancelado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Card List (Visible on mobile/tablet) */}
      <div className="grid grid-cols-1 gap-3.5 lg:hidden">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
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
    </div>
  );
};
