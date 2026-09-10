import React, { useState } from 'react';
import {
  Wallet,
  Building2,
  Check,
  Sparkles,
  AlertCircle,
  History,
  Copy,
  Plus,
  Upload,
  CreditCard,
  Loader2,
  ShieldCheck,
  Zap,
  ArrowLeft,
  X,
} from 'lucide-react';
import { usePayPhone } from '../../hooks/usePayPhone';
import { payphoneService } from '../../services/payphoneService';
import { supabase } from '../../supabaseClient';
import { UserProfile, BankAccount, WalletTransaction } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface PWAWalletViewProps {
  currentUser: UserProfile;
  bankAccounts: BankAccount[];
  walletHistory: WalletTransaction[];
  onSubmitTopUpOrder: (amount: number, bankName: string, receiptFile: File) => void;
  onNavigateToCatalog: () => void;
  onPayPhoneGatewayStateChange?: (active: boolean) => void;
}

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];
const PAYPHONE_PRESET_AMOUNTS = [1, 2, 5, 10, 20, 50, 100];
const PAYPHONE_METHOD_ID = 'payphone';

export const PWAWalletView: React.FC<PWAWalletViewProps> = ({
  currentUser,
  bankAccounts,
  walletHistory = [],
  onSubmitTopUpOrder,
  onNavigateToCatalog,
  onPayPhoneGatewayStateChange,
}) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    bankAccounts[0]?.id || PAYPHONE_METHOD_ID
  );
  const isPayPhoneSelected = selectedMethodId === PAYPHONE_METHOD_ID;
  const selectedBank = bankAccounts.find((b) => b.id === selectedMethodId) || bankAccounts[0];

  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | undefined>(undefined);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // PayPhone Hook
  const { prepareTransaction, loading: payphoneLiveLoading, error: payphoneLiveError } = usePayPhone();
  const [payPhoneBoxActive, setPayPhoneBoxActive] = useState(false);
  const [payPhoneInitLoading, setPayPhoneInitLoading] = useState(false);
  const [payPhoneInitError, setPayPhoneInitError] = useState<string | null>(null);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const balance = currentUser.walletBalanceUSD ?? 0;

  const copyToClipboard = (text: string, field: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic('light');
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      triggerHaptic('error');
      setErrorMsg('Adjunta la foto de tu comprobante de pago');
      return;
    }
    if (finalAmount <= 0) {
      triggerHaptic('error');
      setErrorMsg('Selecciona un monto válido');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('success');
    onSubmitTopUpOrder(finalAmount, selectedBank?.bankName || 'Transferencia', receiptFile);
    setIsSubmitting(false);
    setReceiptImage(null);
    setReceiptFile(undefined);
  };

  const handleInitPayPhone = async () => {
    if (finalAmount < 1) {
      triggerHaptic('error');
      setPayPhoneInitError('El monto mínimo para recargar con PayPhone es $1.00 USD');
      return;
    }
    if (currentUser.isBlocked) {
      triggerHaptic('error');
      setPayPhoneInitError('Tu cuenta se encuentra inhabilitada temporalmente.');
      return;
    }

    triggerHaptic('medium');
    setPayPhoneInitLoading(true);
    setPayPhoneInitError(null);

    const clientTxId = `wallet_${currentUser.uid.slice(0, 8)}_${Date.now()}`;
    const pendingData = {
      amount: finalAmount,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.name,
      clientTxId,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('tuntun_pending_payphone_order', JSON.stringify(pendingData));

    try {
      await prepareTransaction(currentUser.uid, finalAmount, clientTxId);
      await payphoneService.ensureLoaded();

      setPayPhoneBoxActive(true);
      onPayPhoneGatewayStateChange?.(true);

      setTimeout(() => {
        payphoneService.renderPaymentBox({
          containerId: 'pwa-payphone-element',
          total: finalAmount,
          clientTransactionId: clientTxId,
          reference: `Recarga TunTun Billetera - ${currentUser.name || 'Cliente'}`,
          email: currentUser.email,
          phoneNumber: currentUser.phone || undefined,
        });
        setPayPhoneInitLoading(false);
      }, 300);
    } catch (err: any) {
      setPayPhoneInitError(err.message || 'Error al conectar con la pasarela de pagos');
      triggerHaptic('error');
      setPayPhoneInitLoading(false);
    }
  };

  const handleClosePayPhone = () => {
    triggerHaptic('light');
    setPayPhoneBoxActive(false);
    onPayPhoneGatewayStateChange?.(false);
  };

  return (
    <div className="min-h-screen bg-[#020b08] text-white pb-28 px-3.5 pt-3">
      {/* 💳 TARJETA VIRTUAL GAMER TUN TUN (ESTILO APPLE WALLET / NEOBANKING) */}
      <div className="relative w-full rounded-3xl p-5 bg-gradient-to-br from-[#0c2a1e] via-[#051710] to-[#020e09] border border-emerald-500/40 shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.15)] overflow-hidden select-none">
        {/* Líneas holográficas de fondo */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-xl pointer-events-none" />

        {/* Cabecera de la Tarjeta */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-400/40 flex items-center justify-center shadow-sm">
              <img src="/logo-transparent.webp" alt="TunTun" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-white block leading-tight">
                TunTun Wallet
              </span>
              <span className="text-[9px] text-emerald-400 font-bold block leading-tight">
                Digital Gamer Card
              </span>
            </div>
          </div>

          <span className="text-[9px] bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-black px-2 py-0.5 rounded-full uppercase">
            Saldo Activo
          </span>
        </div>

        {/* Saldo en Gran Formato */}
        <div className="my-3 relative z-10">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
            Balance Disponible
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              ${balance.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">USD</span>
          </div>
        </div>

        {/* Pie de la tarjeta: Nombre y Botón de recarga rápida */}
        <div className="pt-3 border-t border-emerald-950/80 flex items-center justify-between text-xs relative z-10">
          <div className="truncate pr-2">
            <span className="text-[10px] text-zinc-400 block leading-tight">Titular</span>
            <span className="font-bold text-white text-xs truncate block leading-tight">
              {currentUser.name || 'Gamer TunTun'}
            </span>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigateToCatalog();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1 shrink-0"
          >
            <span>Ir al Catálogo</span>
          </button>
        </div>
      </div>

      {/* 🔀 SELECTOR SEGMENTADO NATIVO: [ RECARGAR SALDO ] | [ MOVIMIENTOS ] */}
      <div className="flex p-1 rounded-2xl bg-[#061711] border border-emerald-500/20 my-4 select-none">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('topup');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'topup'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Recargar Saldo</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('history');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Movimientos</span>
        </button>
      </div>

      {/* VISTA 1: RECARGAR SALDO */}
      {activeTab === 'topup' && (
        <div className="space-y-4">
          {/* Selector de Método de Pago (Horizontal Táctil) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block mb-2">
              1. Selecciona Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* PayPhone Card */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedMethodId(PAYPHONE_METHOD_ID);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isPayPhoneSelected
                    ? 'bg-orange-500/15 border-orange-400 shadow-[0_0_15px_rgba(255,106,0,0.3)]'
                    : 'bg-[#061711] border-emerald-500/20 text-zinc-400'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-white block truncate leading-tight">
                    Tarjeta / PayPhone
                  </span>
                  <span className="text-[10px] text-orange-300 font-bold block leading-tight">
                    Instantáneo
                  </span>
                </div>
              </button>

              {/* Bancos disponibles */}
              {bankAccounts.map((bank) => {
                const isSelected = selectedMethodId === bank.id;
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedMethodId(bank.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-[#061711] border-emerald-500/20 text-zinc-400'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-white block truncate leading-tight">
                        {bank.bankName}
                      </span>
                      <span className="text-[10px] text-emerald-300 font-bold block leading-tight">
                        Transferencia
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Monto (Chips táctiles) */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block mb-2">
              2. Monto a Recargar
            </label>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {(isPayPhoneSelected ? PAYPHONE_PRESET_AMOUNTS.slice(2) : PRESET_AMOUNTS).map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`h-11 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                      isSelected
                        ? isPayPhoneSelected
                          ? 'bg-orange-500 text-black shadow-md'
                          : 'bg-emerald-400 text-black shadow-md'
                        : 'bg-[#061711] border border-emerald-500/20 text-zinc-300 hover:text-white'
                    }`}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>

            {/* Input para Monto Personalizado */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">
                $ USD
              </span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="O escribe otro monto (Ej. 15)"
                min="1"
                step="0.5"
                className="w-full pl-16 pr-4 py-2.5 bg-[#061711] border border-emerald-500/20 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* DATOS DE TRANSFERENCIA (Si eligió banco) */}
          {!isPayPhoneSelected && selectedBank && (
            <div className="p-3.5 rounded-2xl bg-[#061912] border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                <span className="text-[11px] text-zinc-400 font-bold">Banco:</span>
                <span className="text-xs font-black text-white">{selectedBank.bankName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                <span className="text-[11px] text-zinc-400 font-bold">Número de Cuenta:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedBank.accountNumber, 'acc')}
                  className="flex items-center gap-1.5 font-mono font-bold text-xs text-emerald-300"
                >
                  <span>{selectedBank.accountNumber}</span>
                  <Copy className="w-3.5 h-3.5" />
                  {copiedField === 'acc' && <span className="text-[9px] text-emerald-400">¡Copiado!</span>}
                </button>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                <span className="text-[11px] text-zinc-400 font-bold">Titular:</span>
                <span className="text-xs font-bold text-zinc-200">{selectedBank.accountHolder}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-bold">Cédula / RUC:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedBank.idNumber, 'idNum')}
                  className="flex items-center gap-1.5 font-mono font-bold text-xs text-emerald-300"
                >
                  <span>{selectedBank.idNumber}</span>
                  <Copy className="w-3.5 h-3.5" />
                  {copiedField === 'idNum' && <span className="text-[9px] text-emerald-400">¡Copiado!</span>}
                </button>
              </div>
            </div>
          )}

          {/* SUBIDA DE COMPROBANTE O BOTÓN PAYPHONE */}
          {isPayPhoneSelected ? (
            <div className="space-y-3">
              {payPhoneInitError && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                  {payPhoneInitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleInitPayPhone}
                disabled={payPhoneInitLoading || finalAmount < 1}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(255,106,0,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {payPhoneInitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando con PayPhone...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 stroke-[2.5]" />
                    <span>Pagar ${finalAmount.toFixed(2)} USD con Tarjeta</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-zinc-400">
                Acepta tarjetas de débito y crédito Visa y Mastercard de cualquier banco de Ecuador.
              </p>
            </div>
          ) : (
            <form onSubmit={handleTopUpSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block mb-2">
                  3. Adjunta el Comprobante de Pago
                </label>
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/50 bg-[#061711] cursor-pointer transition-colors text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {receiptImage ? (
                    <div className="relative">
                      <img
                        src={receiptImage}
                        alt="Comprobante"
                        className="max-h-36 rounded-xl object-contain border border-emerald-400/40"
                      />
                      <span className="text-[10px] text-emerald-300 font-bold block mt-1.5">
                        Toca para cambiar de imagen
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-emerald-400 mb-1" />
                      <span className="text-xs font-bold text-white block">
                        Toca para subir foto o captura
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        Formatos JPG, PNG, WebP
                      </span>
                    </>
                  )}
                </label>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !receiptFile}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando comprobante...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Enviar Comprobante por ${finalAmount.toFixed(2)} USD</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* VISTA 2: HISTORIAL DE MOVIMIENTOS */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {walletHistory.length > 0 ? (
            walletHistory.map((tx) => {
              const isApproved = tx.status === 'Aprobado';
              const isPending = tx.status === 'Pendiente';
              const isPositive = tx.type === 'top_up' || (tx.type === 'admin_adjustment' && tx.amount > 0);

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-[#061711] border border-emerald-500/20 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate leading-tight">
                        {tx.type === 'top_up'
                          ? 'Recarga de Saldo'
                          : tx.type === 'purchase'
                          ? 'Compra de Diamantes'
                          : 'Ajuste de Saldo'}
                      </span>
                      <span className="text-[10px] text-zinc-500 block leading-tight">
                        {new Date(tx.created_at).toLocaleDateString('es-EC', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-mono font-black block leading-tight ${
                        isPositive ? 'text-emerald-400' : 'text-zinc-300'
                      }`}
                    >
                      {isPositive ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase leading-none px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-zinc-400 text-xs">
              Aún no tienes movimientos registrados en tu billetera.
            </div>
          )}
        </div>
      )}

      {/* MODAL / DRAWER A PANTALLA COMPLETA DE PAYPHONE INLINE */}
      {payPhoneBoxActive && (
        <div className="fixed inset-0 z-[100] bg-[#07090e] flex flex-col pt-[env(safe-area-inset-top,0px)]">
          <div className="h-14 px-4 border-b border-orange-500/30 flex items-center justify-between bg-orange-500/10">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-400" />
              <span className="text-xs font-black text-white uppercase">
                Pago Seguro PayPhone (${finalAmount.toFixed(2)} USD)
              </span>
            </div>
            <button
              onClick={handleClosePayPhone}
              className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
            <div id="pwa-payphone-element" className="w-full max-w-sm" />
          </div>
        </div>
      )}
    </div>
  );
};
