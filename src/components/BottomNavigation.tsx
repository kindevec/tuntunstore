import React from 'react';
import { ShoppingBag, ClipboardList, Wallet, UserCog, Mail, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface BottomNavigationProps {
  activeTab: 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login';
  adminSubTab?: 'orders' | 'catalog' | 'email' | 'wallets';
  setActiveTab: (
    tab: 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login',
    subTab?: 'orders' | 'catalog' | 'email' | 'wallets'
  ) => void;
  pendingOrdersCount: number;
  currentUser: UserProfile | null;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  adminSubTab = 'orders',
  setActiveTab,
  pendingOrdersCount,
  currentUser,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  if (isAdmin) {
    return (
      <nav
        id="bottom-navigation-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07090e]/95 border-t border-amber-500/30 backdrop-blur-xl px-1 py-1.5 flex items-center justify-around gap-0.5 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]"
      >
        {/* Admin Tab 1: Catálogo (Permanent for everyone) */}
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'catalog'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ShoppingBag className={`w-4 h-4 ${activeTab === 'catalog' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Catálogo</span>
        </button>

        {/* Admin Tab 2: Pedidos Admin */}
        <button
          onClick={() => setActiveTab('admin', 'orders')}
          className={`relative flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'admin' && adminSubTab === 'orders'
              ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <ClipboardList className={`w-4 h-4 ${activeTab === 'admin' && adminSubTab === 'orders' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-black text-[8px] font-black px-1 py-0.2 rounded-full border border-black animate-pulse leading-none">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Pedidos</span>
        </button>

        {/* Admin Tab 3: Billeteras USD & Usuarios */}
        <button
          onClick={() => setActiveTab('admin', 'wallets')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'admin' && adminSubTab === 'wallets'
              ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Wallet className={`w-4 h-4 ${activeTab === 'admin' && adminSubTab === 'wallets' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Saldos</span>
        </button>

        {/* Admin Tab 4: CRUD Productos */}
        <button
          onClick={() => setActiveTab('admin', 'catalog')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'admin' && adminSubTab === 'catalog'
              ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'admin' && adminSubTab === 'catalog' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">CRUD</span>
        </button>

        {/* Admin Tab 5: Alertas Correo */}
        <button
          onClick={() => setActiveTab('admin', 'email')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'admin' && adminSubTab === 'email'
              ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Mail className={`w-4 h-4 ${activeTab === 'admin' && adminSubTab === 'email' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Alertas</span>
        </button>
      </nav>
    );
  }

  return (
    <nav
      id="bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07090e]/95 border-t border-emerald-500/20 backdrop-blur-xl px-1.5 py-1.5 flex items-center justify-around gap-1 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]"
    >
      {/* Tab 1: Catálogo */}
      <button
        onClick={() => setActiveTab('catalog')}
        className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer ${
          activeTab === 'catalog'
            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <ShoppingBag className={`w-4 h-4 xs:w-5 xs:h-5 ${activeTab === 'catalog' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
        <span className="text-[8.5px] xs:text-[10px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Catálogo</span>
      </button>

      {/* Tab 2: Billetera USD */}
      <button
        onClick={() => setActiveTab('wallet')}
        className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all relative cursor-pointer ${
          activeTab === 'wallet'
            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <Wallet className={`w-4 h-4 xs:w-5 xs:h-5 ${activeTab === 'wallet' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
          {currentUser && (
            <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-black text-[7px] xs:text-[8px] font-black px-1 rounded-full font-mono leading-none py-0.5 shadow-sm">
              ${(currentUser?.walletBalanceUSD ?? 0).toFixed(0)}
            </span>
          )}
        </div>
        <span className="text-[8.5px] xs:text-[10px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Billetera</span>
      </button>

      {/* Tab 3: Mis Pedidos */}
      <button
        onClick={() => setActiveTab('orders')}
        className={`relative flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer ${
          activeTab === 'orders'
            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <ClipboardList className={`w-4 h-4 xs:w-5 xs:h-5 ${activeTab === 'orders' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
          {pendingOrdersCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-amber-400 text-black text-[8px] font-black px-1 py-0.2 rounded-full border border-black animate-pulse leading-none">
              {pendingOrdersCount}
            </span>
          )}
        </div>
        <span className="text-[8.5px] xs:text-[10px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Pedidos</span>
      </button>

      {/* Tab 4: Mi Perfil */}
      {currentUser && (
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <UserCog className={`w-4 h-4 xs:w-5 xs:h-5 ${activeTab === 'profile' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
          <span className="text-[8.5px] xs:text-[10px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Perfil</span>
        </button>
      )}
    </nav>
  );
};
