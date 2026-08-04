import React, { useState } from 'react';
import { Product, BankAccount, Order, UserProfile, OrderStatus, EmailAlertConfig, ProductCategory } from './types';
import { 
  INITIAL_PRODUCTS, 
  BANK_ACCOUNTS, 
  INITIAL_ORDERS, 
  DEFAULT_USER_CLIENT, 
  DEFAULT_USER_ADMIN,
  INITIAL_EMAIL_CONFIG 
} from './data/mockData';

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
  // State Persistence Initialization
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('tuntun_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [DEFAULT_USER_CLIENT, DEFAULT_USER_ADMIN];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('tuntun_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('tuntun_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  const saveProductsToStorage = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem('tuntun_products', JSON.stringify(updatedProducts));
    } catch (e) {
      console.error(e);
    }
  };

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('tuntun_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ORDERS;
  });

  const [bankAccounts] = useState<BankAccount[]>(BANK_ACCOUNTS);
  const [emailConfig, setEmailConfig] = useState<EmailAlertConfig>(INITIAL_EMAIL_CONFIG);

  // Sync state to localStorage whenever changed
  const saveUsersToStorage = (updatedUsers: UserProfile[]) => {
    setRegisteredUsers(updatedUsers);
    try {
      localStorage.setItem('tuntun_users', JSON.stringify(updatedUsers));
    } catch (e) {
      console.error(e);
    }
  };

  const saveOrdersToStorage = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    try {
      localStorage.setItem('tuntun_orders', JSON.stringify(updatedOrders));
    } catch (e) {
      console.error(e);
    }
  };

  const updateCurrentActiveUser = (user: UserProfile | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem('tuntun_current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('tuntun_current_user');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to update a user's wallet balance reliably across registeredUsers & currentUser
  const updateUserWalletBalance = (email: string, deltaAmount: number, isSetExact: boolean = false) => {
    let newBalanceForCurrent = 0;

    const nextUsers = registeredUsers.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const updatedVal = isSetExact ? deltaAmount : (u.walletBalanceUSD || 0) + deltaAmount;
        const clampedVal = Math.max(0, updatedVal);
        if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
          newBalanceForCurrent = clampedVal;
        }
        return { ...u, walletBalanceUSD: clampedVal };
      }
      return u;
    });

    saveUsersToStorage(nextUsers);

    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
      const updatedCurr = { ...currentUser, walletBalanceUSD: newBalanceForCurrent };
      updateCurrentActiveUser(updatedCurr);
    }
  };

  // Login Page State & Reason
  const [loginRedirectReason, setLoginRedirectReason] = useState<string | null>(null);

  // Navigation State - Pages are independent
  const [activeTab, setActiveTab] = useState<'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login'>('catalog');
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'catalog' | 'email' | 'wallets'>('orders');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<ProductCategory | 'all'>('all');

  // Active Order Flow Modal
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);

  // Success Toast Message State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const openLoginWithReason = (reason: string) => {
    setLoginRedirectReason(reason);
    setActiveTab('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Handling
  const handleLoginGoogle = (role: 'client' | 'admin') => {
    const targetEmail = role === 'admin' ? DEFAULT_USER_ADMIN.email : DEFAULT_USER_CLIENT.email;
    const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase());

    if (role === 'admin') {
      const adminUser = existingUser || DEFAULT_USER_ADMIN;
      updateCurrentActiveUser(adminUser);
      setActiveTab('admin');
      showToast(`⚡ Sesión iniciada como Administrador (${adminUser.email})`);
    } else {
      const clientUser = existingUser || DEFAULT_USER_CLIENT;
      updateCurrentActiveUser(clientUser);
      setActiveTab('catalog');
      showToast(`👋 Sesión iniciada como ${clientUser.name}`);
    }
  };

  const handleRegisterUser = (name: string, email: string, playerId?: string) => {
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      updateCurrentActiveUser(existing);
      setActiveTab('catalog');
      showToast(`👋 Bienvenid@ de nuevo, ${existing.name}`);
      return;
    }

    const newUser: UserProfile = {
      uid: `user-${Date.now()}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
      role: 'client',
      walletBalanceUSD: 0,
      playerIdDefault: playerId || undefined,
    };
    const updatedList = [...registeredUsers, newUser];
    saveUsersToStorage(updatedList);
    updateCurrentActiveUser(newUser);
    setActiveTab('catalog');
    showToast(`🎉 ¡Cuenta creada con éxito! Bienvenido ${newUser.name}`);
  };

  const handleLogout = () => {
    updateCurrentActiveUser(null);
    setActiveTab('catalog');
    showToast('Sesión cerrada correctamente');
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    updateCurrentActiveUser(updatedProfile);
    const updatedList = registeredUsers.map((u) => (u.email === updatedProfile.email ? updatedProfile : u));
    saveUsersToStorage(updatedList);
    showToast('✨ Perfil personalizado guardado exitosamente');
  };

  // Protected Tab Navigation & Admin Routing
  const handleSelectTab = (
    tab: 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login',
    subTab?: 'orders' | 'catalog' | 'email' | 'wallets'
  ) => {
    if (subTab) {
      setAdminSubTab(subTab);
    }

    if (currentUser?.role === 'admin') {
      if (tab === 'orders') {
        setAdminSubTab('orders');
        setActiveTab('admin');
        return;
      }
      if (tab === 'wallet') {
        setAdminSubTab('wallets');
        setActiveTab('admin');
        return;
      }
      if (tab === 'profile') {
        setActiveTab('admin');
        return;
      }
    } else {
      if (tab === 'orders') {
        if (!currentUser) {
          openLoginWithReason('Inicia sesión con Google para ver y realizar seguimiento a tus pedidos.');
          return;
        }
      } else if (tab === 'wallet') {
        if (!currentUser) {
          openLoginWithReason('Inicia sesión con Google para acceder a tu Billetera Virtual y recargar saldo USD.');
          return;
        }
      } else if (tab === 'profile') {
        if (!currentUser) {
          openLoginWithReason('Inicia sesión con Google para acceder a la página de tu perfil de usuario.');
          return;
        }
      } else if (tab === 'admin') {
        if (!currentUser) {
          openLoginWithReason('Acceso reservado únicamente para Administradores de TunTun Store.');
          return;
        } else if (currentUser.role !== 'admin') {
          openLoginWithReason('El Panel de Administración es exclusivo para el equipo de TunTun Store.');
          return;
        }
      }
    }
    setActiveTab(tab);
  };

  // Protected Product Purchase Selection
  const handleSelectProductForPurchase = (product: Product) => {
    if (!currentUser) {
      openLoginWithReason('Para realizar tu recarga de diamantes por ID, inicia sesión con Google primero.');
      return;
    }
    setSelectedProductForOrder(product);
  };

  // Wallet Top-Up Handlers
  const handleTopUpInstant = (amount: number) => {
    if (!currentUser) return;
    
    // Update user balance in state and storage
    updateUserWalletBalance(currentUser.email, amount);

    const updatedUser = registeredUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    const newBalance = (updatedUser?.walletBalanceUSD || (currentUser.walletBalanceUSD || 0)) + amount;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const topUpId = `REC-${Math.floor(10000 + Math.random() * 90000)}`;

    const topUpOrder: Order = {
      id: topUpId,
      date: nowStr,
      userEmail: currentUser.email,
      userName: currentUser.name,
      playerId: currentUser.playerIdDefault || 'N/A',
      playerTag: 'Recarga Inmediata Saldo USD',
      productId: 'wallet-topup',
      productName: `Recarga de Saldo USD ($${amount.toFixed(2)})`,
      diamondsTotal: 0,
      priceUSD: amount,
      bankName: 'Acreditación Directa',
      receiptUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      receiptFileName: 'recarga_instantanea.png',
      status: 'Completado',
      paymentMethod: 'bank_transfer',
      isWalletTopUp: true,
      statusHistory: [
        {
          status: 'Completado',
          timestamp: nowStr,
          note: `Acreditación inmediata de $${amount.toFixed(2)} USD efectuada. Nuevo saldo: $${newBalance.toFixed(2)} USD.`,
        },
      ],
    };

    saveOrdersToStorage([topUpOrder, ...orders]);
    showToast(`💰 ¡Se acreditaron $${amount.toFixed(2)} USD a tu Billetera! Saldo actual: $${newBalance.toFixed(2)} USD.`);
  };

  const handleSubmitTopUpOrder = (topUpOrder: Order) => {
    saveOrdersToStorage([topUpOrder, ...orders]);
    showToast(`📩 Solicitud de recarga por $${topUpOrder.priceUSD.toFixed(2)} USD registrada. Pendiente de aprobación.`);
  };

  // Submit Order Workflow
  const handleCreateOrder = (newOrderData: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>) => {
    const newId = `TTS-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const isPaidWithWallet = newOrderData.paymentMethod === 'wallet_balance';

    // Deduct balance if paid with wallet
    if (isPaidWithWallet && currentUser) {
      updateUserWalletBalance(currentUser.email, -newOrderData.priceUSD);
    }

    const newOrder: Order = {
      ...newOrderData,
      id: newId,
      date: nowStr,
      status: isPaidWithWallet ? 'En proceso' : 'Pendiente',
      statusHistory: [
        {
          status: isPaidWithWallet ? 'En proceso' : 'Pendiente',
          timestamp: nowStr,
          note: isPaidWithWallet
            ? `Pago realizado con Saldo Billetera USD ($${newOrderData.priceUSD.toFixed(2)}). Orden enviada a carga automática por ID.`
            : 'Pedido registrado por cliente con comprobante bancario. En espera de verificación.',
        },
      ],
    };

    saveOrdersToStorage([newOrder, ...orders]);
    setSelectedProductForOrder(null);
    setActiveTab('orders');

    if (isPaidWithWallet) {
      showToast(`⚡ ¡Pedido #${newId} pagado con Saldo Billetera! Tu recarga de diamantes está en proceso.`);
    } else {
      showToast(`🎉 ¡Pedido #${newId} registrado exitosamente! Redirigiendo a Mis Pedidos.`);
    }
  };

  // Admin Order Status Update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const targetOrder = orders.find((o) => o.id === orderId);

    // If order was a wallet top-up and is being marked as Completed, credit user balance!
    if (targetOrder && targetOrder.isWalletTopUp && newStatus === 'Completado' && targetOrder.status !== 'Completado') {
      updateUserWalletBalance(targetOrder.userEmail, targetOrder.priceUSD);
    }

    const nextOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          statusHistory: [
            ...o.statusHistory,
            {
              status: newStatus,
              timestamp: nowStr,
              note: note || `Estado actualizado a ${newStatus}.`,
            },
          ],
        };
      }
      return o;
    });

    saveOrdersToStorage(nextOrders);
    showToast(`Estado del pedido #${orderId} actualizado a "${newStatus}"`);
  };

  // Catalog CRUD Operations
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
    };
    saveProductsToStorage([...products, created]);
    showToast(`✅ Producto "${created.name}" añadido al catálogo.`);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    saveProductsToStorage(updated);
    showToast(`✏️ Producto "${updatedProduct.name}" actualizado (Precio: $${updatedProduct.priceUSD.toFixed(2)} USD).`);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    saveProductsToStorage(updated);
    showToast('🗑️ Producto eliminado del catálogo.');
  };

  // Pending order count for current client
  const activePendingOrdersCount = orders.filter((o) => o.status === 'Pendiente' || o.status === 'En proceso').length;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div id="toast-notification-bar" className="fixed top-20 right-4 z-50 bg-zinc-950 text-white border-2 border-emerald-500 px-5 py-3.5 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-300">{toastMessage}</p>
        </div>
      )}

      {/* Main Header (Hidden on dedicated Login Page) */}
      {activeTab !== 'login' && (
        <Header
          currentUser={currentUser}
          onLoginGoogle={handleLoginGoogle}
          onLogout={handleLogout}
          onOpenLoginModal={() => {
            setLoginRedirectReason(null);
            setActiveTab('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeTab={activeTab}
          adminSubTab={adminSubTab}
          setActiveTab={handleSelectTab}
          pendingOrdersCount={activePendingOrdersCount}
        />
      )}

      {/* Main App Content View - All independent full-page sections */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* VIEW 1: CATALOG (Main Landing & Storefront) */}
        {activeTab === 'catalog' && (
          <div>
            <HeroBanner
              onSelectProductGroup={(category) => {
                setSelectedCatalogCategory(category);
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenQuickIDCheck={() => handleSelectTab('orders')}
            />

            <ProductCatalog
              products={products}
              onSelectProduct={handleSelectProductForPurchase}
              selectedCategory={selectedCatalogCategory}
              setSelectedCategory={setSelectedCatalogCategory}
              currentUser={currentUser}
              onOpenWalletModal={() => handleSelectTab('wallet')}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddProduct={handleAddProduct}
            />
          </div>
        )}

        {/* VIEW: FULL DEDICATED LOGIN / REGISTER PAGE */}
        {activeTab === 'login' && (
          <LoginPage
            onLoginGoogle={handleLoginGoogle}
            onLoginSuccess={(user) => {
              updateCurrentActiveUser(user);
              setActiveTab('catalog');
              showToast(`👋 Bienvenid@ de nuevo, ${user.name}`);
            }}
            onRegisterUser={handleRegisterUser}
            redirectReason={loginRedirectReason}
            onBackToCatalog={() => setActiveTab('catalog')}
            registeredUsers={registeredUsers}
          />
        )}

        {/* VIEW 2: VIRTUAL WALLET PAGE */}
        {activeTab === 'wallet' && currentUser && (
          <WalletView
            currentUser={currentUser}
            bankAccounts={bankAccounts}
            userOrders={orders.filter((o) => o.userEmail === currentUser.email)}
            onTopUpInstant={handleTopUpInstant}
            onSubmitTopUpOrder={handleSubmitTopUpOrder}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {/* VIEW 3: MY ORDERS (Client Tracking) */}
        {activeTab === 'orders' && (
          <MyOrders
            orders={orders}
            currentUserEmail={currentUser?.email}
            onOpenWhatsAppSupport={(order) => {
              const msg = order
                ? `¡Hola TunTun Store! Necesito soporte con mi pedido de recarga #${order.id} (ID Jugador: ${order.playerId}).`
                : '¡Hola TunTun Store! Quisiera realizar una consulta sobre una recarga de diamantes.';
              const encoded = encodeURIComponent(msg);
              window.open(`https://wa.me/593990084680?text=${encoded}`, '_blank');
            }}
          />
        )}

        {/* VIEW 4: USER PROFILE PAGE */}
        {activeTab === 'profile' && currentUser && (
          <ProfileView
            currentUser={currentUser}
            onSaveProfile={handleSaveProfile}
            onLogout={handleLogout}
            onNavigateToWallet={() => setActiveTab('wallet')}
          />
        )}

        {/* VIEW 5: ADMIN PANEL */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel
            orders={orders}
            products={products}
            emailConfig={emailConfig}
            registeredUsers={registeredUsers}
            activeSubTab={adminSubTab}
            onSubTabChange={setAdminSubTab}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateEmailConfig={setEmailConfig}
            onUpdateUserWalletBalance={(email, amount, isSetExact) => {
              updateUserWalletBalance(email, amount, isSetExact);
              showToast(`💰 Saldo de usuario (${email}) actualizado con éxito`);
            }}
          />
        )}
      </main>

      {/* Order Purchase Modal (Step-by-step with bank & receipt upload & wallet payment) */}
      <OrderModal
        product={selectedProductForOrder}
        bankAccounts={bankAccounts}
        currentUser={currentUser}
        onClose={() => setSelectedProductForOrder(null)}
        onSubmitOrder={handleCreateOrder}
        onOpenWalletModal={() => {
          setSelectedProductForOrder(null);
          handleSelectTab('wallet');
        }}
      />

      {/* Floating WhatsApp Support Button (Visible only on client view, hidden on admin panel) */}
      {activeTab !== 'admin' && (
        <WhatsAppButton hasBottomNav={!!currentUser && activeTab !== 'login'} />
      )}

      {/* Global Footer (Hidden on dedicated Login Page) */}
      {activeTab !== 'login' && <Footer onSelectTab={handleSelectTab} />}

      {/* Mobile Sticky Bottom Navigation Bar (Visible only when user is logged in and not on login page) */}
      {currentUser && activeTab !== 'login' && (
        <BottomNavigation
          activeTab={activeTab}
          adminSubTab={adminSubTab}
          setActiveTab={handleSelectTab}
          pendingOrdersCount={activePendingOrdersCount}
          currentUser={currentUser}
        />
      )}

    </div>
  );
}
