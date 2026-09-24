import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { Wallet, Plus, Bell, LogIn, Sparkles, LogOut, UserCog, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWAAppBarProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onNavigateToWallet: () => void;
  onNavigateToProfile: () => void;
  onNavigateToOrders: () => void;
  onNavigateToHome?: () => void;
  onNavigateToAdmin?: () => void;
  onLogout?: () => void;
  pendingOrdersCount?: number;
  pendingTopUpsCount?: number;
}

export const PWAAppBar: React.FC<PWAAppBarProps> = ({
  currentUser,
  onOpenLogin,
  onNavigateToWallet,
  onNavigateToProfile,
  onNavigateToOrders,
  onNavigateToHome,
  onNavigateToAdmin,
  onLogout,
  pendingOrdersCount = 0,
  pendingTopUpsCount = 0,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const totalNotifications = isAdmin ? pendingTopUpsCount + pendingOrdersCount : pendingOrdersCount;

  const firstName = currentUser?.name?.split(' ')[0] || 'Gamer';
  const balanceUSD = currentUser?.walletBalanceUSD ?? 0;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú con cualquier interacción fuera de él (click, touch, scroll)
  useEffect(() => {
    if (!showUserMenu) return;

    const handleInteractionOutside = (event: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleScroll = () => {
      setShowUserMenu(false);
    };

    document.addEventListener('mousedown', handleInteractionOutside);
    document.addEventListener('touchstart', handleInteractionOutside, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleInteractionOutside);
      document.removeEventListener('touchstart', handleInteractionOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showUserMenu]);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#05140f]/92 backdrop-blur-xl border-b border-emerald-500/20 pt-[env(safe-area-inset-top,0px)] shadow-[0_4px_20px_rgba(0,0,0,0.6)] select-none">
      <div className="h-16 px-3.5 flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Lado Izquierdo: Solo el Logo Oficial de TunTun Store ocupando el alto vertical */}
        <div
          onClick={() => {
            triggerHaptic('light');
            onNavigateToHome?.();
          }}
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform min-w-0 h-full py-1"
          role="button"
          tabIndex={0}
          title="Ir a Inicio"
        >
          <img 
            src="/logo-transparent.webp" 
            alt="TunTun Store" 
            className="h-12 sm:h-13 w-auto max-h-14 object-contain drop-shadow-[0_0_14px_rgba(16,185,129,0.6)] shrink-0" 
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white text-base sm:text-lg font-black tracking-tight uppercase leading-tight">
                TUNTUN<span className="text-emerald-400 italic">STORE</span>
              </span>
              {isAdmin && (
                <span className="text-[8px] bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black px-1.5 py-0.2 rounded-full uppercase leading-none shadow-sm shrink-0">
                  Admin
                </span>
              )}
            </div>
            <p className="leading-tight mt-0.5 truncate">
              {isAdmin ? (
                <span className="text-amber-400/80 font-bold text-[8.5px] sm:text-[9px] uppercase tracking-wider block">
                  Modo Administrador
                </span>
              ) : currentUser ? (
                <span className="text-emerald-400/80 text-[10.5px] font-semibold">Hola, {firstName}</span>
              ) : (
                <span className="text-emerald-400/80 text-[10.5px] font-semibold">App Oficial Ecuador</span>
              )}
            </p>
          </div>
        </div>

        {/* Lado Derecho: Acciones según ROL (Admin vs Cliente) + Avatar / Botón Login */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <>
              {isAdmin ? (
                <>
                  {/* Campana de Notificaciones Administrativas (pedidos + comprobantes por revisar) */}
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onNavigateToOrders();
                    }}
                    className="relative w-10 h-10 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer border border-zinc-700/60 shadow-md"
                    aria-label="Ver pedidos y recargas pendientes"
                    title={totalNotifications > 0 ? `${totalNotifications} tareas pendientes por revisar` : 'Sin tareas pendientes'}
                  >
                    <Bell className="w-5 h-5 text-amber-300" />
                    {totalNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-amber-400 text-black text-[9.5px] font-black flex items-center justify-center border border-[#05140f] animate-pulse shadow-sm">
                        {totalNotifications}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Para clientes normales: Botón Saldo Billetera USD interactivo */}
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      onNavigateToWallet();
                    }}
                    className="h-9 pl-2.5 pr-2 rounded-full bg-gradient-to-r from-emerald-950/90 to-[#03241b] border border-emerald-500/40 hover:border-emerald-400 text-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)] active:scale-95 transition-all cursor-pointer"
                    title="Ver saldo y recargar billetera"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-left leading-none pr-0.5">
                      <span className="text-xs font-mono font-black text-emerald-300">
                        ${balanceUSD.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shrink-0 transition-colors shadow-sm">
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>

                  {/* Botón de Notificaciones del cliente si tiene pedidos pendientes */}
                  {totalNotifications > 0 && (
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        onNavigateToOrders();
                      }}
                      className="relative w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                      aria-label="Ver notificaciones de pedidos"
                    >
                      <Bell className="w-5 h-5 text-emerald-300" />
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-emerald-400 text-black text-[9.5px] font-black flex items-center justify-center border border-[#05140f] animate-pulse shadow-sm">
                        {totalNotifications}
                      </span>
                    </button>
                  )}
                </>
              )}

              {/* Avatar de Usuario -> Menú de Usuario con Cerrar Sesión */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    setShowUserMenu((prev) => !prev);
                  }}
                  className={`relative z-[60] w-10 h-10 rounded-full p-[2px] shrink-0 cursor-pointer active:scale-90 transition-transform ${
                    isAdmin
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-[0_0_14px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/50'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                  }`}
                  title={isAdmin ? 'Opciones de Administrador' : 'Opciones de cuenta'}
                  aria-label="Perfil y opciones de cuenta"
                  aria-expanded={showUserMenu}
                >
                  <img
                    src={currentUser.avatar || '/logo-transparent.webp'}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover bg-[#07090e]"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#05140f] ${
                      isAdmin ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                </button>

                {/* Menú Desplegable Flotante */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserMenu(false);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowUserMenu(false);
                      }}
                    />
                    <div
                      className={`absolute right-0 top-12 mt-1.5 w-60 rounded-2xl border p-2 z-[60] shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 ${
                        isAdmin
                          ? 'bg-[#090b0e]/95 border-amber-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.8)]'
                          : 'bg-[#061510]/95 border-emerald-500/35 shadow-[0_12px_40px_rgba(0,0,0,0.8)]'
                      }`}
                    >
                      {/* Info Usuario */}
                      <div className="px-3 py-2.5 border-b border-white/10 mb-1.5 bg-white/5 rounded-xl">
                        <p className="text-xs font-black text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{currentUser.email}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {isAdmin ? (
                            <span className="text-[8.5px] bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Administrador
                            </span>
                          ) : (
                            <span className="text-[8.5px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Gamer Verificado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Opciones */}
                      <div className="space-y-1">
                        {isAdmin ? (
                          <>
                            {onNavigateToAdmin && (
                              <button
                                onClick={() => {
                                  triggerHaptic('light');
                                  setShowUserMenu(false);
                                  onNavigateToAdmin();
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-2 transition-colors cursor-pointer active:scale-95"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                <span>Panel Administrador</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                triggerHaptic('light');
                                setShowUserMenu(false);
                                onNavigateToProfile();
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-zinc-200 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 flex items-center gap-2 transition-colors cursor-pointer active:scale-95"
                            >
                              <UserCog className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Mi Perfil</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                triggerHaptic('light');
                                setShowUserMenu(false);
                                onNavigateToWallet();
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-between transition-colors cursor-pointer active:scale-95"
                            >
                              <span className="flex items-center gap-2">
                                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Billetera USD</span>
                              </span>
                              <span className="font-mono font-black text-emerald-400 text-[11px]">
                                ${balanceUSD.toFixed(2)}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                triggerHaptic('light');
                                setShowUserMenu(false);
                                onNavigateToOrders();
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-zinc-200 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 flex items-center gap-2 transition-colors cursor-pointer active:scale-95"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Mis Pedidos</span>
                            </button>

                            <button
                              onClick={() => {
                                triggerHaptic('light');
                                setShowUserMenu(false);
                                onNavigateToProfile();
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-zinc-200 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 flex items-center gap-2 transition-colors cursor-pointer active:scale-95"
                            >
                              <UserCog className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Mi Perfil</span>
                            </button>
                          </>
                        )}

                        {onLogout && (
                          <button
                            onClick={() => {
                              triggerHaptic('medium');
                              setShowUserMenu(false);
                              if (window.confirm('¿Deseas cerrar tu sesión?')) {
                                onLogout();
                              }
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-2 transition-colors cursor-pointer active:scale-95"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Cerrar Sesión</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenLogin();
              }}
              className="h-8 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
