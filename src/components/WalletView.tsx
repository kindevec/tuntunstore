import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  ShieldCheck, 
  Upload, 
  Building2, 
  Check, 
  Sparkles, 
  AlertCircle, 
  History,
  Copy,
  Plus,
  Eye,
  X
} from 'lucide-react';
import { UserProfile, BankAccount, Order } from '../types';

interface WalletViewProps {
  currentUser: UserProfile;
  bankAccounts: BankAccount[];
  userOrders: Order[];
  onTopUpInstant: (amount: number) => void;
  onSubmitTopUpOrder: (order: Order) => void;
  onNavigateToCatalog: () => void;
}

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export const WalletView: React.FC<WalletViewProps> = ({
  currentUser,
  bankAccounts,
  userOrders = [],
  onTopUpInstant,
  onSubmitTopUpOrder,
  onNavigateToCatalog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'topup' | 'history'>('topup');
  const [topUpType, setTopUpType] = useState<'instant' | 'bank'>('instant');
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<BankAccount>(bankAccounts[0]);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedReceiptPreview, setSelectedReceiptPreview] = useState<string | null>(null);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInstantTopUp = () => {
    if (finalAmount <= 0) return;
    onTopUpInstant(finalAmount);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveSubTab('history');
    }, 1500);
  };

  const handleBankTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0 || !receiptImage) return;

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
      setActiveSubTab('history');
    }, 1500);
  };

  const walletHistory = userOrders.filter(
    (o) => o.paymentMethod === 'wallet_balance' || o.isWalletTopUp
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <span>Página Independiente</span>
            <span>•</span>
            <span>Billetera Virtual TunTun</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" />
            Mi Billetera Virtual USD
          </h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Mantén saldo depositado en tu cuenta para comprar diamantes al instante sin demoras bancarias.
          </p>
        </div>

        <button
          onClick={onNavigateToCatalog}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white uppercase flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Ir al Catálogo de Diamantes</span>
        </button>
      </div>

      {/* Main Hero Card for Balance */}
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-950 to-amber-950 p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-4 h-4" />
            Saldo Disponible para Recargas
          </span>
          <div className="text-4xl sm:text-5xl font-black text-emerald-300 font-mono tracking-tight">
            ${(currentUser.walletBalanceUSD || 0).toFixed(2)}{' '}
            <span className="text-xl text-emerald-400 font-sans font-bold">USD</span>
          </div>
          <p className="text-xs text-zinc-400 max-w-md">
            Al realizar pedidos de diamantes podrás elegir <strong className="text-emerald-300">"Pagar con Saldo USD"</strong> para la entrega más rápida de Ecuador.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('topup')}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
              activeSubTab === 'topup'
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Recargar Saldo</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
              activeSubTab === 'history'
                ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                : 'bg-zinc-900 text-zinc-300 border border-white/10 hover:bg-zinc-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Movimientos ({walletHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="flex items-center gap-3 border-b border-emerald-900/30 pb-3">
        <button
          onClick={() => setActiveSubTab('topup')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'topup'
              ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Opciones de Recarga
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          Historial de Movimientos
        </button>
      </div>

      {/* SECTION 1: RECARGAR SALDO USD */}
      {activeSubTab === 'topup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side */}
          <div className="lg:col-span-7 bg-zinc-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Selecciona la Modalidad de Recarga
              </h2>
              <p className="text-xs text-zinc-400">
                Escoge cómo deseas acreditar dinero a tu Billetera Virtual TunTun Store.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-800 rounded-2xl border border-zinc-600/50">
              <button
                type="button"
                onClick={() => setTopUpType('instant')}
                className={`py-3 px-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  topUpType === 'instant'
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 stroke-[2.5]" />
                <span>Acreditación Directa ⚡</span>
              </button>

              <button
                type="button"
                onClick={() => setTopUpType('bank')}
                className={`py-3 px-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  topUpType === 'bank'
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Depósito Bancario 🇪🇨</span>
              </button>
            </div>

            {/* Select Amount Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-black text-zinc-300 uppercase">
                1. Selecciona el Monto a Recargar ($ USD)
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-xl font-black text-sm font-mono border transition-all cursor-pointer min-h-[44px] flex items-center justify-center ${
                      !customAmount && selectedAmount === amt
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
                        : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div>
                <input
                  type="number"
                  placeholder="O ingresa un monto personalizado (Ej: 15)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-400 font-mono font-bold"
                />
              </div>
            </div>

            {/* MODE A: INSTANT DEMO TOP-UP */}
            {topUpType === 'instant' && (
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 text-xs space-y-1 text-emerald-200">
                  <p className="font-black text-emerald-300 uppercase flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-400" /> Acreditación Inmediata de Fondos
                  </p>
                  <p className="text-[11px] leading-relaxed text-zinc-300">
                    Se acreditarán <strong className="text-white">${finalAmount.toFixed(2)} USD</strong> de forma directa a tu Billetera Virtual para que realices pruebas de compra sin esperar la aprobación bancaria.
                  </p>
                </div>

                <button
                  onClick={handleInstantTopUp}
                  disabled={finalAmount <= 0 || isSuccess}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                    isSuccess
                      ? 'bg-emerald-400 text-black shadow-[0_0_25px_rgba(52,211,153,0.5)]'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95'
                  }`}
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>¡Acreditado con Éxito!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 stroke-[2.5]" />
                      <span>Acreditar ${finalAmount.toFixed(2)} USD Inmediatamente</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* MODE B: BANK TRANSFER TOP-UP */}
            {topUpType === 'bank' && (
              <form onSubmit={handleBankTopUp} className="space-y-5 pt-2 border-t border-white/10">
                {/* Bank account selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-zinc-300 uppercase">
                    2. Selecciona el Banco de Depósito
                  </label>
                  <select
                    value={selectedBank.id}
                    onChange={(e) => {
                      const found = bankAccounts.find((b) => b.id === e.target.value);
                      if (found) setSelectedBank(found);
                    }}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountType} ({b.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Receipt Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-zinc-300 uppercase">
                    3. Adjunta la Captura / Foto del Comprobante
                  </label>

                  <div className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-4 text-center bg-zinc-700/50 transition-colors">
                    {receiptImage ? (
                      <div className="space-y-2">
                        <img
                          src={receiptImage}
                          alt="Comprobante"
                          className="max-h-36 mx-auto rounded-xl border border-emerald-500/40 object-cover"
                        />
                        <p className="text-[11px] text-emerald-400 font-bold font-mono">{receiptFileName}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptImage(null);
                            setReceiptFileName('');
                          }}
                          className="text-[10px] text-rose-400 hover:underline font-bold"
                        >
                          Cambiar comprobante
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-2">
                        <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                        <span className="text-xs font-bold text-white block">Haz clic para subir comprobante bancario</span>
                        <span className="text-[10px] text-zinc-500 block">Formato PNG, JPG o WEBP</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
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
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={finalAmount <= 0 || !receiptImage || isSuccess}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                    isSuccess
                      ? 'bg-emerald-400 text-black'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black disabled:bg-zinc-800 disabled:text-zinc-600'
                  }`}
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>¡Solicitud de Recarga Enviada!</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Enviar Solicitud de Recarga (${finalAmount.toFixed(2)} USD)</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Info Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-6 space-y-4">
              <h3 className="font-black text-sm text-white uppercase flex items-center gap-2 border-b border-white/10 pb-3">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Datos Bancarios Oficiales TunTun Store
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-800 rounded-xl border border-zinc-600/50 space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-400 block">{selectedBank.bankName}</span>
                  <div className="flex items-center justify-between font-mono text-white font-bold text-sm">
                    <span>{selectedBank.accountNumber}</span>
                    <button
                      onClick={() => handleCopy(selectedBank.accountNumber, 'cuenta')}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      {copiedField === 'cuenta' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400">{selectedBank.accountType} • {selectedBank.accountHolder}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">C.I.: {selectedBank.idNumber}</p>
                </div>

                <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700 space-y-1 text-zinc-300 text-[11px]">
                  <p className="font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Aprobación Garantizada
                  </p>
                  <p>Una vez verificado tu depósito bancario, el monto cargado figurará en tu Billetera USD de inmediato.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: HISTORIAL DE MOVIMIENTOS ($ USD) */}
      {activeSubTab === 'history' && (
        <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                Historial de Movimientos de Billetera
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Revisa las recargas de saldo efectuadas y los diamantes pagados con tu Billetera USD.
              </p>
            </div>

            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black px-3 py-1 rounded-full uppercase">
              {walletHistory.length} Registros
            </span>
          </div>

          {walletHistory.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Wallet className="w-12 h-12 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-400 uppercase">Sin movimientos registrados aún</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Realiza una recarga de saldo o adquiere diamantes seleccionando el método Billetera USD para ver el registro aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-800 text-zinc-300 font-black uppercase text-[10px] border-b border-zinc-700">
                    <th className="p-4">Código / Fecha</th>
                    <th className="p-4">Concepto del Movimiento</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Monto ($ USD)</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {walletHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="font-mono font-bold text-white">{item.id}</p>
                        <p className="text-[10px] text-zinc-500">{item.date}</p>
                      </td>

                      <td className="p-4 font-bold text-zinc-200">
                        {item.productName}
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          item.isWalletTopUp
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {item.isWalletTopUp ? 'Recarga (+)' : 'Compra (-)'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`font-mono text-sm font-black ${
                          item.isWalletTopUp ? 'text-emerald-400' : 'text-zinc-300'
                        }`}>
                          {item.isWalletTopUp ? '+' : '-'}${item.priceUSD.toFixed(2)} USD
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.status === 'Completado'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'Pendiente'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {item.receiptUrl ? (
                          <button
                            onClick={() => setSelectedReceiptPreview(item.receiptUrl)}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-bold uppercase flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> Ver Comprobante
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-600">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal image preview if requested */}
      {selectedReceiptPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-5 rounded-2xl max-w-xl w-full border border-zinc-800 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-black text-sm uppercase">Comprobante Adjunto</h3>
              <button
                onClick={() => setSelectedReceiptPreview(null)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={selectedReceiptPreview} alt="Comprobante" className="w-full max-h-[70vh] object-contain rounded-xl border border-white/10" />
          </div>
        </div>
      )}

    </div>
  );
};
