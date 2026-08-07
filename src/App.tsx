import React, { useState, useEffect } from 'react';
import { Product, BankAccount, Order, UserProfile, OrderStatus, EmailAlertConfig, ProductCategory } from './types';
import { supabase } from './supabaseClient';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { OrderModal } from './components/OrderModal';
import { MyOrders } from './components/MyOrders';
import { AdminPanel } from './components/AdminPanel';
import { WhatsAppButton } from './components/WhatsAppButton';
import { BottomNavigation } from './components/BottomNavigation';
import { LoginPage } from './components/LoginPage';
import { ProfileView } from './components/ProfileView';
import { WalletView } from './components/WalletView';
import { Footer } from './components/Footer';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('tuntun_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [emailConfig, setEmailConfig] = useState<EmailAlertConfig>({
    adminEmail: 'kindevx@gmail.com',
    notifyNewOrder: true,
    notifyWalletTopUp: true
  });

  const [loginRedirectReason, setLoginRedirectReason] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login'>('catalog');
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'catalog' | 'email' | 'wallets'>('orders');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    fetchInitialData();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        updateCurrentActiveUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = async () => {
    const { data: prodData } = await supabase.from('products').select('*').eq('active', true).order('price_usd', { ascending: true });
    if (prodData) {
      setProducts(prodData.map(p => ({
        id: p.id,
        name: p.name,
        diamonds: p.diamonds,
        bonusDiamonds: p.bonus_diamonds,
        priceUSD: p.price_usd,
        category: p.category as any,
        description: p.description,
        isPopular: p.is_popular,
        isGoldPromo: p.is_gold_promo,
        imageType: p.image_type,
        badgeText: p.badge_text,
        active: p.active
      })));
    }
    
    const { data: bankData } = await supabase.from('bank_accounts').select('*').eq('active', true);
    if (bankData) {
      setBankAccounts(bankData.map(b => ({
        id: b.id,
        bankName: b.bank_name,
        accountType: b.account_type,
        accountNumber: b.account_number,
        holderName: b.holder_name,
        holderId: b.holder_id,
        email: b.email,
        active: b.active
      })));
    }
  };

  const fetchOrders = async (userRole: string, userId: string) => {
    let query = supabase
      .from('orders')
      .select('*, profiles!orders_user_id_fkey(name, email), order_status_history(*)')
      .order('created_at', { ascending: false });
      
    if (userRole !== 'admin') {
      query = query.eq('user_id', userId);
    }
    
    const { data: ordData, error } = await query;
    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }
    if (ordData) {
      setOrders(ordData.map((o: any) => ({
        id: o.id,
        date: o.created_at,
        userEmail: o.profiles?.email || 'N/A',
        userName: o.profiles?.name || 'Cliente',
        playerId: o.player_id,
        playerTag: o.player_tag,
        productId: o.product_id,
        productName: o.product_name_snapshot,
        diamondsTotal: o.diamonds_total,
        priceUSD: o.price_usd,
        bankName: o.payment_method === 'wallet_balance' ? 'Saldo TunTun USD' : 'Transferencia Bancaria',
        receiptUrl: o.receipt_storage_path ? supabase.storage.from('receipts').getPublicUrl(o.receipt_storage_path).data.publicUrl : '',
        receiptFileName: o.receipt_storage_path ? 'Comprobante Subido' : '',
        status: o.status,
        paymentMethod: o.payment_method,
        isWalletTopUp: o.is_wallet_top_up,
        statusHistory: (o.order_status_history || []).map((h: any) => ({
          status: h.status,
          timestamp: h.created_at,
          note: h.note
        })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      })));
    }
  };
  
  const fetchAllUsersForAdmin = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      setRegisteredUsers(data.map(p => ({
        uid: p.id,
        name: p.name || 'Usuario',
        email: p.email,
        avatar: p.avatar_url,
        role: p.role as any,
        walletBalanceUSD: p.wallet_balance_usd,
        playerIdDefault: p.player_id_default,
        gamerTag: p.gamer_tag,
        phone: p.phone,
        preferredBank: p.preferred_bank,
      })));
    }
  };

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      showToast(`❌ Error cargando perfil: ${error.message}`);
      return;
    }
    if (data) {
      const userProfile: UserProfile = {
        uid: data.id,
        name: data.name || 'Usuario',
        email: data.email,
        avatar: data.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
        role: data.role as 'client' | 'admin',
        walletBalanceUSD: data.wallet_balance_usd || 0,
        playerIdDefault: data.player_id_default,
        gamerTag: data.gamer_tag,
        phone: data.phone,
        preferredBank: data.preferred_bank,
      };
      updateCurrentActiveUser(userProfile);
      
      fetchOrders(userProfile.role, userProfile.uid);
      if (userProfile.role === 'admin') fetchAllUsersForAdmin();

      if (window.location.hash.includes('login')) {
        window.location.hash = data.role === 'admin' ? '#admin' : '#catalog';
        showToast(`👋 Bienvenid@, ${data.name || data.email}`);
      }
    }
  };

  const updateCurrentActiveUser = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) localStorage.setItem('tuntun_current_user', JSON.stringify(user));
    else {
      localStorage.removeItem('tuntun_current_user');
      setOrders([]); 
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      if (hash.startsWith('access_token=') || hash.startsWith('error=')) {
        // Ignoramos el hash de Supabase para que no rompa el enrutador de tabs.
        // Supabase se encarga automáticamente de leer este token y autenticar al usuario.
        return;
      }

      const parts = hash.split('/');
      let tab = (parts[0] || 'catalog') as any;
      let subTab = parts[1] as any;

      if (currentUser?.role === 'admin') {
        if (tab === 'orders') { tab = 'admin'; subTab = 'orders'; window.history.replaceState(null, '', '#admin/orders'); }
        else if (tab === 'wallet') { tab = 'admin'; subTab = 'wallets'; window.history.replaceState(null, '', '#admin/wallets'); }
        else if (tab === 'profile') { tab = 'admin'; window.history.replaceState(null, '', '#admin'); }
      } else {
        if (['orders', 'wallet', 'profile', 'admin'].includes(tab) && !currentUser) {
          setLoginRedirectReason(`Inicia sesión con Google para acceder a ${tab}.`);
          tab = 'login';
          window.location.hash = '#login';
          return;
        }
        if (tab === 'admin' && currentUser?.role !== 'admin') {
          setLoginRedirectReason('El Panel de Administración es exclusivo.');
          tab = 'login';
          window.location.hash = '#login';
          return;
        }
      }
      setActiveTab(tab);
      if (subTab) setAdminSubTab(subTab);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const openLoginWithReason = (reason: string) => {
    setLoginRedirectReason(reason);
    window.location.hash = '#login';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginGoogle = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    updateCurrentActiveUser(null);
    window.location.hash = '#catalog';
    showToast('Sesión cerrada correctamente');
  };

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    if (!currentUser) return;
    updateCurrentActiveUser(updatedProfile);
    const { error } = await supabase.from('profiles').update({
      name: updatedProfile.name,
      player_id_default: updatedProfile.playerIdDefault || null,
      gamer_tag: updatedProfile.gamerTag || null,
      phone: updatedProfile.phone || null,
      preferred_bank: updatedProfile.preferredBank || null,
    }).eq('id', currentUser.uid);
    if (error) showToast(`❌ Error al guardar perfil: ${error.message}`);
    else showToast('✨ Perfil guardado exitosamente');
  };

  const handleSelectTab = (tab: string, subTab?: string) => window.location.hash = subTab ? `#${tab}/${subTab}` : `#${tab}`;

  const handleSelectProductForPurchase = (product: Product) => {
    if (!currentUser) return openLoginWithReason('Para realizar tu recarga de diamantes por ID, inicia sesión con Google primero.');
    setSelectedProductForOrder(product);
  };

  const handleCreateOrder = async (newOrderData: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>, receiptFile?: File) => {
    if (!currentUser) return;
    const isPaidWithWallet = newOrderData.paymentMethod === 'wallet_balance';
    let uploadedReceiptPath = null;

    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentUser.uid}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(filePath, receiptFile);
      if (uploadError) {
        showToast(`❌ Error al subir comprobante: ${uploadError.message}`);
        return;
      }
      uploadedReceiptPath = filePath;
    }

    if (isPaidWithWallet) {
      const { error } = await supabase.rpc('purchase_with_wallet', {
        p_player_id: newOrderData.playerId,
        p_player_tag: newOrderData.playerTag || '',
        p_product_id: newOrderData.productId,
        p_product_name_snapshot: newOrderData.productName,
        p_diamonds_total: newOrderData.diamondsTotal,
        p_price_usd: newOrderData.priceUSD,
        p_is_wallet_top_up: false
      });
      if (error) {
        showToast(`❌ Error de billetera: ${error.message}`);
        return;
      }
      showToast(`⚡ ¡Pedido pagado con Saldo Billetera! Tu recarga de diamantes está en proceso.`);
    } else {
      const { data: insertedOrder, error: insertError } = await supabase.from('orders').insert({
        user_id: currentUser.uid,
        player_id: newOrderData.playerId,
        player_tag: newOrderData.playerTag,
        product_id: newOrderData.productId,
        product_name_snapshot: newOrderData.productName,
        diamonds_total: newOrderData.diamondsTotal,
        price_usd: newOrderData.priceUSD,
        receipt_storage_path: uploadedReceiptPath,
        status: 'Pendiente',
        payment_method: 'bank_transfer',
        is_wallet_top_up: false,
      }).select().single();
      
      if (insertError) {
        showToast(`❌ Error al registrar pedido: ${insertError.message}`);
        return;
      }
      await supabase.from('order_status_history').insert({
        order_id: insertedOrder.id,
        status: 'Pendiente',
        note: 'Pedido registrado por cliente con comprobante bancario. En espera de verificación.'
      });
      showToast(`🎉 ¡Pedido registrado exitosamente!`);
    }

    if (isPaidWithWallet) await fetchUserProfile(currentUser.uid);
    await fetchOrders(currentUser.role, currentUser.uid); 
    setSelectedProductForOrder(null);
    window.location.hash = '#orders';
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, note?: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      showToast(`❌ Error al actualizar estado: ${error.message}`);
      return;
    }
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: newStatus,
      note: note || `Estado actualizado a ${newStatus}.`
    });
    
    showToast(`Estado del pedido actualizado a "${newStatus}"`);
    fetchOrders(currentUser!.role, currentUser!.uid);
  };

  const handleSubmitTopUpOrder = async (topUpOrder: Order, receiptFile?: File) => {
    if (!currentUser) return;
    let uploadedReceiptPath = null;
    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop();
      const filePath = `${currentUser.uid}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(filePath, receiptFile);
      if (uploadError) {
        showToast(`❌ Error al subir comprobante: ${uploadError.message}`);
        return;
      }
      uploadedReceiptPath = filePath;
    }

    const { data: insertedOrder, error } = await supabase.from('orders').insert({
      user_id: currentUser.uid,
      player_id: currentUser.playerIdDefault || 'N/A',
      product_name_snapshot: topUpOrder.productName,
      diamonds_total: 0,
      price_usd: topUpOrder.priceUSD,
      receipt_storage_path: uploadedReceiptPath,
      status: 'Pendiente',
      payment_method: 'bank_transfer',
      is_wallet_top_up: true,
    }).select().single();
    
    if (error) {
      showToast(`❌ Error: ${error.message}`);
      return;
    }
    
    await supabase.from('order_status_history').insert({
      order_id: insertedOrder.id,
      status: 'Pendiente',
      note: 'Solicitud de recarga de saldo. En espera de verificación.'
    });
    
    showToast(`📩 Solicitud de recarga por $${topUpOrder.priceUSD.toFixed(2)} USD registrada.`);
    fetchOrders(currentUser.role, currentUser.uid);
  };

  const activePendingOrdersCount = orders.filter((o) => o.status === 'Pendiente' || o.status === 'En proceso').length;

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {toastMessage && (
        <div id="toast-notification-bar" className="fixed top-20 right-4 z-50 bg-zinc-800 text-white border-2 border-emerald-500 px-5 py-3.5 rounded-2xl shadow flex items-center gap-3 animate-in fade-in">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-300">{toastMessage}</p>
        </div>
      )}
      {activeTab !== 'login' && (
        <Header currentUser={currentUser} onLoginGoogle={handleLoginGoogle} onLogout={handleLogout} onOpenLoginModal={() => openLoginWithReason('')} activeTab={activeTab} adminSubTab={adminSubTab} setActiveTab={handleSelectTab} pendingOrdersCount={activePendingOrdersCount} />
      )}
      <main className="flex-1">
        {activeTab === 'catalog' && (
          <div>
            <HeroBanner onSelectProductGroup={(category) => { setSelectedCatalogCategory(category); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }} onOpenQuickIDCheck={() => handleSelectTab('orders')} />
            {/* Smooth gradient fade between hero and catalog */}
            <div className="h-16 sm:h-24 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-transparent -mb-16 sm:-mb-24 relative z-[1]" />
            <ProductCatalog products={products} onSelectProduct={handleSelectProductForPurchase} selectedCategory={selectedCatalogCategory} setSelectedCategory={setSelectedCatalogCategory} currentUser={currentUser} onOpenWalletModal={() => handleSelectTab('wallet')} onUpdateProduct={() => {}} onDeleteProduct={() => {}} onAddProduct={() => {}} />
          </div>
        )}
        {activeTab === 'login' && (
          <LoginPage onLoginGoogle={handleLoginGoogle} onLoginSuccess={() => {}} onRegisterUser={() => {}} redirectReason={loginRedirectReason} onBackToCatalog={() => window.location.hash = '#catalog'} registeredUsers={registeredUsers} />
        )}
        {activeTab === 'wallet' && currentUser && (
          <WalletView currentUser={currentUser} bankAccounts={bankAccounts} userOrders={orders.filter(o => o.userEmail === currentUser.email)} onTopUpInstant={() => {}} onSubmitTopUpOrder={handleSubmitTopUpOrder} onNavigateToCatalog={() => window.location.hash = '#catalog'} />
        )}
        {activeTab === 'orders' && (
          <MyOrders orders={orders} currentUserEmail={currentUser?.email} onOpenWhatsAppSupport={() => {}} />
        )}
        {activeTab === 'profile' && currentUser && (
          <ProfileView currentUser={currentUser} onSaveProfile={handleSaveProfile} onLogout={handleLogout} onNavigateToWallet={() => window.location.hash = '#wallet'} />
        )}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel orders={orders} products={products} emailConfig={emailConfig} registeredUsers={registeredUsers} activeSubTab={adminSubTab} onSubTabChange={(st) => window.location.hash = `#admin/${st}`} onUpdateOrderStatus={handleUpdateOrderStatus} onAddProduct={() => {}} onUpdateProduct={() => {}} onDeleteProduct={() => {}} onUpdateEmailConfig={setEmailConfig} onUpdateUserWalletBalance={async (email, amount, isSetExact) => {
            const user = registeredUsers.find(u => u.email === email);
            if (user) {
              const newBalance = isSetExact ? amount : (user.walletBalanceUSD || 0) + amount;
              await supabase.from('profiles').update({ wallet_balance_usd: newBalance }).eq('id', user.uid);
              fetchAllUsersForAdmin();
              showToast(`💰 Saldo de ${email} actualizado a $${newBalance}`);
            }
          }} />
        )}
      </main>
      <OrderModal product={selectedProductForOrder} bankAccounts={bankAccounts} currentUser={currentUser} onClose={() => setSelectedProductForOrder(null)} onSubmitOrder={handleCreateOrder} onOpenWalletModal={() => { setSelectedProductForOrder(null); handleSelectTab('wallet'); }} />
      {currentUser?.role !== 'admin' && activeTab !== 'login' && <WhatsAppButton hasBottomNav={!!currentUser && activeTab !== 'login'} />}
      {activeTab !== 'login' && <Footer onSelectTab={handleSelectTab} />}
      {currentUser && activeTab !== 'login' && <BottomNavigation activeTab={activeTab} adminSubTab={adminSubTab} setActiveTab={handleSelectTab} pendingOrdersCount={activePendingOrdersCount} currentUser={currentUser} />}
    </div>
  );
}
