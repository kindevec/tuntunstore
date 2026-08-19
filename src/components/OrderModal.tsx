import React, { useState } from 'react';
import { Product, BankAccount, UserProfile, Order } from '../types';
import { DiamondIcon } from './DiamondIcon';
import { 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Wallet,
  CheckCircle2,
  Ban
} from 'lucide-react';

interface OrderModalProps {
  product: Product | null;
  bankAccounts: BankAccount[]; // Kept for compatibility with App.tsx
  currentUser: UserProfile | null;
  onClose: () => void;
  onOpenWalletModal?: () => void;
  onSubmitOrder: (newOrder: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>, receiptFile?: File) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  currentUser,
  onClose,
  onOpenWalletModal,
  onSubmitOrder,
}) => {
  if (!product) return null;

  const userBalance = currentUser?.walletBalanceUSD || 0;
  const isBlocked = !!currentUser?.isBlocked;
  const hasEnoughBalance = userBalance >= product.priceUSD && !isBlocked;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGoldStyle = product.isGoldPromo || product.category === 'memberships';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      setErrorMessage('Tu cuenta ha sido inhabilitada por administración para realizar compras.');
      return;
    }
    if (!hasEnoughBalance) {
      setErrorMessage('Saldo insuficiente en tu Billetera Virtual.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    onSubmitOrder({
      userEmail: currentUser?.email || 'invitado@tuntunstore.com',
      userName: currentUser?.name || 'Cliente Jugador',
      playerId: currentUser?.playerIdDefault || 'N/A',
      playerTag: currentUser?.gamerTag || undefined,
      productId: product.id,
      productName: product.name,
      diamondsTotal: product.diamonds + (product.bonusDiamonds || 0),
      priceUSD: product.priceUSD,
      bankName: 'Saldo TunTun USD',
      receiptUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      receiptFileName: 'pago_saldo_tuntun.png',
      paymentMethod: 'wallet_balance',
    });
  };

  return (
    <div id="order-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div 
        id="order-modal-container"
        className="relative w-full max-w-lg bg-zinc-950 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden border border-emerald-500/30 text-white flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-emerald-900/40 bg-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 sm:p-2 rounded-xl ${isGoldStyle ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black'}`}>
              <DiamondIcon size="sm" variant={isGoldStyle ? 'gold' : 'emerald'} />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] text-emerald-400 font-black uppercase tracking-widest">Confirmación de Compra</p>
              <h2 className="text-sm sm:text-base font-black uppercase text-white truncate max-w-[220px] sm:max-w-none">
                {product.name} (${product.priceUSD.toFixed(2)})
              </h2>
            </div>
          </div>

          <button
            id="order-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-black uppercase flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {/* Blocked Account Warning */}
          {isBlocked && (
            <div className="p-4 bg-rose-950/70 border border-rose-500/70 rounded-2xl text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-black uppercase text-rose-400">
                <Ban className="w-4 h-4" />
                <span>Cuenta Inhabilitada para Compras</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Tu cuenta tiene restringida la adquisición de productos por decisión de la administración. Para solicitar asistencia o resolver inquietudes sobre tu cuenta, por favor contacta al soporte vía WhatsApp.
              </p>
            </div>
          )}

          {/* Product Summary Box */}
          <div className="p-4 rounded-2xl bg-black border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Paquete Seleccionado</span>
              <h3 className="font-black text-base sm:text-lg text-white uppercase">{product.name}</h3>
              <p className="text-xs text-zinc-400 font-bold uppercase mt-0.5">
                Total: <span className="text-emerald-400 font-black">{product.diamonds + (product.bonusDiamonds || 0)} 💎</span> Diamantes
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">${product.priceUSD.toFixed(2)}</span>
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase block">USD</span>
            </div>
          </div>

          {/* Payment Method & Balance Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              isBlocked 
                ? 'border-rose-500/30 bg-rose-950/20'
                : hasEnoughBalance
                ? 'border-emerald-500/50 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : 'border-amber-500/50 bg-amber-950/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 font-black text-xs uppercase ${
                isBlocked ? 'text-rose-400' : hasEnoughBalance ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                <Wallet className="w-4 h-4" />
                <span>Método de Pago: Saldo TunTun USD</span>
              </div>
              {hasEnoughBalance && !isBlocked && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-400 font-bold">Tu Saldo Disponible:</span>
                <span className="text-base sm:text-lg font-black text-white">${userBalance.toFixed(2)} USD</span>
              </div>

              {isBlocked ? (
                <div className="pt-2 border-t border-rose-500/20 text-xs font-bold text-rose-300">
                  <span>🚫 No puedes utilizar tu saldo mientras la cuenta esté inhabilitada.</span>
                </div>
              ) : hasEnoughBalance ? (
                <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-300">Saldo tras la compra:</span>
                  <span className="text-emerald-400 font-black font-mono">
                    ${(userBalance - product.priceUSD).toFixed(2)} USD
                  </span>
                </div>
              ) : (
                <div className="pt-3 border-t border-amber-500/20 space-y-2.5">
                  <span className="text-[11px] text-amber-400 font-bold block">
                    ⚠️ Saldo insuficiente. Te faltan ${(product.priceUSD - userBalance).toFixed(2)} USD para comprar este paquete.
                  </span>
                  {onOpenWalletModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWalletModal();
                      }}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-xl shadow cursor-pointer inline-flex items-center gap-2 w-full justify-center transition-all"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Recargar Saldo USD Ahora</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Security Info */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs space-y-1.5">
            <p className="font-black text-emerald-400 uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-current text-emerald-400" />
              <span>Acreditación Automática & Código Inmediato</span>
            </p>
            <p className="text-zinc-300 text-[11px] font-medium leading-relaxed">
              El cobro se descontará automáticamente de tu billetera y tu código de canje oficial de diamantes se generará al instante en <strong className="text-white">"Mis Pedidos"</strong>.
            </p>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-black border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 text-zinc-400 hover:text-white font-black text-xs uppercase cursor-pointer min-h-[42px] flex items-center justify-center transition-colors"
          >
            Cancelar
          </button>

          <button
            id="btn-submit-order-final"
            disabled={!hasEnoughBalance || isSubmitting || isBlocked}
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all min-h-[44px] ${
              hasEnoughBalance && !isSubmitting && !isBlocked
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isBlocked ? (
              <>
                <Ban className="w-4 h-4" />
                <span>Cuenta Inhabilitada</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {isSubmitting ? 'Procesando Compra...' : `Confirmar Pago ($${product.priceUSD.toFixed(2)} USD)`}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
