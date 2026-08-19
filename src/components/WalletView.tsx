import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  Building2, 
  Check, 
  Sparkles, 
  AlertCircle, 
  History,
  Copy,
  Plus,
  Upload,
  FileCheck,
  Ban
} from 'lucide-react';
import { UserProfile, BankAccount, WalletTransaction } from '../types';

interface WalletViewProps {
  currentUser: UserProfile;
  bankAccounts: BankAccount[];
  walletHistory: WalletTransaction[];
  onSubmitTopUpOrder: (amount: number, bankName: string, receiptFile: File) => void;
  onNavigateToCatalog: () => void;
}

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export const WalletView: React.FC<WalletViewProps> = ({
  currentUser,
  bankAccounts,
  walletHistory = [],
  onSubmitTopUpOrder,
  onNavigateToCatalog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'topup' | 'history'>('topup');
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const selectedBank = bankAccounts.find(b => b.id === selectedBankId) || bankAccounts[0];
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | undefined>(undefined);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor sube una imagen válida (JPG, PNG, WEBP).');
        return;
      }
      setErrorMessage(null);
      setReceiptFileName(file.name);
      setReceiptFile(file);
      setReceiptImage(URL.createObjectURL(file));
    }
  };

  const renderBankDetails = (isMobile: boolean) => {
    if (!selectedBank) return null;

    return (
      <div className={`bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden ${isMobile ? 'mt-2 animate-in slide-in-from-top-2' : ''}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-amber-400" />
          <h3 className="font-black text-xs uppercase tracking-wider text-amber-400">Datos para Transferir</h3>
        </div>
        <div className="space-y-2">
          <div className="mb-1">
            <p className="text-[9px] text-zinc-400 uppercase font-black mb-0.5">
              {selectedBank.notes || 'Banco Seleccionado'}
            </p>
            <p className="font-black text-sm text-white uppercase leading-tight">{selectedBank.bankName}</p>
          </div>

          <div className="bg-black/40 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-black block mb-0.5">Número de Cuenta / ID</span>
              <span className="font-mono text-sm font-black text-white leading-none">{selectedBank.accountNumber}</span>
            </div>
            <button
              onClick={() => handleCopy(selectedBank.accountNumber, 'num')}
              className="p-1.5 rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
            >
              {copiedField === 'num' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="bg-black/40 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-black block mb-0.5">Titular de la Cuenta</span>
              <span className="font-bold text-xs text-white truncate max-w-[150px] sm:max-w-none leading-none">{selectedBank.holderName}</span>
            </div>
            <button
              onClick={() => handleCopy(selectedBank.holderName, 'holder')}
              className="p-1.5 rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
            >
              {copiedField === 'holder' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {selectedBank.holderId && (
            <div className="bg-black/40 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-black block mb-0.5">Cédula / Correo</span>
                <span className="font-bold text-xs text-white truncate max-w-[150px] sm:max-w-none leading-none">{selectedBank.holderId}</span>
              </div>
              <button
                onClick={() => handleCopy(selectedBank.holderId, 'holderId')}
                className="p-1.5 rounded-md bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
              >
                {copiedField === 'holderId' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleBankTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.isBlocked) {
      setErrorMessage('🚫 Tu cuenta se encuentra inhabilitada para recargas de saldo. Contacta a soporte.');
      return;
    }
    if (finalAmount < 5) {
      setErrorMessage('El monto mínimo de recarga es de $5 USD.');
      return;
    }
    if (!receiptFile || !selectedBank) {
      setErrorMessage('Debes seleccionar un banco y subir tu comprobante de pago.');
      return;
    }

    setErrorMessage(null);
    onSubmitTopUpOrder(finalAmount, selectedBank.bankName, receiptFile);
    setActiveSubTab('history');
    setReceiptImage(null);
    setReceiptFile(undefined);
    setReceiptFileName('');
    setCustomAmount('');
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Alerta de Usuario Bloqueado */}
      {currentUser.isBlocked && (
        <div className="bg-rose-950/70 border-2 border-rose-500/80 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(244,63,94,0.25)] animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30 shrink-0 mt-0.5 sm:mt-0">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-rose-300 uppercase tracking-wide">
                Cuenta Inhabilitada para Recargas y Compras
              </h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Tu cuenta ha sido inhabilitada para procesar transferencias y compras por disposición de la administración. Puedes seguir navegando en el catálogo. Para resolver dudas sobre tus comprobantes o solicitar reactivación, por favor contáctanos por WhatsApp.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/593968729952?text=Hola%20TunTunStore,%20mi%20cuenta%20se%20encuentra%20inhabilitada%20y%20deseo%20asistencia%20con%20mi%20usuario."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase rounded-xl transition-colors shrink-0 shadow-md w-full sm:w-auto text-center cursor-pointer"
          >
            Contactar Soporte
          </a>
        </div>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-6">
        <div>

          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" />
            Mi Billetera Virtual USD
          </h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Recarga tu Billetera mediante depósito bancario para comprar diamantes al instante.
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
            Saldo Disponible
          </span>
          <div className="text-4xl sm:text-5xl font-black text-emerald-300 font-mono tracking-tight">
            ${(currentUser.walletBalanceUSD || 0).toFixed(2)}{' '}
            <span className="text-xl text-emerald-400 font-sans font-bold">USD</span>
          </div>
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

      {/* SECTION 1: RECARGAR SALDO USD */}
      {activeSubTab === 'topup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side */}
          <div className="lg:col-span-7 bg-zinc-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Recarga vía Transferencia Bancaria
              </h2>
              <p className="text-xs text-zinc-400">
                Transfiere el monto a nuestras cuentas. Tu recarga quedará "Pendiente" hasta que nuestro equipo verifique el baucher.
              </p>
            </div>

            <form onSubmit={handleBankTopUp} className="space-y-6">
              
              {/* Monto a recargar */}
              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  Monto a Recargar (USD)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AMOUNTS.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                      className={`px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
                        selectedAmount === amount && !customAmount
                          ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-black text-zinc-400 border border-white/10 hover:border-emerald-500/50 hover:text-white'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-black">$</span>
                    <input
                      type="number"
                      placeholder="Otro"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(0);
                      }}
                      className="w-24 pl-7 pr-3 py-2 bg-black border border-white/10 rounded-xl text-sm font-black text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      min="5"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Selección de Banco */}
              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  Cuenta de Destino
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bankAccounts.map(bank => (
                    <div key={bank.id} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => setSelectedBankId(bank.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          selectedBank.id === bank.id
                            ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'border-white/10 bg-black hover:bg-white/5'
                        }`}
                      >
                        <span className="font-black text-xs uppercase text-white">{bank.bankName}</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1">{bank.accountType}</span>
                      </button>
                      
                      {/* Accordion style details for Mobile only */}
                      {selectedBank.id === bank.id && (
                        <div className="lg:hidden">
                          {renderBankDetails(true)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Subir Comprobante */}
              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  Sube tu Baucher
                </label>
                <div className="border-2 border-dashed border-white/20 hover:border-emerald-500 rounded-2xl p-4 text-center transition-all bg-black cursor-pointer group">
                  {receiptImage ? (
                    <div className="space-y-3">
                      <div className="relative max-w-xs mx-auto overflow-hidden rounded-xl border border-emerald-500/40 shadow-md">
                        <img src={receiptImage} alt="Comprobante" className="w-full max-h-40 object-cover" />
                        <div className="absolute top-2 right-2 bg-emerald-500 text-black p-1 rounded-full shadow">
                          <FileCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <label className="inline-block px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 font-black text-xs uppercase cursor-pointer">
                        <span>Cambiar imagen</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="block w-full h-full cursor-pointer py-6">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-black text-white uppercase">Haz clic para subir comprobante</p>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-black flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {currentUser.isBlocked ? (
                <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-center space-y-1.5">
                  <p className="text-xs font-black text-rose-300 uppercase flex items-center justify-center gap-2">
                    <Ban className="w-4 h-4 text-rose-400" />
                    <span>Función de recarga inhabilitada</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Tu cuenta tiene restringido el envío de recargas por disposición administrativa.
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all cursor-pointer"
                >
                  <span>Enviar Recarga de ${finalAmount.toFixed(2)} a Verificación</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Info Side (Datos del Banco) - Desktop Only */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
            {selectedBank ? (
              renderBankDetails(false)
            ) : (
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden py-12 text-center">
                <Building2 className="w-8 h-8 text-amber-500/30 mx-auto mb-2" />
                <p className="text-zinc-500 font-bold text-xs uppercase">Cargando bancos...</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SECTION 2: HISTORIAL DE TRANSACCIONES */}
      {activeSubTab === 'history' && (
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-400" />
            Historial de Billetera
          </h2>
          
          <div className="space-y-3">
            {walletHistory.length > 0 ? (
              [...walletHistory].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(txn => {
                const isDebit = txn.amount < 0;
                
                return (
                  <div key={txn.id} className="p-4 bg-black rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                        txn.type === 'top_up' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                        txn.type === 'purchase' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {txn.type === 'top_up' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5 rotate-180" />}
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-sm">
                          {txn.type === 'top_up' ? 'Recarga de Saldo' : 'Compra de Diamantes'}
                        </p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                          {new Date(txn.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:justify-end">
                      <div className="text-right">
                        <span className={`text-sm font-black font-mono block ${isDebit ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isDebit ? '' : '+'}${Math.abs(txn.amount).toFixed(2)} USD
                        </span>
                        
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mt-1 ${
                          txn.status === 'Pendiente' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          txn.status === 'Aprobado' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-zinc-500 font-bold uppercase text-xs">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No tienes movimientos en tu billetera aún.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
