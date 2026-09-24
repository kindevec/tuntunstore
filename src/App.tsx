import React, { useState, useEffect, useRef } from 'react';
import { Product, BankAccount, Order, UserProfile, OrderStatus, ProductCategory, HeroSlide, AdminDashboardStats } from './types';
import { supabase } from './supabaseClient';
import { convertImageToWebp, resizeImageForProcessing } from './utils/imageOptimization';
import { calculateFileHash, checkReceiptDuplicate } from './utils/receiptSecurity';

import { Header } from './components/Header';
import { WhatsAppButton } from './components/WhatsAppButton';
import { BottomNavigation } from './components/BottomNavigation';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ProductCatalog } from './components/ProductCatalog';
import { useIsPWA } from './hooks/useIsPWA';
import { ErrorBoundary } from './components/ErrorBoundary';

// 🚀 Lazy-Loaded Components: Se descargan bajo demanda solo cuando el usuario accede a esa vista
const HeroBanner = React.lazy(() => import('./components/HeroBanner').then(m => ({ default: m.HeroBanner })));
const OrderModal = React.lazy(() => import('./components/OrderModal').then(m => ({ default: m.OrderModal })));
const WalletView = React.lazy(() => import('./components/WalletView').then(m => ({ default: m.WalletView })));
const MyOrders = React.lazy(() => import('./components/MyOrders').then(m => ({ default: m.MyOrders })));
const ProfileView = React.lazy(() => import('./components/ProfileView').then(m => ({ default: m.ProfileView })));
const AdminPanel = React.lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const PayPhoneConfirmPage = React.lazy(() => import('./components/PayPhoneConfirmPage').then(m => ({ default: m.PayPhoneConfirmPage })));
const LoginPage = React.lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })));
const InstallPWAPrompt = React.lazy(() => import('./components/InstallPWAPrompt').then(m => ({ default: m.InstallPWAPrompt })));

// 📱 Componentes PWA exclusivos: Code-split para que visitantes web NO los descarguen
const PWAAppBar = React.lazy(() => import('./components/pwa/PWAAppBar').then(m => ({ default: m.PWAAppBar })));
const PWAHomeView = React.lazy(() => import('./components/pwa/PWAHomeView').then(m => ({ default: m.PWAHomeView })));
const PWACatalogView = React.lazy(() => import('./components/pwa/PWACatalogView').then(m => ({ default: m.PWACatalogView })));
const PWAWalletView = React.lazy(() => import('./components/pwa/PWAWalletView').then(m => ({ default: m.PWAWalletView })));
const PWAOrdersView = React.lazy(() => import('./components/pwa/PWAOrdersView').then(m => ({ default: m.PWAOrdersView })));
const PWAProfileView = React.lazy(() => import('./components/pwa/PWAProfileView').then(m => ({ default: m.PWAProfileView })));

export default function App() {
  const isPWA = useIsPWA();
  const [showPWATopBar, setShowPWATopBar] = useState(false);
  const [isInstallPromptActive, setIsInstallPromptActive] = useState(false);
  const [installPromptTrigger, setInstallPromptTrigger] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('tuntun_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const currentUserRef = useRef<UserProfile | null>(currentUser);
  currentUserRef.current = currentUser;

  const [products, setProducts] = useState<Product[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [adminStats, setAdminStats] = useState<AdminDashboardStats | null>(null);

  const [loginRedirectReason, setLoginRedirectReason] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login' | 'payphone-confirm'>('home');
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'catalog' | 'wallets' | 'codes' | 'banners'>('orders');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingTopUps, setPendingTopUps] = useState<any[]>([]);
  const [isPayPhoneGatewayActive, setIsPayPhoneGatewayActive] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    fetchInitialData();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        updateCurrentActiveUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        updateCurrentActiveUser(null);
      }
    });

    // Realtime channel for public data (hero_slides & products) - active for ALL users
    const publicChannel = supabase.channel('tuntun_public_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'hero_slides' 
      }, () => {
        fetchInitialData();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, () => {
        fetchInitialData();
      })
      .subscribe();

    const handleLocalBannersUpdated = () => {
      fetchInitialData();
    };
    window.addEventListener('tuntun_banners_updated', handleLocalBannersUpdated);

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(publicChannel);
      window.removeEventListener('tuntun_banners_updated', handleLocalBannersUpdated);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'admin') {
      supabase.from('wallet_transactions')
        .select('*')
        .eq('type', 'top_up')
        .eq('status', 'Pendiente')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setPendingTopUps(data);
        });
      fetchAdminStats();
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
          fetchAdminStats();
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
          fetchAdminStats();
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
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        const newProfile = payload.new as any;
        const oldProfile = payload.old as any;

        if (currentUser && (newProfile?.id === currentUser.uid || oldProfile?.id === currentUser.uid)) {
          if (newProfile && typeof newProfile.is_blocked === 'boolean') {
            const wasBlocked = !!currentUser.isBlocked;
            const nowBlocked = !!newProfile.is_blocked;
            if (!wasBlocked && nowBlocked) {
              showToast('⚠️ Tu cuenta ha sido inhabilitada por la administración.');
            } else if (wasBlocked && !nowBlocked) {
              showToast('✅ Tu cuenta ha sido reactivada por la administración.');
            }
            updateCurrentActiveUser({
              ...currentUser,
              isBlocked: nowBlocked,
              role: newProfile.role || currentUser.role,
              name: newProfile.name || currentUser.name,
              gamerTag: newProfile.gamer_tag !== undefined ? newProfile.gamer_tag : currentUser.gamerTag,
              playerIdDefault: newProfile.player_id_default !== undefined ? newProfile.player_id_default : currentUser.playerIdDefault,
              phone: newProfile.phone !== undefined ? newProfile.phone : currentUser.phone,
              preferredBank: newProfile.preferred_bank !== undefined ? newProfile.preferred_bank : currentUser.preferredBank,
            });
          }
          fetchUserProfile(currentUser.uid);
        }
        if (currentUser?.role === 'admin') {
          fetchAllUsersForAdmin();
          fetchAdminStats();
        }
      })
      .subscribe();

    const handleWalletUpdated = () => {
      if (currentUser?.uid) {
        fetchUserProfile(currentUser.uid);
      }
    };
    window.addEventListener('tuntun_wallet_updated', handleWalletUpdated);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('tuntun_wallet_updated', handleWalletUpdated);
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
    const { data: slidesData } = await supabase.from('hero_slides').select('*').eq('active', true).order('order_index', { ascending: true });
    if (slidesData) {
      setHeroSlides([...slidesData]);
    }

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

  const fetchAdminStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      if (!error && data) {
        setAdminStats(data as AdminDashboardStats);
      }
    } catch (e) {
      console.warn('Error fetching admin dashboard stats:', e);
    }
  };

  const mapSupabaseOrder = (o: any): Order => ({
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
  });

  const fetchOrders = async (userRole: string, userId: string) => {
    if (userRole !== 'admin') {
      const { data: ordData, error } = await supabase
        .from('orders')
        .select('*, profiles!orders_user_id_fkey(name, email), order_status_history(*)')
        .order('created_at', { ascending: false })
        .eq('user_id', userId)
        .limit(50);
        
      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }
      if (ordData) {
        setOrders(ordData.map(mapSupabaseOrder));
      }
      return;
    }

    // Para administradores: Supabase PostgREST limita las respuestas a 1000 filas por defecto.
    // Iteramos en lotes de 1000 para cargar la totalidad de los pedidos reales existentes.
    let allOrdData: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('orders')
        .select('*, profiles!orders_user_id_fkey(name, email), order_status_history(*)')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Error fetching orders batch:", error);
        break;
      }

      if (batch && batch.length > 0) {
        allOrdData = allOrdData.concat(batch);
        if (batch.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      } else {
        hasMore = false;
      }
    }

    if (allOrdData.length > 0) {
      setOrders(allOrdData.map(mapSupabaseOrder));
    }
  };
  
  const fetchAllUsersForAdmin = async () => {
    let allUsers: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .rpc('get_all_users_with_balance')
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Error fetching users batch:", error);
        break;
      }

      if (data && data.length > 0) {
        allUsers = allUsers.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      } else {
        hasMore = false;
      }
    }

    if (allUsers.length > 0) {
      setRegisteredUsers(allUsers.map((p: any) => ({
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
        isBlocked: !!p.is_blocked,
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
        isBlocked: !!data.is_blocked,
      };
      updateCurrentActiveUser(userProfile);
      
      fetchOrders(userProfile.role, userProfile.uid);
      if (userProfile.role === 'admin') fetchAllUsersForAdmin();

      if (window.location.hash.includes('login') || window.location.hash === '' || window.location.hash === '#') {
        const targetTab = data.role === 'admin' ? 'admin' : 'catalog';
        const targetHash = data.role === 'admin' ? '#admin' : '#catalog';
        setLoginRedirectReason(null);
        setActiveTab(targetTab);
        window.location.hash = targetHash;
        showToast(`👋 Bienvenid@, ${data.name || data.email}`);
      }
    }
  };

  const updateCurrentActiveUser = (user: UserProfile | null) => {
    currentUserRef.current = user;
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

      const cleanHash = hash.split('?')[0];
      const parts = cleanHash.split('/');
      let tab = (parts[0] || 'home') as any;
      let subTab = parts[1] as any;

      // Handle PayPhone return query params (?id=...&clientTransactionId=...)
      const searchParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      const hashParams = new URLSearchParams(hashQuery);
      const hasId = searchParams.has('id') || hashParams.has('id');
      const hasTxId = searchParams.has('clientTransactionId') || searchParams.has('clientTxId') || hashParams.has('clientTransactionId') || hashParams.has('clientTxId');
      const isPayPhoneReturn = hasId && hasTxId;

      if (isPayPhoneReturn) {
        tab = 'payphone-confirm';
      }

      // Soporte para acceso directo por query param en PWA (?tab=catalog, etc.)
      const tabParam = searchParams.get('tab');
      if (!cleanHash && tabParam) {
        tab = tabParam as any;
      }

      // Handle PayPhone confirm route in hash (#payphone/confirm or #payphone-confirm)
      if ((tab === 'payphone' && (subTab === 'confirm' || (subTab && subTab.startsWith('confirm')))) || tab === 'payphone-confirm') {
        tab = 'payphone-confirm';
      }

      // Obtener el usuario activo más reciente (evitando closures desactualizados de React)
      let effectiveUser = currentUserRef.current || currentUser;
      if (!effectiveUser) {
        try {
          const saved = localStorage.getItem('tuntun_current_user');
          if (saved) effectiveUser = JSON.parse(saved);
        } catch (_) {}
      }

      if (effectiveUser?.role === 'admin') {
        setLoginRedirectReason(null);
        if (!isPWA && tab === 'orders') { 
          tab = 'admin'; 
          subTab = 'orders'; 
          window.history.replaceState(null, '', '#admin/orders'); 
        }
      } else {
        if (['orders', 'profile', 'admin'].includes(tab) && !effectiveUser) {
          setLoginRedirectReason(`Inicia sesión con Google para acceder a ${tab}.`);
          tab = 'login';
          window.location.hash = '#login';
          return;
        }
        if (tab === 'admin') {
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
  }, [currentUser, isPWA]);

  const openLoginWithReason = (reason: string) => {
    setLoginRedirectReason(reason);
    window.location.hash = '#login';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginGoogle = async () => {
    const currentOrigin = window.location.origin;
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: `${currentOrigin}/`
      }
    });
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    updateCurrentActiveUser(null);
    window.location.hash = '#home';
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
  const handleSelectTab = (tab: string, subTab?: string) => {
    setIsPayPhoneGatewayActive(false);
    window.location.hash = subTab ? `#${tab}/${subTab}` : `#${tab}`;
  };

  const handleSelectProductForPurchase = (product: Product) => {
    if (!currentUser) return openLoginWithReason('Para realizar tu compra de diamantes, inicia sesión con Google primero.');
    setSelectedProductForOrder(product);
  };

  const handleCreateOrder = async (newOrderData: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>) => {
    if (!currentUser) return;

    if (currentUser.isBlocked) {
      showToast('🚫 Tu cuenta ha sido inhabilitada por la administración. No puedes realizar compras.');
      return;
    }

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
      showToast(`✅ ¡Compra completada! Tu código de recarga está disponible en "Mis Pedidos".`);
    } else {
      showToast(`⏳ ¡Pedido registrado! Recibirás tu código pronto.`);
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

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('products').insert({
      name: productData.name,
      diamonds: productData.diamonds,
      bonus_diamonds: productData.bonusDiamonds || 0,
      price_usd: productData.priceUSD,
      category: productData.category,
      description: productData.description || '',
      is_popular: !!productData.isPopular,
      is_gold_promo: !!productData.isGoldPromo,
      badge_text: productData.badgeText || null,
      active: true
    });

    if (error) {
      showToast(`❌ Error al crear producto: ${error.message}`);
    } else {
      showToast(`✅ Producto "${productData.name}" creado exitosamente`);
      fetchInitialData();
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const { error } = await supabase.from('products').update({
      name: updatedProduct.name,
      diamonds: updatedProduct.diamonds,
      bonus_diamonds: updatedProduct.bonusDiamonds || 0,
      price_usd: updatedProduct.priceUSD,
      category: updatedProduct.category,
      description: updatedProduct.description || '',
      is_popular: !!updatedProduct.isPopular,
      is_gold_promo: !!updatedProduct.isGoldPromo,
      badge_text: updatedProduct.badgeText || null,
    }).eq('id', updatedProduct.id);

    if (error) {
      showToast(`❌ Error al actualizar producto: ${error.message}`);
    } else {
      showToast(`✅ Producto "${updatedProduct.name}" actualizado exitosamente`);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      fetchInitialData();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      showToast(`❌ Error al eliminar producto: ${error.message}`);
    } else {
      showToast(`🗑️ Producto eliminado`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      fetchInitialData();
    }
  };

  const handleSubmitTopUpOrder = async (amount: number, bankName: string, receiptFile: File) => {
    if (!currentUser) return;

    if (currentUser.isBlocked) {
      showToast('🚫 Tu cuenta ha sido inhabilitada por la administración. No puedes realizar recargas de saldo.');
      return;
    }

    // 1. Restricción de 1 Solicitud Pendiente Activa (Lógica de Negocio)
    const { data: activePending } = await supabase
      .from('wallet_transactions')
      .select('id, amount')
      .eq('user_id', currentUser.uid)
      .eq('type', 'top_up')
      .eq('status', 'Pendiente')
      .limit(1);

    if (activePending && activePending.length > 0) {
      showToast(`⏳ Ya tienes una recarga pendiente de $${Number(activePending[0].amount).toFixed(2)} USD en revisión. Espera a que sea atendida.`);
      return;
    }
    
    let uploadedReceiptPath = null;
    let receiptHash = null;
    let autoVerified = false;
    let verificationWarnings: string[] = [];
    
    if (receiptFile) {
      showToast('Analizando comprobante por seguridad...');

      // --- PASO 0: Redimensionar imagen para evitar colapso de memoria en celulares ---
      let processableFile: File;
      try {
        processableFile = await resizeImageForProcessing(receiptFile, 1200);
      } catch {
        processableFile = receiptFile; // Fallback seguro: usar original
      }

      try {
        // 1. Calculate SHA-256 Hash sobre el archivo original (determinista y exacto)
        try {
          receiptHash = await calculateFileHash(receiptFile);

          // 2. Check for duplicate hash (La Regla de Oro: Bloqueo Inmediato Global)
          const isDuplicate = await checkReceiptDuplicate(receiptHash);
          if (isDuplicate) {
            showToast('⚠️ Este comprobante ya fue registrado previamente en el sistema. No se permiten comprobantes duplicados.');
            return;
          }
        } catch (hashErr) {
          console.warn('Hash SHA-256 omitido por contexto del navegador:', hashErr);
        }

        // 3. OCR Processing with Tesseract - CON TIMEOUT DE SEGURIDAD
        // Si el OCR no responde en 4 segundos (red lenta, celular antiguo),
        // se omite y el comprobante pasa a revisión manual del admin.
        try {
          const ocrTimeoutPromise = new Promise<null>((_resolve, reject) => {
            setTimeout(() => reject(new Error('OCR_TIMEOUT')), 4000);
          });

          const ocrProcessPromise = (async () => {
            const Tesseract = (await import('tesseract.js')).default;
            const result = await Tesseract.recognize(processableFile, 'spa');
            return result.data.text;
          })();

          const text = (await Promise.race([ocrProcessPromise, ocrTimeoutPromise])) as string;
        
          // 4. Validate Date (Super Forgiving for OCR, allows up to 3 days ago)
          const generateDateStrings = (date: Date) => {
            const d = date.getDate().toString().padStart(2, '0');
            const d_single = date.getDate().toString();
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const m_single = (date.getMonth() + 1).toString();
            const y = date.getFullYear().toString();
            const shortY = y.substring(2);
            
            const shortM = date.toLocaleString('es', {month:'short'}).substring(0,3).toLowerCase().replace(/\./g, '');
            const longM = date.toLocaleString('es', {month:'long'}).toLowerCase();
            const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            const shortMonth = monthNames[date.getMonth()];
            
            return {
              strings: [
                `${d}/${m}/${y}`, `${d}-${m}-${y}`, `${y}-${m}-${d}`, 
                `${d}/${m}/${shortY}`, `${d}-${m}-${shortY}`,
                `${d_single}/${m_single}/${y}`, `${d_single}-${m_single}-${y}`,
                `${d_single}/${m_single}/${shortY}`, `${d_single}-${m_single}-${shortY}`,
                `${d} ${shortMonth} ${y}`, `${d} ${shortMonth} ${shortY}`,
                `${d_single} ${shortMonth} ${y}`, `${d_single} ${shortMonth} ${shortY}`,
                `${d} de ${longM} de ${y}`, `${d} ${longM} ${y}`,
                `${d}${m}${y}`, `${d}${m}${shortY}`
              ],
              d, d_single, m, m_single, y, shortY, shortMonth, longM
            };
          };

          const today = new Date();
          const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
          const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          
          const datesToCheck = [today, yesterday, twoDaysAgo].map(generateDateStrings);

          // Clean text to handle common OCR mistakes
          let cleanText = text.toLowerCase().replace(/\s+/g, ' ');
          cleanText = cleanText.replace(/o/g, '0'); // Often '0' is read as 'O'
          cleanText = cleanText.replace(/\|/g, '1').replace(/l/g, '1'); // '1' read as 'l' or '|'

          let isValidDate = false;
          let matchedDateLabel = '';
          
          for (let i = 0; i < datesToCheck.length; i++) {
             const dateObj = datesToCheck[i];
             if (isValidDate) break;
             
             for (const dateStr of dateObj.strings) {
               const flexibleStr = dateStr.replace(/[\/\-]/g, ' ?[\\\\/\\\\- ] ?'); 
               const regex = new RegExp(flexibleStr, 'i');
               if (regex.test(cleanText)) {
                 isValidDate = true;
                 matchedDateLabel = i === 0 ? 'Hoy' : i === 1 ? 'Ayer' : 'Hace 2 días';
                 break;
               }
             }
             
             if (!isValidDate) {
               // Fallback parts match
               if (
                 (cleanText.includes(dateObj.d) || cleanText.includes(dateObj.d_single)) && 
                 (cleanText.includes(dateObj.m) || cleanText.includes(dateObj.shortMonth) || cleanText.includes(dateObj.longM)) && 
                 (cleanText.includes(dateObj.y) || cleanText.includes(` ${dateObj.shortY} `) || cleanText.includes(` ${dateObj.shortY}`) || cleanText.includes(`${dateObj.shortY} `))
               ) {
                 isValidDate = true;
                 matchedDateLabel = i === 0 ? 'Hoy' : i === 1 ? 'Ayer' : 'Hace 2 días';
               }
             }
          }
          
          if (isValidDate && matchedDateLabel !== 'Hoy') {
             verificationWarnings.push(`⚠️ Fecha antigua: El comprobante detectado es de ${matchedDateLabel}.`);
          }

          if (!isValidDate) {
             // Let's see if we found ANY date to give a better error message
             const anyDateRegex = /\b(\d{1,2}) ?[\/\- de]* ?([a-z]{3,9}|\d{1,2}) ?[\/\- del]* ?(\d{2,4})\b/g;
             const matches = [...cleanText.matchAll(anyDateRegex)];
             
             if (matches.length === 0) {
                verificationWarnings.push('⚠️ Fecha no detectada: El OCR no pudo encontrar ninguna fecha clara en el comprobante.');
             } else {
                const detectedDate = matches[0][0].trim();
                verificationWarnings.push(`⚠️ Fecha muy antigua: Se detectó "${detectedDate}" pero está fuera de los 3 días válidos.`);
             }
          }
          
          // Validate if it is actually a receipt
          const receiptKeywords = ['transferencia', 'depósito', 'deposito', 'comprobante', 'pago', 'monto', 'banco', 'cuenta', 'referencia', 'documento', 'saldo', 'exitoso', 'aprobado', 'detalles'];
          const isReceipt = receiptKeywords.some(kw => cleanText.includes(kw));
          
          if (!isReceipt) {
             verificationWarnings.push('⚠️ Imagen Sospechosa: El texto no contiene palabras típicas de un comprobante bancario (pago, transferencia, etc.).');
          }

          // 5. Amount Extraction OCR Check (Monto transferido vs Monto solicitado)
          let detectedAmount: number | null = null;
          const textUpper = text.toUpperCase();
          
          const currencyMatches = [...textUpper.matchAll(/(?:MONTO|VALOR|TOTAL|IMPORTE|RECIBIDO|USD|\$)\s*[:=]?\s*\$?\s*(\d+[\.\\,]\d{2})\b/g)];
          const dollarMatches = [...textUpper.matchAll(/\$\s*(\d+[\.\\,]\d{2})\b/g)];
          const allMatches = [...currencyMatches, ...dollarMatches];
          
          const extractedAmounts: number[] = [];
          for (const m of allMatches) {
            if (m[1]) {
              const num = parseFloat(m[1].replace(',', '.'));
              if (!isNaN(num) && num > 0 && num < 5000) {
                extractedAmounts.push(num);
              }
            }
          }
          
          if (extractedAmounts.length > 0) {
            const exactMatch = extractedAmounts.find(v => Math.abs(v - amount) < 0.01);
            if (exactMatch) {
              detectedAmount = exactMatch;
            } else {
              detectedAmount = extractedAmounts[0];
              verificationWarnings.push(
                `⚠️ Diferencia de Monto: El usuario solicitó $${amount.toFixed(2)} USD pero el comprobante muestra $${detectedAmount.toFixed(2)} USD.`
              );
            }
          } else {
            const anyDecimals = [...textUpper.matchAll(/\b(\d+[\.\\,]\d{2})\b/g)]
              .map(m => parseFloat(m[1].replace(',', '.')))
              .filter(n => n > 0 && n < 5000);
            
            const exactMatch = anyDecimals.find(v => Math.abs(v - amount) < 0.01);
            if (!exactMatch && anyDecimals.length > 0) {
              verificationWarnings.push(
                `⚠️ Posible Diferencia de Monto: El usuario solicitó $${amount.toFixed(2)} USD pero el comprobante contiene cifras como $${anyDecimals[0].toFixed(2)} USD.`
              );
            }
          }
          
        } catch (ocrError: any) {
          // Si el OCR hizo timeout o falló por cualquier razón, NO bloqueamos la subida.
          // El comprobante se sube de todas formas y queda para revisión manual del admin.
          console.warn('OCR omitido (timeout o error):', ocrError?.message || ocrError);
          if (ocrError?.message === 'OCR_TIMEOUT') {
            verificationWarnings.push('⚠️ Verificación automática omitida: El análisis OCR tardó demasiado. El comprobante será revisado manualmente por el administrador.');
          } else {
            verificationWarnings.push('⚠️ Error OCR: No se pudo analizar automáticamente el texto de la imagen.');
          }
        }
        
      } catch (error) {
        console.error('Error en análisis de comprobante:', error);
        verificationWarnings.push('⚠️ Error en pre-análisis: El comprobante será revisado manualmente por el administrador.');
      }

      autoVerified = verificationWarnings.length === 0;

      // --- SUBIDA DEL COMPROBANTE (siempre se ejecuta, protegida con try/catch) ---
      try {
        // Optimizar comprobante a WebP para reducir almacenamiento
        let fileToUpload: File;
        let contentType = 'image/webp';
        try {
          fileToUpload = await convertImageToWebp(processableFile, 0.8);
        } catch {
          // Si la conversión WebP falla (formatos HEIC, imágenes corruptas), subir original
          console.warn('Conversión WebP falló, subiendo imagen original.');
          fileToUpload = processableFile;
          contentType = processableFile.type || 'image/jpeg';
        }

        const fileExt = fileToUpload.name.split('.').pop() || 'webp';
        const filePath = `${currentUser.uid}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, fileToUpload, { contentType });
        if (uploadError) {
          showToast(`❌ Error al subir comprobante: ${uploadError.message}`);
          return;
        }
        uploadedReceiptPath = filePath;
      } catch (uploadCatchError: any) {
        showToast('❌ Error de conexión al subir imagen. Revisa tu señal e inténtalo de nuevo.');
        console.error('Upload catch error:', uploadCatchError);
        return;
      }
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
    showToast('🎉 ¡Solicitud de recarga enviada! Pendiente de verificación.');
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

  const handleUpdateTopUpAmount = async (transactionId: string, newAmount: number) => {
    const { error } = await supabase.from('wallet_transactions').update({ amount: newAmount }).eq('id', transactionId);
    if (error) {
      showToast(`❌ Error al actualizar monto: ${error.message}`);
      return;
    }
    showToast(`✅ Monto de recarga actualizado a $${newAmount.toFixed(2)} USD`);
    if (currentUser?.role === 'admin') {
      supabase.from('wallet_transactions')
        .select('*')
        .eq('type', 'top_up')
        .eq('status', 'Pendiente')
        .then(({ data }) => {
          if (data) setPendingTopUps(data);
        });
    }
  };

  const activePendingOrdersCount = orders.filter((o) => o.status === 'Pendiente' || o.status === 'En proceso').length;

  return (
    <div className={`min-h-[100dvh] bg-[#05070a] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black ${isPWA && (activeTab === 'catalog' || activeTab === 'login') ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : ''}`}>
      <div 
        className={`relative ${activeTab === 'home' && !isPWA ? 'z-10' : ''} flex-1 flex flex-col ${activeTab === 'login' ? 'bg-[#05070a]' : 'bg-zinc-900'} ${activeTab === 'home' ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : ''} ${isPWA && (activeTab === 'catalog' || activeTab === 'login') ? 'h-full max-h-full overflow-hidden' : ''}`} 
        style={activeTab === 'home' ? { marginBottom: `${footerHeight}px` } : undefined}
      >
      {toastMessage && (
        <div id="toast-notification-bar" className="fixed top-20 right-4 z-50 bg-zinc-800 text-white border-2 border-emerald-500 px-5 py-3.5 rounded-2xl shadow flex items-center gap-3 animate-in fade-in">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-300">{toastMessage}</p>
        </div>
      )}
      {activeTab !== 'login' && (
        isPWA ? (
          <React.Suspense fallback={<div className="h-14 bg-[#05140f] border-b border-emerald-500/20" />}>
            <PWAAppBar
              currentUser={currentUser}
              onOpenLogin={() => openLoginWithReason('')}
              onNavigateToWallet={() => handleSelectTab('wallet')}
              onNavigateToProfile={() => handleSelectTab('profile')}
              onNavigateToOrders={() => {
                if (currentUser?.role === 'admin') {
                  handleSelectTab('admin', 'orders');
                } else {
                  handleSelectTab('orders');
                }
              }}
              onNavigateToHome={() => handleSelectTab('home')}
              onNavigateToAdmin={() => handleSelectTab('admin')}
              onLogout={handleLogout}
              pendingOrdersCount={activePendingOrdersCount}
              pendingTopUpsCount={pendingTopUps.length}
            />
          </React.Suspense>
        ) : (
          <Header 
            currentUser={currentUser} 
            onLoginGoogle={handleLoginGoogle} 
            onLogout={handleLogout} 
            onOpenLoginModal={() => openLoginWithReason('')} 
            activeTab={activeTab} 
            adminSubTab={adminSubTab} 
            setActiveTab={handleSelectTab} 
            pendingOrdersCount={activePendingOrdersCount} 
            pendingTopUps={pendingTopUps} 
            showPWATopBar={!isPWA && showPWATopBar}
            onTriggerInstallPWA={() => setInstallPromptTrigger(Date.now())}
          />
        )
      )}
      <main className={`flex-1 ${isPWA && (activeTab === 'catalog' || activeTab === 'login') ? 'min-h-0 flex flex-col overflow-hidden h-full' : ''}`}>
        <ErrorBoundary fallbackTitle="Error al cargar la sección">
          <React.Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        {activeTab === 'home' && (
          isPWA ? (
            <PWAHomeView
              products={products}
              heroSlides={heroSlides}
              currentUser={currentUser}
              onSelectProduct={handleSelectProductForPurchase}
              onNavigateToWallet={() => handleSelectTab('wallet')}
              onNavigateToCatalog={(category) => {
                if (category) setSelectedCatalogCategory(category as any);
                handleSelectTab('catalog');
              }}
              onNavigateToAdminBanners={() => {
                setAdminSubTab('banners');
                setActiveTab('admin');
                window.location.hash = '#admin/banners';
              }}
            />
          ) : (
            <HomeView 
              products={products}
              heroSlides={heroSlides}
              currentUser={currentUser}
              onNavigateToAdminBanners={() => {
                setAdminSubTab('banners');
                setActiveTab('admin');
                window.location.hash = '#admin/banners';
              }}
              onSelectProduct={handleSelectProductForPurchase}
              onNavigateToWallet={() => handleSelectTab('wallet')}
              onNavigateToCatalog={() => handleSelectTab('catalog')}
            />
          )
        )}
        {activeTab === 'catalog' && (
          isPWA ? (
            <PWACatalogView
              products={products}
              currentUser={currentUser}
              onPurchaseProduct={async (product, pId) => {
                await handleCreateOrder({
                  userEmail: currentUser?.email || '',
                  userName: currentUser?.name || 'Gamer',
                  playerId: pId,
                  productId: product.id,
                  productName: product.name,
                  diamondsTotal: product.diamonds + (product.bonusDiamonds || 0),
                  priceUSD: product.priceUSD,
                  bankName: 'Billetera Virtual',
                  receiptUrl: '',
                  paymentMethod: 'wallet_balance',
                });
              }}
              onNavigateToWallet={() => handleSelectTab('wallet')}
              onOpenLogin={() => openLoginWithReason('')}
            />
          ) : (
            <div>
              <HeroBanner onSelectProductGroup={(category) => { setSelectedCatalogCategory(category); document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); }} onOpenQuickIDCheck={() => handleSelectTab('orders')} />
              {/* Smooth gradient fade between hero and catalog */}
              <div className="h-16 sm:h-24 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-transparent -mb-16 sm:-mb-24 relative z-[1] pointer-events-none" />
              <ProductCatalog products={products} onSelectProduct={handleSelectProductForPurchase} selectedCategory={selectedCatalogCategory} setSelectedCategory={setSelectedCatalogCategory} currentUser={currentUser} onOpenWalletModal={() => handleSelectTab('wallet')} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onAddProduct={handleAddProduct} />
            </div>
          )
        )}
        {activeTab === 'login' && (
          <React.Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <LoginPage 
              isPWA={isPWA}
              onLoginGoogle={handleLoginGoogle} 
              onLoginSuccess={(user) => {
                if (user?.uid) fetchUserProfile(user.uid);
              }} 
              onDirectLoginSuccess={(userId) => {
                fetchUserProfile(userId);
              }}
              onRegisterUser={() => {}} 
              redirectReason={loginRedirectReason} 
              onBackToCatalog={() => window.location.hash = '#catalog'} 
              registeredUsers={registeredUsers} 
            />
          </React.Suspense>
        )}
        {activeTab === 'wallet' && (
          currentUser ? (
            isPWA ? (
              <PWAWalletView
                currentUser={currentUser}
                bankAccounts={bankAccounts}
                walletHistory={walletHistory}
                onSubmitTopUpOrder={handleSubmitTopUpOrder}
                onNavigateToCatalog={() => handleSelectTab('catalog')}
                onPayPhoneGatewayStateChange={setIsPayPhoneGatewayActive}
              />
            ) : (
              <WalletView 
                currentUser={currentUser} 
                bankAccounts={bankAccounts} 
                walletHistory={walletHistory} 
                onSubmitTopUpOrder={handleSubmitTopUpOrder} 
                onNavigateToCatalog={() => window.location.hash = '#catalog'} 
                onPayPhoneGatewayStateChange={setIsPayPhoneGatewayActive}
              />
            )
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                <span className="text-3xl">💎</span>
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">
                Billetera TunTun
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs mb-6">
                Inicia sesión para recargar tu saldo y ver tus movimientos.
              </p>
              <button
                onClick={() => openLoginWithReason('Inicia sesión para ver tu billetera')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer active:scale-95 transition-all"
              >
                Iniciar Sesión
              </button>
            </div>
          )
        )}
        {activeTab === 'orders' && (
          isPWA ? (
            <PWAOrdersView
              orders={orders}
              currentUserEmail={currentUser?.email}
              onOpenWhatsAppSupport={(order) => {
                const phone = '593968729952';
                const msg = order 
                  ? `Hola TunTunStore, necesito soporte con mi pedido #${order.id} (${order.productName}). ID Jugador: ${order.playerId}`
                  : `Hola TunTunStore, necesito soporte con una compra.`;
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
              }}
              onNavigateToCatalog={() => handleSelectTab('catalog')}
            />
          ) : (
            <MyOrders orders={orders} currentUserEmail={currentUser?.email} onOpenWhatsAppSupport={(order) => {
              const phone = '593968729952';
              const msg = order 
                ? `Hola TunTunStore, necesito soporte con mi pedido #${order.id} (${order.productName}). ID Jugador: ${order.playerId}`
                : `Hola TunTunStore, necesito soporte con una compra.`;
              window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
            }} />
          )
        )}
        {activeTab === 'payphone-confirm' && (
          <React.Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <PayPhoneConfirmPage currentUser={currentUser} />
          </React.Suspense>
        )}
        {activeTab === 'profile' && currentUser && (
          isPWA ? (
            <PWAProfileView
              currentUser={currentUser}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
              onNavigateToWallet={() => handleSelectTab('wallet')}
            />
          ) : (
            <ProfileView currentUser={currentUser} onSaveProfile={handleSaveProfile} onLogout={handleLogout} onNavigateToWallet={() => window.location.hash = '#wallet'} />
          )
        )}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <React.Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <AdminPanel 
              orders={orders} 
              products={products} 
              registeredUsers={registeredUsers} 
              adminStats={adminStats || undefined}
              isPWA={isPWA}
              activeSubTab={adminSubTab as any} 
              onSubTabChange={(st) => window.location.hash = `#admin/${st}`} 
              onUpdateOrderStatus={handleUpdateOrderStatus} 
              onAddProduct={handleAddProduct} 
              onUpdateProduct={handleUpdateProduct} 
              onDeleteProduct={handleDeleteProduct} 
              pendingTopUps={pendingTopUps} 
              onUpdateTopUpStatus={handleUpdateTopUpStatus} 
              onUpdateTopUpAmount={handleUpdateTopUpAmount}
              onRefreshBanners={fetchInitialData}
              onLogout={handleLogout}
              onUpdateUserWalletBalance={async (email, amount, isSetExact) => {
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
            }} 
          />
          </React.Suspense>
        )}
        </React.Suspense>
        </ErrorBoundary>
      </main>
      </div>
      {selectedProductForOrder && (
        <React.Suspense fallback={null}>
          <OrderModal product={selectedProductForOrder} bankAccounts={bankAccounts} currentUser={currentUser} onClose={() => setSelectedProductForOrder(null)} onSubmitOrder={handleCreateOrder} onOpenWalletModal={() => { setSelectedProductForOrder(null); handleSelectTab('wallet'); }} />
        </React.Suspense>
      )}
      {currentUser?.role !== 'admin' && activeTab === 'home' && (
        <WhatsAppButton 
          hasBottomNav={(isPWA || !!currentUser) && !isPayPhoneGatewayActive} 
          visible={!isInstallPromptActive}
        />
      )}
      {!isPWA && activeTab !== 'login' && activeTab !== 'payphone-confirm' && (
        <Footer onSelectTab={handleSelectTab} activeTab={activeTab} />
      )}
      {!isPayPhoneGatewayActive && !selectedProductForOrder && (isPWA || currentUser) && activeTab !== 'login' && activeTab !== 'payphone-confirm' && (
        <BottomNavigation 
          activeTab={activeTab} 
          adminSubTab={adminSubTab} 
          setActiveTab={handleSelectTab} 
          pendingOrdersCount={activePendingOrdersCount} 
          currentUser={currentUser} 
          isPWA={isPWA} 
        />
      )}
      {activeTab !== 'login' && activeTab !== 'payphone-confirm' && (
        <React.Suspense fallback={null}>
          <InstallPWAPrompt 
            onVisibilityChange={setIsInstallPromptActive}
            onPromptElapsed={() => setShowPWATopBar(true)}
            openTrigger={installPromptTrigger}
          />
        </React.Suspense>
      )}
    </div>
  );
}
