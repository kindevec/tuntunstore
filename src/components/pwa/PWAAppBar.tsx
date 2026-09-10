import React from 'react';
import { UserProfile } from '../../types';
import { Wallet, Plus, Bell, LogIn, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWAAppBarProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onNavigateToWallet: () => void;
  onNavigateToProfile: () => void;
  onNavigateToOrders: () => void;
  pendingOrdersCount?: number;
  pendingTopUpsCount?: number;
}

export const PWAAppBar: React.FC<PWAAppBarProps> = ({
  currentUser,
  onOpenLogin,
  onNavigateToWallet,
  onNavigateToProfile,
  onNavigateToOrders,
  pendingOrdersCount = 0,
  pendingTopUpsCount = 0,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const totalNotifications = isAdmin ? pendingTopUpsCount + pendingOrdersCount : pendingOrdersCount;

  const firstName = currentUser?.name?.split(' ')[0] || 'Gamer';
  const balanceUSD = currentUser?.walletBalanceUSD ?? 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#05140f]/92 backdrop-blur-xl border-b border-emerald-500/20 pt-[env(safe-area-inset-top,0px)] shadow-[0_4px_20px_rgba(0,0,0,0.6)] select-none">
      <div className="h-14 px-3.5 flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Lado Izquierdo: Avatar + Saludo o Logo */}
        {currentUser ? (
          <div
            onClick={() => {
              triggerHaptic('light');
              onNavigateToProfile();
            }}
            className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform min-w-0"
            role="button"
            tabIndex={0}
          >
            {/* Avatar con aro de nivel */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] shadow-[0_0_10px_rgba(16,185,129,0.35)]">
                <img
                  src={currentUser.avatar || '/logo-transparent.webp'}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover bg-[#07090e]"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#05140f]" />
            </div>

            {/* Texto de Saludo y Rango */}
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-white text-xs font-black tracking-tight truncate leading-tight">
                  Hola, {firstName}
                </span>
                {isAdmin ? (
                  <span className="text-[8px] bg-amber-400 text-black font-black px-1.5 py-0.2 rounded-full uppercase leading-none">
                    Admin
                  </span>
                ) : (
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-emerald-400/80 text-[10px] font-mono leading-tight mt-0.5 truncate">
                {currentUser.playerIdDefault ? `ID: ${currentUser.playerIdDefault}` : 'Free Fire Gamer'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center shadow-sm">
              <img src="/logo-transparent.webp" alt="TunTun Store" className="w-6 h-6 object-contain drop-shadow" />
            </div>
            <div>
              <span className="text-white text-xs font-black tracking-tight uppercase leading-tight block">
                TunTun Store
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block leading-tight">
                App Oficial Ecuador
              </span>
            </div>
          </div>
        )}

        {/* Lado Derecho: Chip de Saldo + Notificaciones / Botón Login */}
        <div className="flex items-center gap-1.5 shrink-0">
          {currentUser ? (
            <>
              {/* Chip de Saldo Billetera USD interactivo */}
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onNavigateToWallet();
                }}
                className="h-8 pl-2 pr-1.5 rounded-full bg-gradient-to-r from-emerald-950/90 to-[#03241b] border border-emerald-500/40 hover:border-emerald-400 text-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)] active:scale-95 transition-all cursor-pointer"
                title="Ver saldo y recargar billetera"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-left leading-none pr-0.5">
                  <span className="text-[11px] font-mono font-black text-emerald-300">
                    ${balanceUSD.toFixed(2)}
                  </span>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shrink-0 transition-colors shadow-sm">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </div>
              </button>

              {/* Botón de Notificaciones si hay pedidos pendientes */}
              {totalNotifications > 0 && (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    onNavigateToOrders();
                  }}
                  className="relative w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                  aria-label="Ver notificaciones"
                >
                  <Bell className="w-4 h-4 text-amber-300" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center border border-[#05140f] animate-pulse">
                    {totalNotifications}
                  </span>
                </button>
              )}
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
