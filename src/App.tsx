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
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
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
  const [pendingTopUps, setPendingTopUps] = useState<any[]>([]);

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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'admin') {
      supabase.from('wallet_transactions')
        .select('*')
        .eq('type', 'top_up')
        .eq('status', 'Pendiente')
        .then(({ data }) => {
          if (data) setPendingTopUps(data);
        });
    }

    const channel = supabase.channel('global_realtime_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'wallet_transactions' 
      }, (payload) => {
        const newRecord = payload.new as any;
        const oldRecord = payload.old as any;
        
        // Admin Top-up Badge Logic
        if (currentUser.role === 'admin') {
          if (newRecord && newRecord.type === 'top_up' && newRecord.status === 'Pendiente') {
            setPendingTopUps(prev => {
              if (prev.find(t => t.id === newRecord.id)) return prev;
              return [...prev, newRecord];
            });
          }
          if (newRecord && newRecord.type === 'top_up' && newRecord.status !== 'Pendiente') {
             setPendingTopUps(prev => prev.filter(t => t.id !== newRecord.id));
          }
          if (payload.eventType === 'DELETE' && oldRecord) {
             setPendingTopUps(prev => prev.filter(t => t.id !== oldRecord.id));
          }
          
          // Refresh user list for admin if a transaction goes through
          if (newRecord && newRecord.status === 'Aprobado') {
             fetchAllUsersForAdmin();
          }
        } 
        
        // Client Logic
        if (newRecord && newRecord.user_id === currentUser.uid) {
          // If a top-up was approved, show a toast
          if (payload.eventType === 'UPDATE' && 
              newRecord.type === 'top_up' && 
              newRecord.status === 'Aprobado' &&
              oldRecord && oldRecord.status !== 'Aprobado') {
            showToast(`✅ ¡Tu recarga ha sido Aprobada! Tu saldo ha sido acreditado.`);
          }
          // Refresh user profile to get new balance and history
          fetchUserProfile(currentUser.uid);
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, (payload) => {
        const newRecord = payload.new as any;
        
        if (currentUser.role === 'admin') {
          fetchOrders('admin', currentUser.uid);
        } else {
          // Si es un cliente y la orden es suya, actualizar
          if (newRecord && newRecord.user_id === currentUser.uid) {
             fetchOrders('client', currentUser.uid);
          }
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, () => {
        // Al actualizar, crear o borrar productos, refrescar el catálogo
        fetchInitialData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const updateFooterHeight = () => {
      const footerElement = document.getElementById('footer-main');
      if (footerElement) {
        setFooterHeight(footerElement.offsetHeight);
      } else {
        setFooterHeight(0);
      }
    };

    // Inicial y en resize
    updateFooterHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateFooterHeight();
    });

    const footerElement = document.getElementById('footer-main');
    if (footerElement) {
      resizeObserver.observe(footerElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeTab]);

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
    
    // Hardcoded official bank accounts for Ecuador and Exterior
    const officialBanks: BankAccount[] = [
      {
        id: 'bg-1',
        bankName: 'Banco Guayaquil',
        accountType: 'Ahorro',
        accountNumber: '0023309772',
        holderName: 'Betsy Cruz Villacreses',
        holderId: '0954637872',
        logoColor: 'bg-rose-600',
        notes: 'Método de pago para Ecuador 🇪🇨'
      },
      {
        id: 'bp-1',
        bankName: 'Banco Pichincha',
        accountType: 'Ahorro',
        accountNumber: '2214495881',
        holderName: 'Betsy Cruz Villacreses',
        holderId: '0954637872',
        logoColor: 'bg-yellow-500',
        notes: 'Método de pago para Ecuador 🇪🇨'
      },
      {
        id: 'binance-1',
        bankName: 'Binance (USDT)',
        accountType: 'Binance Pay ID / Email',
        accountNumber: '1149560568',
        holderName: 'Betsy Cruz Villacreses',
        holderId: 'cruzbetsy340@gmail.com',
        logoColor: 'bg-yellow-400',
        notes: 'Método de pago exterior 🌐'
      }
    ];
    setBankAccounts(officialBanks);
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
        redemptionCode: o.redemption_code || null,
        statusHistory: (o.order_status_history || []).map((h: any) => ({
          status: h.status,
          timestamp: h.created_at,
          note: h.note
        })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      })));
    }
  };
  
  const fetchAllUsersForAdmin = async () => {
    const { data } = await supabase.rpc('get_all_users_with_balance');
    if (data) {
      setRegisteredUsers(data.map((p: any) => ({
        uid: p.id,
        name: p.name || 'Usuario',
        email: p.email,
        avatar: p.avatar_url,
        role: p.role as any,
        walletBalanceUSD: Number(p.wallet_balance_usd || 0),
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

    // Fetch computed balance
    const { data: balanceData, error: balanceError } = await supabase.rpc('get_wallet_balance', { p_user_id: userId });
    const computedBalance = balanceError ? 0 : Number(balanceData || 0);

    // Fetch wallet history
    const { data: historyData } = await supabase.from('wallet_transactions').select('*').eq('user_id', userId);
    if (historyData) setWalletHistory(historyData);

    if (data) {
      const userProfile: UserProfile = {
        uid: data.id,
        name: data.name || 'Usuario',
        email: data.email,
        avatar: data.avatar_url || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
        role: data.role as 'client' | 'admin',
        walletBalanceUSD: computedBalance,
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
      avatar_url: updatedProfile.avatar,
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

  const handleCreateOrder = async (newOrderData: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>) => {
    if (!currentUser) return;
    
    const { data, error } = await supabase.rpc('purchase_with_wallet_v2', {
      p_player_id: newOrderData.playerId,
      p_player_tag: newOrderData.playerTag || '',
      p_product_id: newOrderData.productId,
      p_product_name_snapshot: newOrderData.productName,
      p_diamonds_total: newOrderData.diamondsTotal,
      p_price_usd: newOrderData.priceUSD,
    });
    
    if (error) {
      showToast(`❌ Error de billetera: ${error.message}`);
      return;
    }
    
    const result = data as any;
    if (result?.has_code) {
      showToast(`🎉 ¡Compra completada! Tu código de recarga está disponible en "Mis Pedidos".`);
    } else {
      showToast(`⚡ ¡Pedido registrado! Recibirás tu código pronto.`);
    }
    
    await fetchUserProfile(currentUser.uid);
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

  const handleSubmitTopUpOrder = async (amount: number, bankName: string, receiptFile: File) => {
    if (!currentUser) return;
    
    let uploadedReceiptPath = null;
    let receiptHash = null;
    let autoVerified = false;
    let verificationWarnings: string[] = [];
    
    if (receiptFile) {
      showToast('Analizando comprobante por seguridad...');
      try {
        // 1. Calculate SHA-256 Hash
        const arrayBuffer = await receiptFile.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        receiptHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 2. Check for duplicate hash
        const { data: duplicateCheck } = await supabase
          .from('wallet_transactions')
          .select('id')
          .eq('receipt_hash', receiptHash)
          .limit(1);

        if (duplicateCheck && duplicateCheck.length > 0) {
          verificationWarnings.push('⚠️ Imagen duplicada: este comprobante ya fue subido previamente.');
        }

        // 3. OCR Processing with Tesseract
        const Tesseract = (await import('tesseract.js')).default;
        const result = await Tesseract.recognize(receiptFile, 'spa');
        const text = result.data.text;
        
        // 4. Validate Date (Super Forgiving for OCR)
        const today = new Date();
        const d = today.getDate().toString().padStart(2, '0');
        const d_single = today.getDate().toString();
        const m = (today.getMonth() + 1).toString().padStart(2, '0');
        const m_single = (today.getMonth() + 1).toString();
        const y = today.getFullYear().toString();
        const shortY = y.substring(2);
        
        // Month representations
        const shortM = today.toLocaleString('es', {month:'short'}).substring(0,3).toLowerCase().replace(/\./g, '');
        const longM = today.toLocaleString('es', {month:'long'}).toLowerCase();
        
        // Month map (for numeric matching)
        const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const shortMonth = monthNames[today.getMonth()];

        // Generate all valid date strings for today
        const validDateStrings = [
          `${d}/${m}/${y}`, `${d}-${m}-${y}`, `${y}-${m}-${d}`, 
          `${d}/${m}/${shortY}`, `${d}-${m}-${shortY}`,
          `${d_single}/${m_single}/${y}`, `${d_single}-${m_single}-${y}`,
          `${d_single}/${m_single}/${shortY}`, `${d_single}-${m_single}-${shortY}`,
          `${d} ${shortMonth} ${y}`, `${d} ${shortMonth} ${shortY}`,
          `${d_single} ${shortMonth} ${y}`, `${d_single} ${shortMonth} ${shortY}`,
          `${d} de ${longM} de ${y}`, `${d} ${longM} ${y}`,
          `${d}${m}${y}`, `${d}${m}${shortY}`
        ];

        // Clean text to handle common OCR mistakes
        let cleanText = text.toLowerCase().replace(/\s+/g, ' ');
        cleanText = cleanText.replace(/o/g, '0'); // Often '0' is read as 'O'
        cleanText = cleanText.replace(/\|/g, '1').replace(/l/g, '1'); // '1' read as 'l' or '|'

        let isToday = false;
        for (const dateStr of validDateStrings) {
           // Allow spaces around separators and handle OCR replacing separators with spaces
           const flexibleStr = dateStr.replace(/[\/\-]/g, ' ?[\\/\\- ] ?'); 
           const regex = new RegExp(flexibleStr, 'i');
           if (regex.test(cleanText)) {
             isToday = true;
             break;
           }
        }
        
        // Ultimate fallback: check if day, month and year exist somewhere in the text
        // (Only if it's a very bad scan but has all parts)
        if (!isToday) {
           if (
             (cleanText.includes(d) || cleanText.includes(d_single)) && 
             (cleanText.includes(m) || cleanText.includes(shortMonth) || cleanText.includes(longM)) && 
             (cleanText.includes(y) || cleanText.includes(` ${shortY} `))
           ) {
             isToday = true;
           }
        }

        if (!isToday) {
           // Let's see if we found ANY date to give a better error message
           const anyDateRegex = /\b(\d{1,2}) ?[\/\- de]* ?([a-z]{3,9}|\d{1,2}) ?[\/\- del]* ?(\d{2,4})\b/g;
           const matches = [...cleanText.matchAll(anyDateRegex)];
           
           if (matches.length === 0) {
              verificationWarnings.push('⚠️ Fecha no detectada: El OCR no pudo encontrar ninguna fecha clara en el comprobante.');
           } else {
              verificationWarnings.push(`⚠️ Posible fecha antigua: La fecha en el comprobante no parece ser de hoy (${d}/${m}/${y}).`);
           }
        }
        
      } catch (error) {
        console.error('OCR Error:', error);
        verificationWarnings.push('⚠️ Error OCR: No se pudo analizar automáticamente el texto de la imagen.');
      }

      autoVerified = verificationWarnings.length === 0;

      const fileExt = receiptFile.name.split('.').pop();
      const filePath = `${currentUser.uid}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(filePath, receiptFile);
      if (uploadError) {
        showToast(`❌ Error al subir comprobante: ${uploadError.message}`);
        return;
      }
      uploadedReceiptPath = filePath;
    }

    const { error } = await supabase.from('wallet_transactions').insert({
      user_id: currentUser.uid,
      amount: amount,
      type: 'top_up',
      status: 'Pendiente',
      receipt_url: uploadedReceiptPath,
      receipt_hash: receiptHash,
      auto_verified: autoVerified,
      verification_warnings: verificationWarnings
    });
    
    if (error) {
      showToast(`❌ Error al registrar recarga: ${error.message}`);
      return;
    }
    showToast(`🎉 ¡Solicitud de recarga enviada! Pendiente de verificación.`);
    fetchUserProfile(currentUser.uid); // Refresh balance/history
  };

  const handleUpdateTopUpStatus = async (transactionId: string, newStatus: 'Aprobado' | 'Rechazado') => {
    const { error } = await supabase.from('wallet_transactions').update({ status: newStatus }).eq('id', transactionId);
    if (error) {
      showToast(`❌ Error al actualizar recarga: ${error.message}`);
      return;
    }
    showToast(`Recarga actualizada a "${newStatus}"`);
  };

  const activePendingOrdersCount = orders.filter((o) => o.status === 'Pendiente' || o.status === 'En proceso').length;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <div 
        className="relative z-10 flex-1 flex flex-col bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
        style={{ marginBottom: `${footerHeight}px` }}
      >
      {toastMessage && (
        <div id="toast-notification-bar" className="fixed top-20 right-4 z-50 bg-zinc-800 text-white border-2 border-emerald-500 px-5 py-3.5 rounded-2xl shadow flex items-center gap-3 animate-in fade-in">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-300">{toastMessage}</p>
        </div>
      )}
      {activeTab !== 'login' && (
        <Header currentUser={currentUser} onLoginGoogle={handleLoginGoogle} onLogout={handleLogout} onOpenLoginModal={() => openLoginWithReason('')} activeTab={activeTab} adminSubTab={adminSubTab} setActiveTab={handleSelectTab} pendingOrdersCount={activePendingOrdersCount} pendingTopUps={pendingTopUps} />
      )}
      <main className={`flex-1 ${['wallet', 'orders'].includes(activeTab) ? 'pb-24 md:pb-0' : ''}`}>
        {activeTab === 'catalog' && (
          <div>
            <HeroBanner onSelectProductGroup={(category) => { setSelectedCatalogCategory(category); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }} onOpenQuickIDCheck={() => handleSelectTab('orders')} />
            {/* Smooth gradient fade between hero and catalog */}
            <div className="h-16 sm:h-24 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-transparent -mb-16 sm:-mb-24 relative z-[1] pointer-events-none" />
            <ProductCatalog products={products} onSelectProduct={handleSelectProductForPurchase} selectedCategory={selectedCatalogCategory} setSelectedCategory={setSelectedCatalogCategory} currentUser={currentUser} onOpenWalletModal={() => handleSelectTab('wallet')} onUpdateProduct={() => {}} onDeleteProduct={() => {}} onAddProduct={() => {}} />
          </div>
        )}
        {activeTab === 'login' && (
          <LoginPage onLoginGoogle={handleLoginGoogle} onLoginSuccess={() => {}} onRegisterUser={() => {}} redirectReason={loginRedirectReason} onBackToCatalog={() => window.location.hash = '#catalog'} registeredUsers={registeredUsers} />
        )}
        {activeTab === 'wallet' && currentUser && (
          <WalletView currentUser={currentUser} bankAccounts={bankAccounts} walletHistory={walletHistory} onSubmitTopUpOrder={handleSubmitTopUpOrder} onNavigateToCatalog={() => window.location.hash = '#catalog'} />
        )}
        {activeTab === 'orders' && (
          <MyOrders orders={orders} currentUserEmail={currentUser?.email} onOpenWhatsAppSupport={() => {}} />
        )}
        {activeTab === 'profile' && currentUser && (
          <ProfileView currentUser={currentUser} onSaveProfile={handleSaveProfile} onLogout={handleLogout} onNavigateToWallet={() => window.location.hash = '#wallet'} />
        )}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel orders={orders} products={products} emailConfig={emailConfig} registeredUsers={registeredUsers} activeSubTab={adminSubTab} onSubTabChange={(st) => window.location.hash = `#admin/${st}`} onUpdateOrderStatus={handleUpdateOrderStatus} onAddProduct={() => {}} onUpdateProduct={() => {}} onDeleteProduct={() => {}} onUpdateEmailConfig={setEmailConfig} pendingTopUps={pendingTopUps} onUpdateTopUpStatus={handleUpdateTopUpStatus} onUpdateUserWalletBalance={async (email, amount, isSetExact) => {
            const user = registeredUsers.find(u => u.email === email);
            if (user) {
              let adjustment = amount;
              if (isSetExact) {
                const { data: balanceData } = await supabase.rpc('get_wallet_balance', { p_user_id: user.uid });
                const currentBalance = Number(balanceData || 0);
                adjustment = amount - currentBalance;
              }
              
              if (adjustment !== 0) {
                const { error } = await supabase.from('wallet_transactions').insert({
                  user_id: user.uid,
                  amount: adjustment,
                  type: 'admin_adjustment',
                  status: 'Aprobado',
                  admin_note: isSetExact ? `Ajuste manual exacto a $${amount}` : `Ajuste manual de $${amount > 0 ? '+' : ''}${amount}`
                });
                
                if (error) {
                  showToast(`❌ Error al ajustar saldo: ${error.message}`);
                } else {
                  fetchAllUsersForAdmin();
                  showToast(`💰 Ajuste de saldo aplicado a ${email}`);
                }
              }
            }
          }} />
        )}
      </main>
      </div>
      <OrderModal product={selectedProductForOrder} bankAccounts={bankAccounts} currentUser={currentUser} onClose={() => setSelectedProductForOrder(null)} onSubmitOrder={handleCreateOrder} onOpenWalletModal={() => { setSelectedProductForOrder(null); handleSelectTab('wallet'); }} />
      {currentUser?.role !== 'admin' && activeTab !== 'login' && <WhatsAppButton hasBottomNav={!!currentUser && activeTab !== 'login'} />}
      {activeTab !== 'login' && activeTab !== 'orders' && activeTab !== 'wallet' && <Footer onSelectTab={handleSelectTab} />}
      {currentUser && activeTab !== 'login' && <BottomNavigation activeTab={activeTab} adminSubTab={adminSubTab} setActiveTab={handleSelectTab} pendingOrdersCount={activePendingOrdersCount} currentUser={currentUser} />}
    </div>
  );
}
