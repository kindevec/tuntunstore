import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  ShieldCheck, 
  ShoppingBag, 
  User, 
  LogOut, 
  Sparkles, 
  ChevronDown, 
  Gamepad2,
  CheckCircle2,
  UserCog,
  Wallet,
  Plus,
  LogIn,
  Clock,
  Mail,
  DollarSign
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile | null;
  onLoginGoogle: (role: 'client' | 'admin') => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  activeTab: 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login';
  adminSubTab?: 'orders' | 'catalog' | 'email' | 'wallets';
  setActiveTab: (
    tab: 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login',
    subTab?: 'orders' | 'catalog' | 'email' | 'wallets'
  ) => void;
  pendingOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLoginGoogle,
  onLogout,
  onOpenLoginModal,
  activeTab,
  adminSubTab = 'orders',
  setActiveTab,
  pendingOrdersCount,
}) => {
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header id="header-main" className="sticky top-0 z-40 bg-black/80 backdrop-blur-md text-white border-b border-emerald-900/40 shadow-2xl">
      {/* Top Banner Notice - Hidden on mobile as explicitly requested */}
      <div id="header-top-bar" className="hidden md:flex bg-[#030914] px-4 py-1.5 text-[11px] text-center border-b border-emerald-900/30 items-center justify-center gap-3 font-bold tracking-wider uppercase text-zinc-300">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
        <span>Estamos activos por el Contacto: <strong className="text-white">+593 99 008 4680</strong> ⚠️ Verificá la información.</span>
        <span className="inline-block text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded text-[10px] border border-emerald-500/30 font-black">
          🟢 ACREDITACIÓN INSTANTÁNEA ECUADOR
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-4">
          {/* Logo Brand */}
          <div 
            id="brand-logo" 
            onClick={() => setActiveTab('catalog')} 
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group shrink-0"
          >
            <img 
              src="/logo-transparent.png" 
              alt="TunTun Store Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform"
            />
            <div>
              <span className="text-lg sm:text-2xl font-black tracking-tighter text-white">
                TUNTUN<span className="text-emerald-500 italic">STORE</span>
              </span>
            </div>
          </div>

          {/* Center Navigation - Catálogo y Mis Pedidos para Cliente / Catálogo y Admin para Administrador */}
          <nav id="main-navigation" className="hidden md:flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-white/10">
            {/* Permanent Catalog tab */}
            <button
              id="nav-btn-catalog"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              Catálogo
            </button>

            {isAdmin ? (
              <button
                id="nav-btn-admin"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
                {pendingOrdersCount > 0 && (
                  <span className="bg-amber-400 text-black font-black text-[10px] px-1.5 rounded-full animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            ) : (
              currentUser && (
                <button
                  id="nav-btn-orders"
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all relative cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Mis Pedidos
                  {pendingOrdersCount > 0 && (
                    <span className="bg-amber-400 text-black font-black text-[10px] px-1.5 rounded-full animate-pulse">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
              )
            )}
          </nav>

          {/* User Google Auth Area */}
          <div id="user-auth-section" className="relative flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Balance Badge Pill or Admin Mode Indicator */}
            {isAdmin ? (
              <button
                onClick={() => setActiveTab('admin', 'wallets')}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)] transition-all cursor-pointer"
                title="Ir a Gestión de Billeteras y Usuarios"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider hidden xs:inline">
                  PANEL ADMIN
                </span>
              </button>
            ) : currentUser ? (
              <button
                onClick={() => setActiveTab('wallet')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all cursor-pointer group"
                title="Ir a la página de Billetera Virtual y Recargar Saldo"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/40 group-hover:scale-110 transition-transform shrink-0">
                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="text-right leading-none">
                  <span className="hidden xs:block text-[8px] sm:text-[9px] uppercase font-black text-emerald-400/90 tracking-wider">Balance</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-300 font-mono">
                    ${(currentUser?.walletBalanceUSD ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-emerald-500 text-black flex items-center justify-center font-black text-xs shadow-sm shrink-0">
                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                </div>
              </button>
            ) : null}

            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowAuthMenu(!showAuthMenu)}
                  className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 sm:pl-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all text-left cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-2 ring-emerald-500/50 shrink-0"
                  />
                  <div className="hidden sm:block leading-tight">
                    <p className="text-xs font-bold text-white line-clamp-1">{currentUser.name}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                      {isAdmin ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                          ⭐ Administrador
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Cliente Google
                        </span>
                      )}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
                </button>

                {/* Dropdown menu */}
                {showAuthMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                      <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Sesión verificada con Google
                      </p>
                    </div>

                    <div className="space-y-1">
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => {
                              setShowAuthMenu(false);
                              setActiveTab('admin', 'orders');
                            }}
                            className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 font-bold border border-amber-500/30 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              Gestión de Pedidos
                            </span>
                            {pendingOrdersCount > 0 && (
                              <span className="bg-amber-400 text-black font-black text-[10px] px-1.5 py-0.2 rounded-full">
                                {pendingOrdersCount}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setShowAuthMenu(false);
                              setActiveTab('admin', 'wallets');
                            }}
                            className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                            Billeteras USD & Usuarios
                          </button>

                          <button
                            onClick={() => {
                              setShowAuthMenu(false);
                              setActiveTab('admin', 'catalog');
                            }}
                            className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            CRUD de Catálogo
                          </button>

                          <button
                            onClick={() => {
                              setShowAuthMenu(false);
                              setActiveTab('admin', 'email');
                            }}
                            className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-amber-400" />
                            Alertas por Correo
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setShowAuthMenu(false);
                              setActiveTab('wallet');
                            }}
                            className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-500/30 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                              Página Billetera USD
                            </span>
                            <span className="text-[11px] font-black font-mono text-emerald-400">
                              ${(currentUser.walletBalanceUSD || 0).toFixed(2)}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setShowAuthMenu(false);
                              setActiveTab('profile');
                            }}
                            className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors cursor-pointer"
                          >
                            <UserCog className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Página Mi Perfil</span>
                          </button>
                        </>
                      )}

                      <div className="my-1 border-t border-zinc-800"></div>

                      <button
                        onClick={() => {
                          onLoginGoogle('client');
                          setShowAuthMenu(false);
                          setActiveTab('catalog');
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                          currentUser.role === 'client'
                            ? 'bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/40'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          Modo Cliente ({currentUser.name.split(' ')[0]})
                        </span>
                        {currentUser.role === 'client' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>

                      <button
                        onClick={() => {
                          onLoginGoogle('admin');
                          setShowAuthMenu(false);
                          setActiveTab('admin', 'orders');
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                          currentUser.role === 'admin'
                            ? 'bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/40'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          Modo Administrador
                        </span>
                        {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </button>

                      <div className="my-1 border-t border-zinc-800"></div>

                      <button
                        onClick={() => {
                          onLogout();
                          setShowAuthMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="site-login-btn"
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all active:scale-95 border border-emerald-300 cursor-pointer whitespace-nowrap uppercase tracking-wider"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Iniciar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};
