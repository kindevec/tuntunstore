import React, { useState } from 'react';
import { Order, OrderStatus, Product, EmailAlertConfig, UserProfile } from '../types';
import { DiamondIcon } from './DiamondIcon';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  XCircle, 
  Eye, 
  Plus, 
  Trash2, 
  Edit, 
  Mail, 
  Bell, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Wallet,
  Copy, 
  Check, 
  Save, 
  Sparkles,
  Send,
  AlertCircle
} from 'lucide-react';

interface AdminPanelProps {
  orders: Order[];
  products: Product[];
  emailConfig: EmailAlertConfig;
  registeredUsers?: UserProfile[];
  activeSubTab?: 'orders' | 'catalog' | 'email' | 'wallets';
  onSubTabChange?: (tab: 'orders' | 'catalog' | 'email' | 'wallets') => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateEmailConfig: (config: EmailAlertConfig) => void;
  onUpdateUserWalletBalance?: (email: string, amount: number, isSetExact?: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  products,
  emailConfig,
  registeredUsers = [],
  activeSubTab,
  onSubTabChange,
  onUpdateOrderStatus,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateEmailConfig,
  onUpdateUserWalletBalance,
}) => {
  const [internalTab, setInternalTab] = useState<'orders' | 'catalog' | 'email' | 'wallets'>('orders');
  const activeTab = activeSubTab || internalTab;

  const handleTabChange = (tab: 'orders' | 'catalog' | 'email' | 'wallets') => {
    setInternalTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [userCustomAmounts, setUserCustomAmounts] = useState<{ [email: string]: string }>({});
  
  // Modal for Viewing Receipt Image
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [copiedPlayerId, setCopiedPlayerId] = useState<string | null>(null);

  // Catalog CRUD Form state
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

  // Test Email Notification Modal State
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmailSentSuccess, setTestEmailSentSuccess] = useState(false);

  // Stats Calculations
  const totalSalesUSD = orders
    .filter((o) => o.status === 'Completado')
    .reduce((sum, o) => sum + o.priceUSD, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pendiente').length;
  const inProgressOrdersCount = orders.filter((o) => o.status === 'En proceso').length;
  const totalDiamondsDelivered = orders
    .filter((o) => o.status === 'Completado')
    .reduce((sum, o) => sum + o.diamondsTotal, 0);

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter;
    const matchesQuery =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.playerId.includes(searchQuery) ||
      o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleCopyPlayerId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedPlayerId(id);
    setTimeout(() => setCopiedPlayerId(null), 2000);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      onUpdateProduct({
        ...productForm,
        id: editingProductId,
      });
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
      description: product.description,
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

  const triggerTestEmailAlert = () => {
    setTestEmailSentSuccess(true);
    setTimeout(() => {
      setTestEmailSentSuccess(false);
    }, 4000);
  };

  return (
    <section id="admin-panel-section" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      


      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        <div className="bg-zinc-900/60 p-3.5 sm:p-5 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-2">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ventas Totales USD</p>
            <p className="text-xl sm:text-3xl font-black text-white mt-1">${totalSalesUSD.toFixed(2)}</p>
            <p className="text-[9px] sm:text-[10px] text-emerald-400 font-extrabold uppercase mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Acreditación
            </p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-zinc-900/60 p-3.5 sm:p-5 rounded-2xl border border-amber-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-2">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pedidos Pendientes</p>
            <p className="text-xl sm:text-3xl font-black text-amber-400 mt-1">{pendingOrdersCount}</p>
            <p className="text-[9px] sm:text-[10px] text-amber-400/80 font-extrabold uppercase mt-1">Revisar comprobante</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-zinc-900/60 p-3.5 sm:p-5 rounded-2xl border border-sky-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-2">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest">En Proceso</p>
            <p className="text-xl sm:text-3xl font-black text-sky-400 mt-1">{inProgressOrdersCount}</p>
            <p className="text-[9px] sm:text-[10px] text-sky-400/80 font-extrabold uppercase mt-1">Cargando a ID</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 shrink-0">
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-zinc-900/60 p-3.5 sm:p-5 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-2">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest">Diamantes Entregados</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{totalDiamondsDelivered.toLocaleString()} 💎</p>
            <p className="text-[9px] sm:text-[10px] text-emerald-400/80 font-extrabold uppercase mt-1">Free Fire Ecuador</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <DiamondIcon size="md" variant="emerald" />
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs - Hidden on mobile since they are present in bottom navigation */}
      <div className="hidden md:flex items-center gap-2 border-b border-emerald-900/30 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => handleTabChange('orders')}
          className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeTab === 'orders'
              ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pedidos ({orders.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('wallets')}
          className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeTab === 'wallets'
              ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Saldos USD ({registeredUsers.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('catalog')}
          className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeTab === 'catalog'
              ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>CRUD Catálogo</span>
        </button>

        <button
          onClick={() => handleTabChange('email')}
          className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeTab === 'email'
              ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Alertas Correo</span>
        </button>
      </div>

      {/* TAB 1: GESTIÓN DE PEDIDOS Y COMPROBANTES */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-white/10">
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por ID jugador, orden o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs text-zinc-400 font-black uppercase">Estado:</span>
              {(['all', 'Pendiente', 'En proceso', 'Completado', 'Cancelado'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-black'
                      : 'bg-black text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Card List (Visible on mobile/tablet) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-zinc-900/90 rounded-2xl border border-white/10 p-4 space-y-3 shadow-lg">
                  {/* Top bar: Order ID, Status, Date */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                        #{order.id}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">{order.date}</span>
                    </div>
                    <div>
                      {order.status === 'Pendiente' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30">
                          🟡 Pendiente
                        </span>
                      )}
                      {order.status === 'En proceso' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-400/10 text-sky-400 border border-sky-400/30">
                          🔵 En Proceso
                        </span>
                      )}
                      {order.status === 'Completado' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          🟢 Completado
                        </span>
                      )}
                      {order.status === 'Cancelado' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          🔴 Cancelado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Player ID & Name block */}
                  <div className="bg-black/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">ID Jugador FF:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-black text-sm text-amber-300">
                          {order.playerId}
                        </span>
                        <button
                          onClick={() => handleCopyPlayerId(order.playerId)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 active:scale-95 transition-transform cursor-pointer"
                          title="Copiar ID para Free Fire"
                        >
                          {copiedPlayerId === order.playerId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Cliente:</span>
                      <span className="text-xs font-bold text-white">{order.userName}</span>
                    </div>
                  </div>

                  {/* Product details & Price */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Producto:</span>
                      <p className="font-black text-white uppercase text-xs truncate mt-0.5">{order.productName}</p>
                      {order.isWalletTopUp ? (
                        <span className="text-[9px] bg-amber-400/20 text-amber-300 font-black px-1.5 py-0.5 rounded inline-block mt-1 uppercase">
                          💰 Recarga USD
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-black block mt-0.5">
                          {order.diamondsTotal.toLocaleString()} 💎
                        </span>
                      )}
                    </div>

                    <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Monto / Pago:</span>
                      <p className="font-black text-emerald-300 text-sm mt-0.5">${order.priceUSD.toFixed(2)} USD</p>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block truncate">
                        {order.paymentMethod === 'wallet_balance' ? '⚡ Saldo Billetera' : order.bankName}
                      </span>
                    </div>
                  </div>

                  {/* Baucher Button */}
                  <div>
                    <button
                      onClick={() => setSelectedReceiptUrl(order.receiptUrl)}
                      className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-black text-xs flex items-center justify-center gap-2 border border-emerald-500/30 active:scale-98 transition-all cursor-pointer uppercase"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Baucher Comprobante</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1.5">Acción de Estado:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'En proceso')}
                        className="py-2.5 px-1 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 text-[10px] font-black uppercase text-center cursor-pointer transition-colors"
                      >
                        🔵 En Proceso
                      </button>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Completado')}
                        className={`py-2.5 px-1 rounded-xl text-[10px] font-black uppercase text-center cursor-pointer transition-colors shadow-sm ${
                          order.isWalletTopUp
                            ? 'bg-amber-400 text-black font-extrabold hover:bg-amber-300'
                            : 'bg-emerald-500 text-black hover:bg-emerald-400'
                        }`}
                      >
                        {order.isWalletTopUp ? `⚡ Acreditar` : '🟢 Completado'}
                      </button>
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Cancelado')}
                        className="py-2.5 px-1 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-[10px] font-black uppercase text-center cursor-pointer transition-colors"
                      >
                        🔴 Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-zinc-900/60 p-8 rounded-2xl border border-white/10 text-center text-zinc-500 font-bold uppercase text-xs">
                No hay pedidos que coincidan con la búsqueda.
              </div>
            )}
          </div>

          {/* Orders Desktop Central Table (Hidden on mobile) */}
          <div className="hidden md:block bg-zinc-900/60 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black text-emerald-400 uppercase font-black text-[10px] tracking-widest border-b border-white/10">
                  <tr>
                    <th className="p-4">Orden</th>
                    <th className="p-4">Jugador / ID</th>
                    <th className="p-4">Producto & Diamantes</th>
                    <th className="p-4">Monto / Banco</th>
                    <th className="p-4">Baucher Comprobante</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción de Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        {/* Order ID & Date */}
                        <td className="p-4">
                          <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                            #{order.id}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold block mt-1">{order.date}</span>
                        </td>

                        {/* Player ID with Quick Copy */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-white bg-black px-2 py-0.5 rounded border border-white/10">
                              {order.playerId}
                            </span>
                            <button
                              onClick={() => handleCopyPlayerId(order.playerId)}
                              className="p-1 rounded hover:bg-white/10 text-zinc-400 transition-colors"
                              title="Copiar ID para Free Fire"
                            >
                              {copiedPlayerId === order.playerId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="text-[11px] font-bold text-zinc-400 block mt-0.5">{order.userName}</span>
                        </td>

                        {/* Product & Diamonds */}
                        <td className="p-4">
                          <span className="font-black text-white uppercase">{order.productName}</span>
                          {order.isWalletTopUp ? (
                            <span className="text-[10px] bg-amber-400 text-black font-black px-1.5 py-0.5 rounded block w-max mt-1 uppercase">
                              💰 Recarga de Billetera USD
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-black block">
                              {order.diamondsTotal.toLocaleString()} 💎 Totales
                            </span>
                          )}
                        </td>

                        {/* Price & Bank */}
                        <td className="p-4">
                          <span className="font-black text-sm text-white">${order.priceUSD.toFixed(2)} USD</span>
                          {order.paymentMethod === 'wallet_balance' ? (
                            <span className="text-[10px] text-emerald-400 font-black block uppercase">
                              ⚡ Saldo Billetera TunTun
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400 block uppercase font-bold">{order.bankName}</span>
                          )}
                        </td>

                        {/* Baucher Receipt Inspector */}
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedReceiptUrl(order.receiptUrl)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-black text-xs flex items-center gap-1.5 border border-emerald-500/30 transition-all cursor-pointer uppercase"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Revisar Baucher</span>
                          </button>
                        </td>

                        {/* Current Status Badge */}
                        <td className="p-4">
                          {order.status === 'Pendiente' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30">
                              🟡 Pendiente
                            </span>
                          )}
                          {order.status === 'En proceso' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-400/10 text-sky-400 border border-sky-400/30">
                              🔵 En Proceso
                            </span>
                          )}
                          {order.status === 'Completado' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              🟢 Completado
                            </span>
                          )}
                          {order.status === 'Cancelado' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              🔴 Cancelado
                            </span>
                          )}
                        </td>

                        {/* State Change Buttons for Admin */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'En proceso')}
                              className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 text-[10px] font-black uppercase transition-colors"
                              title="Marcar En Proceso"
                            >
                              En Proceso
                            </button>
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'Completado')}
                              className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition-colors cursor-pointer ${
                                order.isWalletTopUp
                                  ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                                  : 'bg-emerald-500 text-black hover:bg-emerald-400'
                              }`}
                              title={order.isWalletTopUp ? 'Aprobar recarga y acreditar dinero a la billetera del usuario' : 'Marcar Completado'}
                            >
                              {order.isWalletTopUp ? `⚡ Acreditar $${order.priceUSD.toFixed(2)} USD` : 'Completado'}
                            </button>
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'Cancelado')}
                              className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 text-[10px] font-black transition-colors"
                              title="Cancelar Orden"
                            >
                              X
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-500 font-bold uppercase">
                        No hay pedidos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTIÓN DE CATÁLOGO (CRUD) */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900">Catálogo de Productos (CRUD)</h2>
              <p className="text-xs text-zinc-600">Añade, modifica o elimina denominaciones de diamantes, pases o tarjetas sin tocar código.</p>
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
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Nuevo Producto</span>
            </button>
          </div>

          {/* Product CRUD Form Modal/Section */}
          {isAddingProduct && (
            <form id="admin-product-form" onSubmit={handleSaveProduct} className="bg-zinc-900 text-white p-6 rounded-2xl border-2 border-amber-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-amber-400" />
                  {editingProductId ? `Editar Producto: ${productForm.name || 'Sin Nombre'}` : 'Crear Nuevo Producto en Catálogo'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProductId(null);
                  }}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-300 mb-1 font-bold">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 572 Diamantes"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold"
                  />
                </div>

                <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/30">
                  <label className="block text-amber-300 mb-1 font-black uppercase tracking-wider text-[11px] flex items-center gap-1">
                    💲 Precio USD ($) <span className="text-[10px] text-amber-400/80 font-normal">(Editable)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.priceUSD}
                    onChange={(e) => setProductForm({ ...productForm, priceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-black border-2 border-amber-400 text-amber-300 font-extrabold text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-bold">Cantidad Diamantes</label>
                  <input
                    type="number"
                    required
                    value={productForm.diamonds}
                    onChange={(e) => setProductForm({ ...productForm, diamonds: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-bold">Bono Diamantes Extra</label>
                  <input
                    type="number"
                    value={productForm.bonusDiamonds}
                    onChange={(e) => setProductForm({ ...productForm, bonusDiamonds: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-bold">Categoría</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold"
                  >
                    <option value="diamonds">Diamantes Directos</option>
                    <option value="memberships">Membresías VIP (Dorado 🟡)</option>
                    <option value="passes">Pases de Nivel</option>
                    <option value="promos">Promociones Especiales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-bold">Texto de Badge Overlay</label>
                  <input
                    type="text"
                    placeholder="Ej: MÁS VENDIDO ⚡"
                    value={productForm.badgeText}
                    onChange={(e) => setProductForm({ ...productForm, badgeText: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-bold text-xs">Descripción</label>
                <input
                  type="text"
                  placeholder="Descripción rápida del producto..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-300 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isGoldPromo}
                    onChange={(e) => setProductForm({ ...productForm, isGoldPromo: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Estilo Dorado Especial (Promociones / Membresías VIP)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isPopular}
                    onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <span>Destacar como "Más Vendido"</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProductId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg uppercase transition-all"
                >
                  <Save className="w-4 h-4 fill-current" />
                  <span>{editingProductId ? 'Guardar Cambios de Producto' : 'Crear Producto'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Current Catalog Table */}
          <div className="bg-zinc-900/60 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-black text-emerald-400 uppercase font-black text-[10px] tracking-widest border-b border-white/10">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Diamantes</th>
                  <th className="p-4">Precio USD ($)</th>
                  <th className="p-4">Especial / Dorado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p) => {
                  const isEditingInline = editingInlinePriceId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-black uppercase text-white flex items-center gap-2">
                        <DiamondIcon size="sm" variant={p.isGoldPromo || p.category === 'memberships' ? 'gold' : 'emerald'} />
                        <div>
                          <p className="font-extrabold text-white text-sm">{p.name}</p>
                          {p.badgeText && (
                            <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30 inline-block mt-0.5">
                              {p.badgeText}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 capitalize text-zinc-400 font-bold uppercase">{p.category}</td>

                      <td className="p-4 font-black text-emerald-400">
                        {p.diamonds.toLocaleString()} 💎 {p.bonusDiamonds ? `(+${p.bonusDiamonds})` : ''}
                      </td>

                      <td className="p-4 font-black">
                        {isEditingInline ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-400 font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={inlinePriceValue}
                              onChange={(e) => setInlinePriceValue(e.target.value)}
                              className="w-20 px-2 py-1 rounded-lg bg-black border-2 border-amber-400 text-amber-300 font-black text-xs text-right focus:outline-none"
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
                              className="px-2 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-lg cursor-pointer hover:bg-emerald-400"
                              title="Guardar nuevo precio"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingInlinePriceId(null)}
                              className="px-1.5 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded-lg cursor-pointer hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-emerald-300 font-black bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                              ${p.priceUSD.toFixed(2)} USD
                            </span>
                            <button
                              onClick={() => {
                                setEditingInlinePriceId(p.id);
                                setInlinePriceValue(p.priceUSD.toString());
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                              title="Editar precio rápido"
                            >
                              Cambiar Precio
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        {p.isGoldPromo ? (
                          <span className="bg-amber-400/10 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-400/30">
                            🟡 DORADO PROMO
                          </span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-all text-xs"
                            title="Editar todos los campos del producto"
                          >
                            <Edit className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-black border border-rose-500/30 transition-colors cursor-pointer"
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
      )}

      {/* TAB 3: SISTEMA DE ALERTAS POR CORREO */}
      {activeTab === 'email' && (
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/10 space-y-6 text-white">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-white">
              <Mail className="w-5 h-5 text-emerald-400" />
              Configuración de Notificaciones por Correo
            </h2>
            <p className="text-xs text-zinc-400 font-semibold uppercase mt-1">
              Envío automático de correo a administración cada vez que un cliente realiza un nuevo pedido o adjunta su baucher.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4 bg-black p-5 rounded-xl border border-white/10 text-xs">
              <h3 className="font-black text-emerald-400 uppercase tracking-wider">Parámetros del Servidor de Correo</h3>

              <div>
                <label className="block text-zinc-400 font-black uppercase mb-1">Correo Administrador</label>
                <input
                  type="email"
                  value={emailConfig.adminEmail}
                  onChange={(e) => onUpdateEmailConfig({ ...emailConfig, adminEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-white/20 text-white font-black"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold uppercase text-zinc-300">
                  <input
                    type="checkbox"
                    checked={emailConfig.notifyOnNewOrder}
                    onChange={(e) => onUpdateEmailConfig({ ...emailConfig, notifyOnNewOrder: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <span>Notificar inmediatamente al recibir NUEVO PEDIDO</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold uppercase text-zinc-300">
                  <input
                    type="checkbox"
                    checked={emailConfig.notifyOnStatusChange}
                    onChange={(e) => onUpdateEmailConfig({ ...emailConfig, notifyOnStatusChange: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <span>Enviar actualización por correo al cliente cuando cambia el estado</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={triggerTestEmailAlert}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span>Probar Alerta de Correo de Prueba</span>
                </button>
              </div>

              {testEmailSentSuccess && (
                <div className="p-3 bg-emerald-500/20 text-emerald-300 font-black uppercase rounded-xl text-center border border-emerald-500/40 animate-in fade-in">
                  ✅ ¡Correo de prueba enviado a {emailConfig.adminEmail}!
                </div>
              )}
            </div>

            {/* Email Preview Card */}
            <div className="bg-black text-white p-5 rounded-xl border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Bell className="w-4 h-4" /> Vista Previa de la Alerta
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">SMTP Firebase Functions</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-white/10 font-mono text-[11px] space-y-1">
                <p><strong className="text-zinc-500">De:</strong> notificaciones@tuntunstore.com</p>
                <p><strong className="text-zinc-500">Para:</strong> {emailConfig.adminEmail}</p>
                <p><strong className="text-zinc-500">Asunto:</strong> 🚨 ¡NUEVA RECARGA REGISTRADA! Pedido #TTS-84920</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-lg border border-white/10 space-y-2 text-zinc-300">
                <p className="font-bold text-white uppercase">¡Hola Administrador!</p>
                <p>El cliente <strong>Mateo Cárdenas</strong> ha registrado un nuevo pedido:</p>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 font-semibold">
                  <li><strong>ID Jugador Free Fire:</strong> 284910293</li>
                  <li><strong>Producto:</strong> 572 Diamantes ($5.80 USD)</li>
                  <li><strong>Banco:</strong> Banco Pichincha</li>
                  <li><strong>Baucher Comprobante:</strong> Adjunto en panel</li>
                </ul>
                <p className="text-emerald-400 font-black uppercase pt-2">Por favor ingresa al Panel de TunTun Store para verificar la transferencia.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: GESTIÓN DE BILLETERAS Y SALDOS USD */}
      {activeTab === 'wallets' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-amber-500/5 p-6 rounded-2xl border border-amber-500/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  CONTROL CENTRAL DE DINERO
                </span>
                <h2 className="text-xl font-black text-white">Billeteras Virtuales de Clientes ($ USD)</h2>
                <p className="text-xs text-zinc-400">
                  Como Administrador puedes recargar saldo manualmente a cualquier usuario, verificar fondos guardados o ajustar saldos.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-black/60 p-3 rounded-xl border border-amber-500/30">
                <div className="p-2.5 rounded-lg bg-amber-400/20 text-amber-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-black uppercase">Fondo Total en Billeteras</p>
                  <p className="text-xl font-black text-amber-400">
                    ${registeredUsers.reduce((sum, u) => sum + (u.walletBalanceUSD || 0), 0).toFixed(2)} USD
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Usuarios Registrados y Saldos
              </h3>
              <span className="text-xs text-zinc-400 font-bold">{registeredUsers.length} Usuarios</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-black/50 text-zinc-400 font-black uppercase tracking-wider text-[10px] border-b border-white/10">
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">ID Free Fire</th>
                    <th className="p-4">Saldo Actual USD</th>
                    <th className="p-4 text-right">Acciones de Recarga Directa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registeredUsers.map((u) => {
                    const customVal = userCustomAmounts[u.email] || '';
                    return (
                      <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                            />
                            <div>
                              <p className="font-bold text-white text-sm">{u.name}</p>
                              <span className="text-[10px] text-zinc-400">{u.gamerTag || 'Sin Tag'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-zinc-300 font-mono text-xs">{u.email}</td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="p-4 font-mono font-bold text-zinc-300">
                          {u.playerIdDefault || '284910293'}
                        </td>

                        <td className="p-4">
                          <span className="text-lg font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/30 inline-block">
                            ${(u.walletBalanceUSD || 0).toFixed(2)} USD
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex flex-col items-end gap-2">
                            {/* Quick Add Preset Buttons */}
                            <div className="flex items-center gap-1">
                              {[5, 10, 20, 50].map((amt) => (
                                <button
                                  key={amt}
                                  onClick={() => onUpdateUserWalletBalance && onUpdateUserWalletBalance(u.email, amt)}
                                  className="px-2 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 rounded text-[10px] font-black uppercase cursor-pointer transition-all"
                                  title={`Añadir $${amt} USD a ${u.name}`}
                                >
                                  +${amt}
                                </button>
                              ))}
                            </div>

                            {/* Custom Amount Form */}
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                placeholder="Monto custom ($)"
                                value={customVal}
                                onChange={(e) =>
                                  setUserCustomAmounts({ ...userCustomAmounts, [u.email]: e.target.value })
                                }
                                className="w-28 px-2 py-1 rounded bg-black border border-white/10 text-white font-bold text-xs text-right focus:outline-none focus:border-amber-400"
                              />
                              <button
                                onClick={() => {
                                  const num = parseFloat(customVal);
                                  if (num > 0 && onUpdateUserWalletBalance) {
                                    onUpdateUserWalletBalance(u.email, num);
                                    setUserCustomAmounts({ ...userCustomAmounts, [u.email]: '' });
                                  }
                                }}
                                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black rounded uppercase cursor-pointer"
                              >
                                Sumar
                              </button>
                              <button
                                onClick={() => {
                                  const num = parseFloat(customVal);
                                  if (num >= 0 && onUpdateUserWalletBalance) {
                                    onUpdateUserWalletBalance(u.email, num, true);
                                    setUserCustomAmounts({ ...userCustomAmounts, [u.email]: '' });
                                  }
                                }}
                                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-black rounded uppercase cursor-pointer"
                                title="Establecer saldo exacto"
                              >
                                Fijar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-5 rounded-2xl max-w-2xl w-full border border-zinc-800 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Inspección de Comprobante Baucher
              </span>
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-black p-2 rounded-xl max-h-[65vh] flex items-center justify-center overflow-hidden">
              <img src={selectedReceiptUrl} alt="Baucher Full" className="max-h-[60vh] object-contain" />
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-zinc-400">Verifica la hora, número de referencia y monto exacto transferido.</span>
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Listo, Comprobante Verificado
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
