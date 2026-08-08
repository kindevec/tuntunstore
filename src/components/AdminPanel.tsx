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
  AlertCircle,
  Code,
  Upload,
  Package,
  History
} from 'lucide-react';
import { supabase } from '../supabaseClient';

interface AdminPanelProps {
  orders: Order[];
  products: Product[];
  emailConfig: EmailAlertConfig;
  registeredUsers?: UserProfile[];
  activeSubTab?: 'orders' | 'catalog' | 'email' | 'wallets' | 'codes';
  onSubTabChange?: (tab: 'orders' | 'catalog' | 'email' | 'wallets' | 'codes') => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateEmailConfig: (config: EmailAlertConfig) => void;
  onUpdateUserWalletBalance?: (email: string, amount: number, isSetExact?: boolean) => void;
  pendingTopUps?: any[];
  onUpdateTopUpStatus?: (transactionId: string, newStatus: 'Aprobado' | 'Rechazado') => void;
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
  pendingTopUps = [],
  onUpdateTopUpStatus,
}) => {
  const [internalTab, setInternalTab] = useState<'orders' | 'catalog' | 'email' | 'wallets' | 'codes'>('orders');
  const activeTab = activeSubTab || internalTab;

  const handleTabChange = (tab: 'orders' | 'catalog' | 'email' | 'wallets' | 'codes') => {
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

  // User History Modal State
  const [selectedUserHistory, setSelectedUserHistory] = useState<any[] | null>(null);
  const [selectedUserHistoryName, setSelectedUserHistoryName] = useState<string>('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const handleViewUserHistory = async (userId: string, userName: string) => {
    setIsLoadingHistory(true);
    setSelectedUserHistoryName(userName);
    setSelectedUserHistory([]);
    const { data } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'top_up')
      .order('created_at', { ascending: false });
    
    setSelectedUserHistory(data || []);
    setIsLoadingHistory(false);
  };

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

  const [codesProductId, setCodesProductId] = useState<string>('');
  const [codesText, setCodesText] = useState('');
  const [codesStats, setCodesStats] = useState<Array<{product_id: string, product_name: string, total: number, available: number, used: number}>>([]);
  const [isUploadingCodes, setIsUploadingCodes] = useState(false);

  const fetchCodesStats = async () => {
    const { data: statsData, error } = await supabase
      .from('redemption_codes')
      .select('product_id, is_used, products(name)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching codes stats:", error);
      alert(`Error al cargar inventario de códigos: ${error.message}`);
      return;
    }

    if (statsData) {
      const statsMap: Record<string, {product_id: string, product_name: string, total: number, available: number, used: number}> = {};
      statsData.forEach((code: any) => {
        const pid = code.product_id;
        if (!statsMap[pid]) {
          statsMap[pid] = { product_id: pid, product_name: code.products?.name || 'Producto', total: 0, available: 0, used: 0 };
        }
        statsMap[pid].total++;
        if (code.is_used) statsMap[pid].used++;
        else statsMap[pid].available++;
      });
      setCodesStats(Object.values(statsMap));
    }
  };

  const handleUploadCodes = async () => {
    if (!codesProductId || !codesText.trim()) return;
    setIsUploadingCodes(true);
    
    const codes = codesText.split('\n').map(c => c.trim()).filter(c => c.length > 0);
    if (codes.length === 0) {
      setIsUploadingCodes(false);
      return;
    }
    
    const rows = codes.map(code => ({
      product_id: codesProductId,
      code: code,
      is_used: false,
    }));
    
    const { error } = await supabase.from('redemption_codes').insert(rows);
    
    if (error) {
      alert(`Error al subir códigos: ${error.message}`);
    } else {
      alert(`✅ ${codes.length} códigos subidos exitosamente.`);
      setCodesText('');
      fetchCodesStats();
    }
    setIsUploadingCodes(false);
  };

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
    <section id="admin-panel-section" className="py-8 px-4 sm:px-6 lg:px-8 max-w-full mx-auto space-y-8">
      


      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        <div className="bg-zinc-800 p-3.5 sm:p-5 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-2">
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

        <div className="bg-zinc-800 p-3.5 sm:p-5 rounded-2xl border border-amber-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-2">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pedidos Pendientes</p>
            <p className="text-xl sm:text-3xl font-black text-amber-400 mt-1">{pendingOrdersCount}</p>
            <p className="text-[9px] sm:text-[10px] text-amber-400/80 font-extrabold uppercase mt-1">Revisar comprobante</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-zinc-800 p-3.5 sm:p-5 rounded-2xl border border-sky-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-2">
          <div>
            <p className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest">En Proceso</p>
            <p className="text-xl sm:text-3xl font-black text-sky-400 mt-1">{inProgressOrdersCount}</p>
            <p className="text-[9px] sm:text-[10px] text-sky-400/80 font-extrabold uppercase mt-1">Cargando a ID</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 shrink-0">
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-zinc-800 p-3.5 sm:p-5 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-2">
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
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
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
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
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
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
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
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Alertas Correo</span>
        </button>

        <button
          onClick={() => { handleTabChange('codes'); fetchCodesStats(); }}
          className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeTab === 'codes'
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Códigos</span>
        </button>
      </div>

      {/* TAB 1: GESTIÓN DE PEDIDOS Y COMPROBANTES */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-800 p-4 rounded-2xl border border-zinc-700/50">
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por ID jugador, orden o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
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
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
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
                <div key={order.id} className="bg-zinc-800 rounded-2xl border border-zinc-700/50 p-4 space-y-3 shadow-lg">
                  {/* Top bar: Order ID, Status, Date */}
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-700/50 pb-2.5">
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
                  <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-700/50 flex items-center justify-between">
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
                    <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-700/50">
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

                    <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-700/50">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Monto / Pago:</span>
                      <p className="font-black text-emerald-300 text-sm mt-0.5">${order.priceUSD.toFixed(2)} USD</p>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block truncate">
                        {order.paymentMethod === 'wallet_balance' ? '⚡ Saldo Billetera' : order.bankName}
                      </span>
                    </div>
                  </div>



                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-zinc-700/50">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1.5">Acción de Estado:</span>
                    <div className="flex">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-black uppercase transition-colors focus:outline-none focus:border-emerald-500 cursor-pointer"
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
              <div className="bg-zinc-900/60 p-8 rounded-2xl border border-white/10 text-center text-zinc-500 font-bold uppercase text-xs">
                No hay pedidos que coincidan con la búsqueda.
              </div>
            )}
          </div>

          {/* Orders Desktop Central Table (Hidden on mobile) */}
          <div className="hidden md:block bg-zinc-800 rounded-2xl border border-zinc-700/50 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-emerald-400 uppercase font-black text-[10px] tracking-widest border-b border-zinc-700">
                  <tr>
                    <th className="p-4">Orden</th>
                    <th className="p-4">Jugador / ID</th>
                    <th className="p-4">Producto & Diamantes</th>
                    <th className="p-4">Monto / Banco</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción de Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700/50">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-700/30 transition-colors">
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
                            <span className="font-mono font-black text-sm text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700/50">
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
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-[10px] font-black uppercase transition-colors focus:outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="Pendiente">🟡 Pendiente</option>
                              <option value="En proceso">🔵 En Proceso</option>
                              <option value="Completado">🟢 Completar / Acreditar</option>
                              <option value="Cancelado">🔴 Cancelar</option>
                            </select>
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
          {/* Catalog Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-800 p-5 rounded-2xl border border-zinc-700/50">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Catálogo de Productos
              </h2>
              <p className="text-xs text-zinc-400 font-semibold">Añade, modifica o elimina denominaciones de diamantes, pases o membresías.</p>
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
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wide"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          {/* Product CRUD Form Modal/Section */}
          {isAddingProduct && (
            <form id="admin-product-form" onSubmit={handleSaveProduct} className="bg-zinc-800 text-white p-5 sm:p-6 rounded-2xl border border-zinc-700/50 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-700/50 pb-3">
                <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="truncate">{editingProductId ? `Editar: ${productForm.name || 'Producto'}` : 'Crear Nuevo Producto'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProductId(null);
                  }}
                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-bold rounded-lg cursor-pointer shrink-0 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-bold uppercase text-[10px] tracking-wide">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 572 Diamantes"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                  <label className="block text-amber-300 mb-1.5 font-black uppercase tracking-wider text-[10px]">
                    💲 Precio USD ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.priceUSD}
                    onChange={(e) => setProductForm({ ...productForm, priceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl bg-zinc-900 border-2 border-amber-400/40 text-amber-300 font-extrabold text-sm text-right focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1.5 font-bold uppercase text-[10px] tracking-wide">Cantidad Diamantes</label>
                  <input
                    type="number"
                    required
                    value={productForm.diamonds}
                    onChange={(e) => setProductForm({ ...productForm, diamonds: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1.5 font-bold uppercase text-[10px] tracking-wide">Bono Diamantes Extra</label>
                  <input
                    type="number"
                    value={productForm.bonusDiamonds}
                    onChange={(e) => setProductForm({ ...productForm, bonusDiamonds: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1.5 font-bold uppercase text-[10px] tracking-wide">Categoría</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="diamonds">Diamantes Directos</option>
                    <option value="memberships">Membresías VIP (Dorado 🟡)</option>
                    <option value="passes">Pases de Nivel</option>
                    <option value="promos">Promociones Especiales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1.5 font-bold uppercase text-[10px] tracking-wide">Texto de Badge</label>
                  <input
                    type="text"
                    placeholder="Ej: MÁS VENDIDO ⚡"
                    value={productForm.badgeText}
                    onChange={(e) => setProductForm({ ...productForm, badgeText: e.target.value })}
                    className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-600 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5 font-bold text-[10px] uppercase tracking-wide">Descripción</label>
                <input
                  type="text"
                  placeholder="Descripción rápida del producto..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-600 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 text-xs text-zinc-300 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-zinc-700/50 hover:border-amber-400/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={productForm.isGoldPromo}
                    onChange={(e) => setProductForm({ ...productForm, isGoldPromo: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span className="font-bold">Estilo Dorado (VIP)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-zinc-700/50 hover:border-emerald-400/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={productForm.isPopular}
                    onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <span className="font-bold">Destacar como "Más Vendido"</span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-zinc-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProductId(null);
                  }}
                  className="px-5 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold text-xs cursor-pointer transition-colors text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg uppercase transition-all"
                >
                  <Save className="w-4 h-4 fill-current" />
                  <span>{editingProductId ? 'Guardar Cambios' : 'Crear Producto'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Mobile Catalog Cards (Visible on mobile/tablet) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map((p) => {
              const isEditingInline = editingInlinePriceId === p.id;
              return (
                <div key={p.id} className="bg-zinc-800 rounded-2xl border border-zinc-700/50 overflow-hidden shadow-lg">
                  {/* Card Header */}
                  <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <DiamondIcon size="md" variant={p.isGoldPromo || p.category === 'memberships' ? 'gold' : 'emerald'} />
                      <div className="min-w-0">
                        <p className="font-black text-white text-sm truncate">{p.name}</p>
                        <span className="text-[10px] text-emerald-100/80 font-bold uppercase">{p.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.badgeText && (
                        <span className="text-[9px] text-white font-bold bg-white/20 px-2 py-0.5 rounded-full">
                          {p.badgeText}
                        </span>
                      )}
                      {p.isGoldPromo && (
                        <span className="bg-amber-400 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          VIP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-700/40 text-center">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Diamantes</span>
                        <p className="font-black text-emerald-400 text-base">
                          {p.diamonds.toLocaleString()}
                        </p>
                        {p.bonusDiamonds > 0 && (
                          <span className="text-[10px] text-emerald-300/70 font-bold">+{p.bonusDiamonds} bonus</span>
                        )}
                      </div>

                      <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-700/40 text-center">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Precio USD</span>
                        {isEditingInline ? (
                          <input
                            type="number"
                            step="0.01"
                            value={inlinePriceValue}
                            onChange={(e) => setInlinePriceValue(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-zinc-800 border-2 border-amber-400 text-amber-300 font-black text-sm text-center focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <p className="font-black text-white text-base">${p.priceUSD.toFixed(2)}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {isEditingInline ? (
                        <>
                          <button
                            onClick={() => {
                              const val = parseFloat(inlinePriceValue);
                              if (!isNaN(val) && val >= 0) {
                                onUpdateProduct({ ...p, priceUSD: val });
                              }
                              setEditingInlinePriceId(null);
                            }}
                            className="col-span-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl cursor-pointer uppercase transition-colors text-center"
                          >
                            ✓ Guardar Precio
                          </button>
                          <button
                            onClick={() => setEditingInlinePriceId(null)}
                            className="py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer transition-colors text-center"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingInlinePriceId(p.id);
                              setInlinePriceValue(p.priceUSD.toString());
                            }}
                            className="py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-amber-400 font-black text-xs uppercase transition-colors cursor-pointer text-center"
                          >
                            💲 Precio
                          </button>

                          <button
                            onClick={() => startEditProduct(p)}
                            className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase transition-colors cursor-pointer text-center"
                          >
                            ✏️ Editar
                          </button>

                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-black text-xs border border-rose-500/30 transition-colors cursor-pointer text-center uppercase"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Catalog Table */}
          <div className="hidden md:block bg-zinc-800 rounded-2xl border border-zinc-700/50 shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-emerald-400 uppercase font-black text-[10px] tracking-widest border-b border-zinc-700">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Diamantes</th>
                  <th className="p-4">Precio USD ($)</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/50">
                {products.map((p) => {
                  const isEditingInline = editingInlinePriceId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-700/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <DiamondIcon size="sm" variant={p.isGoldPromo || p.category === 'memberships' ? 'gold' : 'emerald'} />
                          <div>
                            <p className="font-extrabold text-white text-sm">{p.name}</p>
                            {p.badgeText && (
                              <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30 inline-block mt-0.5">
                                {p.badgeText}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-zinc-300 font-bold uppercase text-[11px]">{p.category}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-emerald-400">{p.diamonds.toLocaleString()} 💎</span>
                        {p.bonusDiamonds > 0 && (
                          <span className="text-emerald-300/60 font-bold text-[10px] ml-1">(+{p.bonusDiamonds})</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditingInline ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-400 font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={inlinePriceValue}
                              onChange={(e) => setInlinePriceValue(e.target.value)}
                              className="w-20 px-2 py-1.5 rounded-lg bg-zinc-900 border-2 border-amber-400 text-amber-300 font-black text-xs text-right focus:outline-none"
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
                              className="px-2.5 py-1.5 bg-emerald-500 text-black text-[10px] font-black rounded-lg cursor-pointer hover:bg-emerald-400 transition-colors"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingInlinePriceId(null)}
                              className="px-2 py-1.5 bg-zinc-700 text-zinc-400 text-[10px] font-bold rounded-lg cursor-pointer hover:text-white transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-black">
                              ${p.priceUSD.toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                setEditingInlinePriceId(p.id);
                                setInlinePriceValue(p.priceUSD.toString());
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 hover:border-amber-400/40 transition-colors"
                            >
                              Cambiar
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        {p.isGoldPromo ? (
                          <span className="bg-amber-400/15 text-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-amber-400/30">
                            🟡 DORADO
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[10px]">Estándar</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center gap-1.5 cursor-pointer transition-all text-xs uppercase"
                          >
                            <Edit className="w-3.5 h-3.5 stroke-[2.5]" />
                            Editar
                          </button>

                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
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
        <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700/50 space-y-6 text-white">
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
            
            <div className="space-y-4 bg-zinc-900/50 p-5 rounded-xl border border-zinc-700/50 text-xs">
              <h3 className="font-black text-emerald-400 uppercase tracking-wider">Parámetros del Servidor de Correo</h3>

              <div>
                <label className="block text-zinc-400 font-black uppercase mb-1">Correo Administrador</label>
                <input
                  type="email"
                  value={emailConfig.adminEmail}
                  onChange={(e) => onUpdateEmailConfig({ ...emailConfig, adminEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-black"
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
            <div className="bg-zinc-900/50 text-white p-5 rounded-xl border border-zinc-700/50 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-700/50 pb-2">
                <span className="font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Bell className="w-4 h-4" /> Vista Previa de la Alerta
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">SMTP Firebase Functions</span>
              </div>

              <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-700/50 font-mono text-[11px] space-y-1">
                <p><strong className="text-zinc-500">De:</strong> notificaciones@tuntunstore.com</p>
                <p><strong className="text-zinc-500">Para:</strong> {emailConfig.adminEmail}</p>
                <p><strong className="text-zinc-500">Asunto:</strong> 🚨 ¡NUEVA RECARGA REGISTRADA! Pedido #TTS-84920</p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700/50 space-y-2 text-zinc-300">
                <p className="font-bold text-white uppercase">¡Hola Administrador!</p>
                <p>El cliente <strong>Mateo Cárdenas</strong> ha registrado un nuevo pedido:</p>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 font-semibold">
                  <li><strong>ID Jugador Free Fire:</strong> 284910293</li>
                  <li><strong>Producto:</strong> 572 Diamantes ($5.80 USD)</li>
                  <li><strong>Banco:</strong> Banco Pichincha</li>

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
                  Como Administrador puedes aprobar recargas por transferencia bancaria, o ajustar saldos manualmente.
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

          {/* Pending Top Ups Section */}
          <div className="bg-zinc-800 rounded-2xl border border-amber-500/50 overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.1)]">
            <div className="p-4 border-b border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/5">
              <div className="flex items-center gap-3">
                <h3 className="font-black text-sm text-amber-400 uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Solicitudes de Recarga Pendientes
                </h3>
                <span className="text-xs text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">{pendingTopUps.length} Pendientes</span>
              </div>
              {pendingTopUps.some(t => t.auto_verified) && (
                <button
                  onClick={() => {
                    const verifiedTopUps = pendingTopUps.filter(t => t.auto_verified);
                    if (confirm(`¿Estás seguro de aprobar automáticamente las ${verifiedTopUps.length} recargas verificadas por el sistema OCR?`)) {
                      verifiedTopUps.forEach(t => onUpdateTopUpStatus && onUpdateTopUpStatus(t.id, 'Aprobado'));
                    }
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black rounded-xl uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                  title="Aprueba de golpe todos los comprobantes que pasaron el filtro de seguridad OCR"
                >
                  <ShieldCheck className="w-4 h-4" /> Aprobar Todos los Verificados
                </button>
              )}
            </div>
            
            <div className="p-4">
              {pendingTopUps.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 font-bold uppercase text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20 text-emerald-400" />
                  <p>No hay solicitudes de recarga pendientes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTopUps.map(topUp => {
                    const user = registeredUsers.find(u => u.uid === topUp.user_id);
                    return (
                      <div key={topUp.id} className="bg-zinc-900 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0 overflow-hidden">
                            {topUp.receipt_url ? (
                              <img 
                                src={`${import.meta.env.VITE_SUPABASE_URL || 'https://tkfpmmjnyzmulxkmtesf.supabase.co'}/storage/v1/object/public/receipts/${topUp.receipt_url}`} 
                                alt="Baucher miniatura" 
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tkfpmmjnyzmulxkmtesf.supabase.co';
                                  setSelectedReceiptUrl(`${baseUrl}/storage/v1/object/public/receipts/${topUp.receipt_url}`);
                                }}
                                title="Clic para ampliar"
                              />
                            ) : (
                              <Wallet className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-white text-base">Recarga de ${topUp.amount.toFixed(2)} USD</p>
                            <div className="text-xs text-zinc-400 flex flex-col gap-0.5 mt-1">
                              <span><strong className="text-zinc-300">Cliente:</strong> {user?.name || 'Desconocido'} ({user?.email || 'N/A'})</span>
                              <span><strong className="text-zinc-300">Fecha:</strong> {new Date(topUp.created_at).toLocaleString()}</span>
                            </div>
                            
                            {/* Verificación Automática (OCR) Badge */}
                            <div className="mt-2 flex flex-col gap-1">
                              {topUp.auto_verified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                  <ShieldCheck className="w-3 h-3" /> Verificado por Sistema (OCR)
                                </span>
                              ) : topUp.verification_warnings && topUp.verification_warnings.length > 0 ? (
                                <div className="space-y-1">
                                  {topUp.verification_warnings.map((warn: string, idx: number) => (
                                    <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                                      {warn}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                                  Sin revisión OCR
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                          {topUp.receipt_url && (
                            <button
                              onClick={() => {
                                const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tkfpmmjnyzmulxkmtesf.supabase.co';
                                setSelectedReceiptUrl(`${baseUrl}/storage/v1/object/public/receipts/${topUp.receipt_url}`);
                              }}
                              className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-black rounded-xl uppercase flex items-center gap-2 border border-blue-500/30 transition-colors w-full sm:w-auto justify-center cursor-pointer"
                            >
                              <Eye className="w-4 h-4" /> Ver Baucher
                            </button>
                          )}
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => onUpdateTopUpStatus && onUpdateTopUpStatus(topUp.id, 'Aprobado')}
                              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl uppercase flex items-center gap-1 justify-center transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Aprobar
                            </button>
                            <button
                              onClick={() => onUpdateTopUpStatus && onUpdateTopUpStatus(topUp.id, 'Rechazado')}
                              className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black rounded-xl uppercase flex items-center gap-1 justify-center transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" /> Rechazar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-800 rounded-2xl border border-zinc-700/50 overflow-hidden">
            <div className="p-4 border-b border-zinc-700/50 flex items-center justify-between">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Usuarios Registrados y Saldos
              </h3>
              <span className="text-xs text-zinc-400 font-bold">{registeredUsers.length} Usuarios</span>
            </div>

            {/* Mobile Wallet Cards */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {registeredUsers.map((u) => {
                const customVal = userCustomAmounts[u.email] || '';
                return (
                  <div key={u.uid} className="bg-zinc-900/80 rounded-2xl border border-zinc-700/50 p-4 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between border-b border-zinc-700/50 pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-amber-500/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-base truncate">{u.name}</p>
                          <span className="text-[10px] text-zinc-400 font-mono block truncate">{u.email}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                        {u.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-700/50">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase block">ID FF:</span>
                        <span className="font-mono font-bold text-zinc-300">{u.playerIdDefault || 'N/A'}</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase block">Saldo Actual:</span>
                        <span className="text-lg font-black text-amber-400">
                          ${(u.walletBalanceUSD || 0).toFixed(2)} USD
                        </span>
                        <button
                           onClick={() => handleViewUserHistory(u.uid, u.name)}
                           className="mt-2 w-full py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg uppercase border border-blue-500/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <History className="w-3 h-3" /> Historial
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Wallets Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-wider text-[10px] border-b border-zinc-700">
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">ID Free Fire</th>
                    <th className="p-4">Saldo Actual USD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700/50">
                  {registeredUsers.map((u) => {
                    const customVal = userCustomAmounts[u.email] || '';
                    return (
                      <tr key={u.uid} className="hover:bg-zinc-700/30 transition-colors">
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
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/30 inline-block">
                              ${(u.walletBalanceUSD || 0).toFixed(2)} USD
                            </span>
                            <button
                               onClick={() => handleViewUserHistory(u.uid, u.name)}
                               className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg uppercase border border-blue-500/30 transition-colors flex items-center gap-1"
                            >
                              <History className="w-3 h-3" /> Ver Historial
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
        </div>
      )}
      {/* TAB CÓDIGOS */}
      {activeTab === 'codes' && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            🔑 Gestión de Códigos de Recarga
          </h2>
          
          {/* Upload Section */}
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Subir Códigos Nuevos</h3>
            
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">Seleccionar Producto</label>
              <select
                value={codesProductId}
                onChange={(e) => setCodesProductId(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
              >
                <option value="">-- Selecciona un producto --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — ${p.priceUSD} USD</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">Códigos (uno por línea)</label>
              <textarea
                value={codesText}
                onChange={(e) => setCodesText(e.target.value)}
                rows={6}
                placeholder="ABCD-1234-EFGH&#10;IJKL-5678-MNOP&#10;QRST-9012-UVWX"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 font-mono placeholder-zinc-600 resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                {codesText.split('\n').filter(c => c.trim().length > 0).length} códigos detectados
              </p>
              <button
                onClick={handleUploadCodes}
                disabled={!codesProductId || !codesText.trim() || isUploadingCodes}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                {isUploadingCodes ? 'Subiendo...' : '⬆ Subir Códigos'}
              </button>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Inventario de Códigos por Producto</h3>
            
            {codesStats.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No hay códigos cargados aún.</p>
            ) : (
              <div className="space-y-3">
                {codesStats.map((stat) => (
                  <div key={stat.product_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-black/30 rounded-xl border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">{stat.product_name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">ID: {stat.product_id.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-black text-emerald-400">{stat.available}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Disponibles</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-zinc-500">{stat.used}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Usados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-white">{stat.total}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedUserHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl max-w-2xl w-full border border-blue-500/30 space-y-4 shadow-2xl text-white max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">Historial de Recargas</h3>
                  <p className="text-xs text-zinc-400">Usuario: <span className="text-blue-400">{selectedUserHistoryName}</span></p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserHistory(null)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center py-10">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin opacity-50" />
                </div>
              ) : selectedUserHistory.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 bg-black/20 rounded-xl border border-zinc-800/50">
                  <p className="text-sm font-bold uppercase tracking-wider mb-1">Sin Historial</p>
                  <p className="text-xs">El usuario no tiene recargas registradas.</p>
                </div>
              ) : (
                selectedUserHistory.map((t) => (
                  <div key={t.id} className="bg-black/40 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-white text-lg">+${t.amount.toFixed(2)} USD</span>
                        {t.status === 'Aprobado' && <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Aprobado</span>}
                        {t.status === 'Rechazado' && <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">Rechazado</span>}
                        {t.status === 'Pendiente' && <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">Pendiente</span>}
                      </div>
                      <div className="text-xs text-zinc-500 space-y-0.5">
                        <p>{new Date(t.created_at).toLocaleString()}</p>
                        {t.auto_verified ? (
                          <p className="text-emerald-500/80 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verificado por OCR</p>
                        ) : t.verification_warnings && t.verification_warnings.length > 0 ? (
                          <p className="text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Alertas: {t.verification_warnings.length}</p>
                        ) : null}
                      </div>
                    </div>
                    {t.receipt_url && (
                      <button
                        onClick={() => {
                          const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tkfpmmjnyzmulxkmtesf.supabase.co';
                          setSelectedReceiptUrl(`${baseUrl}/storage/v1/object/public/receipts/${t.receipt_url}`);
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-black uppercase flex items-center justify-center gap-2 border border-blue-500/30 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Baucher
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl max-w-4xl w-full border border-emerald-500/30 space-y-4 shadow-2xl text-white">
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

            <div className="bg-black p-2 rounded-xl max-h-[85vh] flex items-center justify-center overflow-hidden">
              <img src={selectedReceiptUrl} alt="Baucher Full" className="max-h-[80vh] object-contain" />
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
