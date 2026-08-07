import React, { useState, useEffect } from 'react';
import { Product, BankAccount, UserProfile, Order } from '../types';
import { DiamondIcon } from './DiamondIcon';
import { 
  X, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Zap,
  Wallet,
  HelpCircle
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
  const hasEnoughBalance = userBalance >= product.priceUSD;

  const [step, setStep] = useState<1 | 2>(1); // 1: Datos Jugador, 2: Resumen & Confirmación
  const [playerId, setPlayerId] = useState(currentUser?.playerIdDefault || '');
  const [playerTag, setPlayerTag] = useState(currentUser?.gamerTag || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.playerIdDefault) {
      setPlayerId(currentUser.playerIdDefault);
    }
    if (currentUser?.gamerTag) {
      setPlayerTag(currentUser.gamerTag);
    }
  }, [currentUser]);

  const isGoldStyle = product.isGoldPromo || product.category === 'memberships';

  // Form submission validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId.trim()) {
      setErrorMessage('Debes ingresar obligatoriamente tu ID de jugador.');
      setStep(1);
      return;
    }
    if (!hasEnoughBalance) {
      setErrorMessage('Saldo insuficiente en tu Billetera Virtual.');
      return;
    }

    setErrorMessage(null);
    onSubmitOrder({
      userEmail: currentUser?.email || 'invitado@tuntunstore.com',
      userName: currentUser?.name || 'Cliente Jugador',
      playerId: playerId.trim(),
      playerTag: playerTag.trim() || undefined,
      productId: product.id,
      productName: product.name,
      diamondsTotal: product.diamonds + (product.bonusDiamonds || 0),
      priceUSD: product.priceUSD,
      bankName: 'Saldo TunTun USD', // Always Wallet Balance
      receiptUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      receiptFileName: 'pago_saldo_tuntun.png',
      paymentMethod: 'wallet_balance',
    });
  };

  return (
    <div id="order-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div 
        id="order-modal-container"
        className="relative w-full max-w-2xl bg-zinc-950 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden border border-emerald-500/30 text-white max-h-[95vh] sm:max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-emerald-900/40 bg-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 sm:p-2 rounded-xl ${isGoldStyle ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black'}`}>
              <DiamondIcon size="sm" variant={isGoldStyle ? 'gold' : 'emerald'} />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] text-emerald-400 font-black uppercase tracking-widest">Formulario de Pedido Directo</p>
              <h2 className="text-sm sm:text-lg font-black uppercase text-white truncate max-w-[200px] sm:max-w-none">{product.name} (${product.priceUSD.toFixed(2)})</h2>
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

        {/* Step Indicator Progress Bar */}
        <div className="bg-black/50 px-3 sm:px-6 py-2 border-b border-white/10 flex items-center justify-between text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-400">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-emerald-400' : ''}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step >= 1 ? 'bg-emerald-500 text-black' : 'bg-white/10 text-zinc-500'}`}>1</span>
            <span>1. ID & Pago</span>
          </div>
          <ArrowRight className="w-3 h-3 text-zinc-600" />
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-emerald-400' : ''}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step === 2 ? 'bg-emerald-500 text-black' : 'bg-white/10 text-zinc-500'}`}>2</span>
            <span>2. Confirmar</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-black uppercase flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: PLAYER ID & PAYMENT METHOD */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Product Summary Box */}
              <div className="p-4 rounded-xl bg-black border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Paquete Seleccionado</span>
                  <h3 className="font-black text-base text-white uppercase">{product.name}</h3>
                  <p className="text-xs text-zinc-400 font-bold uppercase">Total: {product.diamonds + (product.bonusDiamonds || 0)} 💎 Diamantes</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-400">${product.priceUSD.toFixed(2)}</span>
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase block">USD</span>
                </div>
              </div>

              {/* Player ID Form Input */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. ID del Jugador (Obligatorio)</span>
                  <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="input-player-id"
                    placeholder="Ejemplo: 284910293"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 rounded-xl bg-black border border-white/20 text-white font-black text-base focus:border-emerald-500 focus:outline-none transition-all placeholder:font-normal placeholder:text-zinc-600"
                  />
                  <div className="absolute right-3 top-3 text-[10px] text-emerald-400 font-black uppercase bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Free Fire ID
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-semibold">
                  <p className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                    Encuentra tu ID tocando tu perfil en el menú principal del juego.
                  </p>
                </div>
              </div>

              {/* Optional Player Tag */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider">
                  Nick / Nombre en Juego (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: MaTeO_FF_PRO"
                  value={playerTag}
                  onChange={(e) => setPlayerTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* PAYMENT METHOD SELECTOR (FORCED WALLET) */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                  <span>2. Método de Pago Único</span>
                  <span className="text-[11px] text-emerald-400">TunTun Store 🇪🇨</span>
                </label>

                <div className="grid grid-cols-1 gap-3">
                  <div
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      hasEnoughBalance
                        ? 'border-emerald-500 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'border-amber-500 bg-black'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 font-black text-xs uppercase ${hasEnoughBalance ? 'text-emerald-400' : 'text-amber-400'}`}>
                        <Wallet className="w-4 h-4" />
                        <span>Saldo TunTun USD</span>
                      </div>
                      {hasEnoughBalance && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-white">${userBalance.toFixed(2)}</span>
                        <span className={`text-[10px] font-bold ${hasEnoughBalance ? 'text-emerald-400' : 'text-amber-400'}`}>USD disponible</span>
                      </div>

                      {hasEnoughBalance ? (
                        <p className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current text-emerald-400" />
                          ⚡ Acreditación inmediata en 1 clic
                        </p>
                      ) : (
                        <div className="pt-2 border-t border-amber-500/20 mt-2">
                          <span className="text-[11px] text-amber-400 font-bold block mb-2">
                            ⚠️ Saldo insuficiente. Te faltan ${(product.priceUSD - userBalance).toFixed(2)} USD para comprar este paquete.
                          </span>
                          {onOpenWalletModal && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenWalletModal();
                              }}
                              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-[11px] uppercase rounded-xl shadow cursor-pointer inline-flex items-center gap-2 w-full justify-center"
                            >
                              <Wallet className="w-4 h-4" />
                              <span>Recargar Saldo USD Ahora</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: RESUMEN Y CONFIRMACIÓN */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-black border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm border-b border-white/10 pb-2 uppercase">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Resumen de tu Solicitud</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Producto:</span>
                    <span className="text-white">{product.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Monto Total:</span>
                    <span className="text-emerald-400 font-black">${product.priceUSD.toFixed(2)} USD</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">ID del Jugador:</span>
                    <span className="font-mono text-white">{playerId}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Método de Pago:</span>
                    <span className="text-white">💰 Saldo TunTun USD</span>
                  </div>
                </div>

                <div className="mt-2 p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-bold">Nuevo Saldo tras compra:</span>
                  <span className="text-emerald-400 font-black font-mono">
                    ${(userBalance - product.priceUSD).toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                <p className="font-black text-emerald-400 uppercase flex items-center gap-1">
                  <Zap className="w-4 h-4 fill-current text-emerald-400" />
                  <span>Pago Directo con Billetera</span>
                </p>
                <p className="text-zinc-300 font-medium">
                  Tu dinero guardado en la plataforma se descontará instantáneamente. No requiere verificación manual de baucher.
                </p>
              </div>

              <div className="text-xs text-zinc-400 space-y-1 bg-black p-3.5 rounded-xl border border-white/10 uppercase font-semibold">
                <p className="font-black text-emerald-400">⏱️ Tiempo estimado de entrega:</p>
                <p>Tu orden ingresará al sistema con acreditación inmediata de 5 a 15 minutos.</p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-black border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-zinc-400 hover:text-white font-black text-xs uppercase cursor-pointer min-h-[42px] flex items-center justify-center"
            >
              Cancelar
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              disabled={!hasEnoughBalance}
              onClick={() => {
                if (!playerId.trim()) {
                  setErrorMessage('Por favor ingresa tu ID de jugador antes de continuar.');
                  return;
                }
                setErrorMessage(null);
                setStep(2);
              }}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                hasEnoughBalance 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>Siguiente Paso</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-submit-order-final"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer min-h-[44px]"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Confirmar Pago con Saldo ($${product.priceUSD.toFixed(2)})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
