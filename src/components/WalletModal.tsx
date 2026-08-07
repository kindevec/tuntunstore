import React, { useState } from 'react';
import { X, Wallet, ArrowUpRight, ArrowDownLeft, Zap, ShieldCheck, Upload, Building2, Check, Sparkles, AlertCircle, History } from 'lucide-react';
import { UserProfile, BankAccount, Order } from '../types';

interface WalletModalProps {
  currentUser: UserProfile;
  bankAccounts: BankAccount[];
  userOrders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onTopUpInstant: (amount: number) => void;
  onSubmitTopUpOrder: (order: Order) => void;
}

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export const WalletModal: React.FC<WalletModalProps> = ({
  currentUser,
  bankAccounts,
  userOrders = [],
  isOpen,
  onClose,
  onTopUpInstant,
  onSubmitTopUpOrder,
}) => {
  const [mode, setMode] = useState<'topup' | 'history'>('topup');
  const [topUpType, setTopUpType] = useState<'instant' | 'bank'>('instant');
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<BankAccount>(bankAccounts[0]);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleInstantTopUp = () => {
    if (finalAmount < 1) return;
    onTopUpInstant(finalAmount);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleBankTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount < 1 || !receiptImage) return;

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const orderId = `REC-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTopUpOrder: Order = {
      id: orderId,
      date: dateStr,
      userEmail: currentUser.email,
      userName: currentUser.name,
      playerId: currentUser.playerIdDefault || 'N/A',
      playerTag: currentUser.gamerTag || 'Recarga Saldo USD',
      productId: 'wallet-topup',
      productName: `Recarga de Saldo USD ($${finalAmount.toFixed(2)})`,
      diamondsTotal: 0,
      priceUSD: finalAmount,
      bankName: selectedBank.bankName,
      receiptUrl: receiptImage,
      receiptFileName: receiptFileName || 'comprobante_saldo.png',
      status: 'Pendiente',
      paymentMethod: 'bank_transfer',
      isWalletTopUp: true,
      statusHistory: [
        {
          status: 'Pendiente',
          timestamp: dateStr,
          note: `Solicitud de recarga de saldo por $${finalAmount.toFixed(2)} pendiente de verificación de administración.`,
        },
      ],
    };

    onSubmitTopUpOrder(newTopUpOrder);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const walletHistory = userOrders.filter(
    (o) => o.paymentMethod === 'wallet_balance' || o.isWalletTopUp
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                Billetera Virtual
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  Balance USD
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-semibold uppercase">
                Guarda dinero en tu cuenta para recargas de diamantes al instante
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance USD Display Card */}
        <div className="p-5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/40 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400/90 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              Saldo Disponible
            </span>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1 mt-0.5">
              <span>${(currentUser.walletBalanceUSD || 0).toFixed(2)}</span>
              <span className="text-xs text-emerald-400 font-bold">USD</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              ⚡ Usa este saldo en checkout para activar tus paquetes en 1 clic.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setMode('topup')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'topup'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Recargar
            </button>
            <button
              onClick={() => setMode('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'history'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Historial
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {mode === 'topup' ? (
            <div className="space-y-5">
              {/* Select Amount */}
              <div>
                <label className="block text-xs font-black text-zinc-300 uppercase mb-2">
                  1. Selecciona o Ingresa el Monto a Recargar:
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2.5 rounded-xl font-black text-sm transition-all cursor-pointer border ${
                        !customAmount && selectedAmount === amt
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
                          : 'bg-zinc-950 text-zinc-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    placeholder="Otro monto en USD (ej: 15.50)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400 font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-400">USD</span>
                </div>
              </div>

              {/* Method Selector */}
              <div>
                <label className="block text-xs font-black text-zinc-300 uppercase mb-2">
                  2. Método de Recarga:
                </label>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setTopUpType('instant')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      topUpType === 'instant'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs uppercase">
                      <Zap className="w-4 h-4 fill-current" />
                      Prueba Instantánea
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                      Acredita el dinero en tu cuenta al instante para simular compras inmediatas.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTopUpType('bank')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      topUpType === 'bank'
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'bg-zinc-950 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs uppercase">
                      <Building2 className="w-4 h-4" />
                      Depósito Bancario
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                      Sube tu comprobante de Pichincha/Deuna para que administración apruebe tu recarga.
                    </p>
                  </button>
                </div>

                {topUpType === 'instant' ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Recarga Inmediata para Demostración</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                      Al presionar el botón, se acreditarán <strong className="text-emerald-400 font-black">${finalAmount.toFixed(2)} USD</strong> directamente a tu Balance TunTun.
                    </p>

                    <button
                      type="button"
                      onClick={handleInstantTopUp}
                      disabled={isSuccess || finalAmount < 1}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
                    >
                      {isSuccess ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>¡${finalAmount.toFixed(2)} Creados en tu Billetera!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          <span>Acreditar ${finalAmount.toFixed(2)} USD a Mi Saldo</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBankTopUp} className="space-y-4 bg-zinc-950 p-4 rounded-2xl border border-white/10">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                        Banco de Destino
                      </label>
                      <select
                        value={selectedBank.id}
                        onChange={(e) => {
                          const b = bankAccounts.find((acc) => acc.id === e.target.value);
                          if (b) setSelectedBank(b);
                        }}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer font-semibold"
                      >
                        {bankAccounts.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bankName} - {b.accountNumber} ({b.holderName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                        Adjuntar Comprobante de Depósito / Transferencia
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setReceiptFileName(file.name);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setReceiptImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                      />
                    </div>

                    {receiptImage && (
                      <div className="flex items-center gap-3 bg-black p-2 rounded-xl border border-white/10">
                        <img src={receiptImage} alt="Comprobante" className="w-12 h-12 rounded-lg object-cover" />
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Comprobante listo ({receiptFileName})
                        </span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSuccess || !receiptImage || finalAmount < 1}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSuccess ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>¡Solicitud Enviada a Revisión!</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Enviar Solicitud de Recarga (${finalAmount.toFixed(2)})</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Historial de Movimientos de Billetera
              </h3>

              {walletHistory.length === 0 ? (
                <div className="p-8 text-center bg-black/40 rounded-2xl border border-white/5 space-y-2">
                  <Wallet className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400 font-bold uppercase">No hay transacciones registradas</p>
                  <p className="text-[11px] text-zinc-500">
                    Tus pagos realizados con Saldo USD o solicitudes de recarga aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {walletHistory.map((item) => {
                    const isTopUp = item.isWalletTopUp;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isTopUp
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isTopUp ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white">{item.productName}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{item.date} • ID: {item.id}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-black text-xs font-mono ${
                              isTopUp ? 'text-emerald-400' : 'text-zinc-200'
                            }`}
                          >
                            {isTopUp ? '+' : '-'}${item.priceUSD.toFixed(2)} USD
                          </span>
                          <div>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                item.status === 'Completado'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : item.status === 'Pendiente'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-950 border-t border-white/10 text-[10px] text-zinc-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Billetera respaldada por TunTun Store Ecuador 🇪🇨
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-bold uppercase transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
