import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Product, UserProfile } from '../types';
import { DiamondIcon } from './DiamondIcon';
import { AdminOrdersTab } from './admin/AdminOrdersTab';
import { AdminCatalogTab } from './admin/AdminCatalogTab';
import { AdminWalletsTab } from './admin/AdminWalletsTab';
import { AdminCodesTab } from './admin/AdminCodesTab';
import { AdminBannersTab } from './admin/AdminBannersTab';
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
  History,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../supabaseClient';

interface AdminPanelProps {
  orders: Order[];
  products: Product[];
  emailConfig: EmailAlertConfig;
  registeredUsers?: UserProfile[];
  activeSubTab?: 'orders' | 'catalog' | 'email' | 'wallets' | 'codes' | 'banners';
  onSubTabChange?: (tab: 'orders' | 'catalog' | 'email' | 'wallets' | 'codes' | 'banners') => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
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
  onUpdateUserWalletBalance,
  pendingTopUps = [],
  onUpdateTopUpStatus,
}) => {
  const [internalTab, setInternalTab] = useState<'orders' | 'catalog' | 'email' | 'wallets' | 'codes' | 'banners'>('orders');
  const activeTab = activeSubTab || internalTab;

  const handleTabChange = (tab: 'orders' | 'catalog' | 'email' | 'wallets' | 'codes' | 'banners') => {
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

    const statsMap: Record<string, {product_id: string, product_name: string, total: number, available: number, used: number}> = {};
    
    // Inicializar todos los productos con 0
    products.forEach(p => {
      statsMap[p.id] = { product_id: p.id, product_name: p.name, total: 0, available: 0, used: 0 };
    });

    if (statsData) {
      statsData.forEach((code: any) => {
        const pid = code.product_id;
        if (!statsMap[pid]) {
          statsMap[pid] = { product_id: pid, product_name: code.products?.name || 'Producto', total: 0, available: 0, used: 0 };
        }
        statsMap[pid].total++;
        if (code.is_used) statsMap[pid].used++;
        else statsMap[pid].available++;
      });
    }
    
    setCodesStats(Object.values(statsMap));
  };

  useEffect(() => {
    fetchCodesStats();
  }, [products]);

  const handleUploadCodes = async (preSanitizedCodes?: string[]): Promise<{
    success: boolean;
    error?: string;
    count?: number;
    blockedDuplicates?: string[];
  }> => {
    if (!codesProductId) return { success: false, error: 'No se ha seleccionado ningún producto.' };
    setIsUploadingCodes(true);
    
    // Clean and normalize input codes
    const rawCodes = preSanitizedCodes && preSanitizedCodes.length > 0
      ? preSanitizedCodes.map(c => c.trim().toUpperCase()).filter(Boolean)
      : codesText.split('\n').map(c => c.trim().toUpperCase()).filter(Boolean);
      
    if (rawCodes.length === 0) {
      setIsUploadingCodes(false);
      return { success: false, error: 'No se ingresaron códigos válidos.' };
    }

    // 1. Deduplicate within current input batch
    const uniqueInputCodes = Array.from(new Set(rawCodes));

    // 2. SECURITY CHECK AGAINST DATABASE: Check if any codes already exist in redemption_codes
    let cleanCodes: string[] = uniqueInputCodes;
    let blockedDuplicates: string[] = [];

    try {
      const { data: existingRecords, error: fetchErr } = await supabase
        .from('redemption_codes')
        .select('code')
        .in('code', uniqueInputCodes);

      if (fetchErr) {
        console.warn("Advertencia al verificar unicidad de códigos en BD:", fetchErr);
      }

      if (existingRecords && existingRecords.length > 0) {
        const existingSet = new Set(existingRecords.map((r: any) => r.code.toUpperCase()));
        cleanCodes = uniqueInputCodes.filter(c => !existingSet.has(c));
        blockedDuplicates = uniqueInputCodes.filter(c => existingSet.has(c));
      }

      if (cleanCodes.length === 0) {
        setIsUploadingCodes(false);
        return {
          success: false,
          error: `🛡️ Bloqueo de Seguridad: Todos los ${blockedDuplicates.length} códigos ingresados ya existen previamente en la base de datos.`,
          blockedDuplicates
        };
      }

      // 3. Insert ONLY clean, verified unique codes
      const rows = cleanCodes.map(code => ({
        product_id: codesProductId,
        code: code,
        is_used: false,
      }));
      
      const { error: insertError } = await supabase.from('redemption_codes').insert(rows);
      
      if (insertError) {
        setIsUploadingCodes(false);
        if (insertError.code === '23505' || insertError.message.includes('unique constraint') || insertError.message.includes('duplicate key')) {
          return {
            success: false,
            error: '🛡️ Bloqueo de Seguridad: Uno o más códigos ya existen en la base de datos.'
          };
        }
        return { success: false, error: insertError.message };
      }

      // 4. AUTO-ASSIGNMENT LOGIC
      try {
        const { data: pendingOrders, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('product_id', codesProductId)
          .eq('status', 'Pendiente')
          .order('created_at', { ascending: true });
          
        if (fetchError) throw fetchError;
        
        if (pendingOrders && pendingOrders.length > 0) {
          const { data: availableCodes, error: codesFetchError } = await supabase
            .from('redemption_codes')
            .select('id, code')
            .eq('product_id', codesProductId)
            .eq('is_used', false)
            .order('created_at', { ascending: true });
            
          if (codesFetchError) throw codesFetchError;
          
          if (availableCodes && availableCodes.length > 0) {
            for (let i = 0; i < pendingOrders.length && i < availableCodes.length; i++) {
              const order = pendingOrders[i];
              const codeToAssign = availableCodes[i];
              
              await supabase.from('redemption_codes').update({ is_used: true }).eq('id', codeToAssign.id);
              
              await supabase.from('orders').update({
                status: 'Completado',
                redemption_code: codeToAssign.code
              }).eq('id', order.id);
              
              await supabase.from('order_status_history').insert({
                order_id: order.id,
                status: 'Completado',
                note: 'Código asignado automáticamente (Ingreso de stock)'
              });
            }
          }
        }
      } catch (assignError) {
        console.error('Error durante la auto-asignación de códigos:', assignError);
      }

      setIsUploadingCodes(false);
      setCodesText('');
      fetchCodesStats();
      return { 
        success: true, 
        count: cleanCodes.length,
        blockedDuplicates: blockedDuplicates.length > 0 ? blockedDuplicates : undefined
      };
    } catch (err: any) {
      setIsUploadingCodes(false);
      return { success: false, error: err.message || 'Error al validar códigos en la base de datos' };
    }
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

  return (
    <section id="admin-panel-section" className="py-4 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-full mx-auto space-y-4 sm:space-y-8">
      
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        
        {/* Ventas Totales */}
        <div className="bg-zinc-800/90 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-500/20 shadow-lg flex items-center justify-between gap-2 text-white">
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-wider truncate">Ventas Totales</p>
            <p className="text-sm sm:text-2xl font-black text-white mt-0.5 truncate">${totalSalesUSD.toFixed(2)}</p>
            <p className="text-[8px] sm:text-[10px] text-emerald-400 font-extrabold uppercase mt-0.5 flex items-center gap-1 truncate">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> <span className="truncate">Acreditación</span>
            </p>
          </div>
          <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Pedidos Pendientes */}
        <div className="bg-zinc-800/90 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-500/20 shadow-lg flex items-center justify-between gap-2 text-white">
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-wider truncate">Pendientes</p>
            <p className="text-sm sm:text-2xl font-black text-amber-400 mt-0.5 truncate">{pendingOrdersCount}</p>
            <p className="text-[8px] sm:text-[10px] text-amber-400/80 font-extrabold uppercase mt-0.5 truncate">Comprobante</p>
          </div>
          <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 shrink-0">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* En Proceso */}
        <div className="bg-zinc-800/90 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-sky-500/20 shadow-lg flex items-center justify-between gap-2 text-white">
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-wider truncate">En Proceso</p>
            <p className="text-sm sm:text-2xl font-black text-sky-400 mt-0.5 truncate">{inProgressOrdersCount}</p>
            <p className="text-[8px] sm:text-[10px] text-sky-400/80 font-extrabold uppercase mt-0.5 truncate">Cargando a ID</p>
          </div>
          <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 shrink-0">
            <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Diamantes Entregados */}
        <div className="bg-zinc-800/90 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-500/20 shadow-lg flex items-center justify-between gap-2 text-white">
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-wider truncate">Diamantes</p>
            <p className="text-sm sm:text-2xl font-black text-emerald-400 mt-0.5 truncate">{totalDiamondsDelivered.toLocaleString()} 💎</p>
            <p className="text-[8px] sm:text-[10px] text-emerald-400/80 font-extrabold uppercase mt-0.5 truncate">Free Fire Ecuador</p>
          </div>
          <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <DiamondIcon size="sm" variant="emerald" />
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
          onClick={() => { handleTabChange('codes'); fetchCodesStats(); }}
          className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] relative ${
            activeTab === 'codes'
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Códigos</span>
          {codesStats.filter(c => c.available <= 10).length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse shadow-md border border-rose-400">
              ⚠️ {codesStats.filter(c => c.available <= 10).length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('banners')}
          className={`px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeTab === 'banners'
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Banners</span>
        </button>
      </div>

            {/* TAB 1: GESTIÓN DE PEDIDOS Y COMPROBANTES */}
      {activeTab === 'orders' && (
        <AdminOrdersTab
          orders={orders}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filteredOrders={filteredOrders}
          handleCopyPlayerId={handleCopyPlayerId}
          copiedPlayerId={copiedPlayerId}
          onUpdateOrderStatus={onUpdateOrderStatus}
          setSelectedReceiptUrl={setSelectedReceiptUrl}
        />
      )}

      {/* TAB 2: GESTIÓN DE CATÁLOGO (CRUD) */}
      {activeTab === 'catalog' && (
        <AdminCatalogTab
          products={products}
          onAddProduct={onAddProduct}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
        />
      )}

      {/* TAB 4: GESTIÓN DE BILLETERAS Y SALDOS USD */}
      {activeTab === 'wallets' && (
        <AdminWalletsTab
          registeredUsers={registeredUsers}
          pendingTopUps={pendingTopUps}
          onUpdateTopUpStatus={onUpdateTopUpStatus}
          setSelectedReceiptUrl={setSelectedReceiptUrl}
          handleViewUserHistory={handleViewUserHistory}
        />
      )}

      {/* TAB 5: GESTIÓN DE CÓDIGOS DE REDENCIÓN */}
      {activeTab === 'codes' && (
        <AdminCodesTab
          products={products}
          codesProductId={codesProductId}
          setCodesProductId={setCodesProductId}
          codesText={codesText}
          setCodesText={setCodesText}
          handleUploadCodes={handleUploadCodes}
          isUploadingCodes={isUploadingCodes}
          codesStats={codesStats}
        />
      )}

      {/* TAB 6: GESTIÓN DE BANNERS */}
      {activeTab === 'banners' && (
        <AdminBannersTab />
      )}

      {/* MODAL: VER COMPROBANTE DE PAGO COMPLETO */}
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
