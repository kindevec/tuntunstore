import React, { useState, useEffect } from 'react';
import { Product, BankAccount, UserProfile, Order } from '../types';
import { DiamondIcon } from './DiamondIcon';
import { 
  X, 
  Upload, 
  Copy, 
  Check, 
  HelpCircle, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  FileCheck,
  Zap,
  Wallet,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface OrderModalProps {
  product: Product | null;
  bankAccounts: BankAccount[];
  currentUser: UserProfile | null;
  onClose: () => void;
  onOpenWalletModal?: () => void;
  onSubmitOrder: (newOrder: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  bankAccounts,
  currentUser,
  onClose,
  onOpenWalletModal,
  onSubmitOrder,
}) => {
  if (!product) return null;

  const userBalance = currentUser?.walletBalanceUSD || 0;
  const hasEnoughBalance = userBalance >= product.priceUSD;

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Datos Jugador & Pago, 2: Comprobante Baucher (if bank), 3: Resumen & Confirmación
  const [paymentMethod, setPaymentMethod] = useState<'wallet_balance' | 'bank_transfer'>(
    hasEnoughBalance ? 'wallet_balance' : 'bank_transfer'
  );
  const [selectedBank, setSelectedBank] = useState<BankAccount>(bankAccounts[0]);
  const [playerId, setPlayerId] = useState(currentUser?.playerIdDefault || '');
  const [playerTag, setPlayerTag] = useState(currentUser?.gamerTag || '');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.playerIdDefault) {
      setPlayerId(currentUser.playerIdDefault);
    }
    if (currentUser?.gamerTag) {
      setPlayerTag(currentUser.gamerTag);
    }
    if (currentUser?.preferredBank) {
      const match = bankAccounts.find(b => b.bankName.toLowerCase().includes(currentUser.preferredBank!.toLowerCase()));
      if (match) {
        setSelectedBank(match);
      }
    }
  }, [currentUser, bankAccounts]);

  const isGoldStyle = product.isGoldPromo || product.category === 'memberships';

  // Handle bank text copy
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankField(label);
    setTimeout(() => setCopiedBankField(null), 2000);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor sube una imagen válida (JPG, PNG, WEBP).');
        return;
      }
      setErrorMessage(null);
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // One-click demo receipt loader
  const handleUseDemoReceipt = () => {
    setReceiptImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');
    setReceiptFileName('comprobante_banco_pichincha_demo.jpg');
    setErrorMessage(null);
  };

  // Form submission validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId.trim()) {
      setErrorMessage('Debes ingresar obligatoriamente tu ID de jugador.');
      setStep(1);
      return;
    }
    if (paymentMethod === 'bank_transfer' && !receiptImage) {
      setErrorMessage('Debes subir obligatoriamente la imagen del comprobante de pago.');
      setStep(2);
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
      bankName: paymentMethod === 'wallet_balance' ? 'Saldo TunTun USD' : selectedBank.bankName,
      receiptUrl: paymentMethod === 'wallet_balance' ? 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80' : receiptImage!,
      receiptFileName: paymentMethod === 'wallet_balance' ? 'pago_saldo_tuntun.png' : (receiptFileName || 'comprobante_baucher.jpg'),
      paymentMethod,
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
            <span>1. ID & Banco</span>
          </div>
          <ArrowRight className="w-3 h-3 text-zinc-600" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-emerald-400' : ''}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step >= 2 ? 'bg-emerald-500 text-black' : 'bg-white/10 text-zinc-500'}`}>2</span>
            <span>2. Baucher</span>
          </div>
          <ArrowRight className="w-3 h-3 text-zinc-600" />
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-400' : ''}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step === 3 ? 'bg-emerald-500 text-black' : 'bg-white/10 text-zinc-500'}`}>3</span>
            <span>3. Confirmar</span>
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
          
          {/* STEP 1: PLAYER ID & BANK DATA */}
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

              {/* PAYMENT METHOD SELECTOR */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                  <span>2. Selecciona Método de Pago</span>
                  <span className="text-[11px] text-emerald-400">TunTun Store 🇪🇨</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Wallet Balance */}
                  <button
                    type="button"
                    onClick={() => {
                      if (hasEnoughBalance) {
                        setPaymentMethod('wallet_balance');
                        setErrorMessage(null);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'wallet_balance'
                        ? 'border-emerald-500 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'border-white/10 bg-black hover:bg-white/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                        <Wallet className="w-4 h-4" />
                        <span>Saldo TunTun USD</span>
                      </div>
                      {paymentMethod === 'wallet_balance' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-white">${userBalance.toFixed(2)}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">USD disponible</span>
                      </div>

                      {hasEnoughBalance ? (
                        <p className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current text-emerald-400" />
                          ⚡ Acreditación inmediata en 1 clic
                        </p>
                      ) : (
                        <div className="pt-1">
                          <span className="text-[10px] text-amber-400 font-bold block">
                            Saldo insuficiente (Faltan ${(product.priceUSD - userBalance).toFixed(2)})
                          </span>
                          {onOpenWalletModal && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenWalletModal();
                              }}
                              className="mt-1.5 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] uppercase rounded-lg shadow cursor-pointer inline-flex items-center gap-1"
                            >
                              <Wallet className="w-3 h-3" />
                              <span>Recargar Saldo USD</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Option B: Bank Transfer */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('bank_transfer');
                      setErrorMessage(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-amber-500 bg-amber-950/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'border-white/10 bg-black hover:bg-white/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
                        <Building2 className="w-4 h-4" />
                        <span>Transferencia Bancaria</span>
                      </div>
                      {paymentMethod === 'bank_transfer' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]"></span>
                      )}
                    </div>

                    <p className="text-[10px] text-zinc-400 mt-2 font-semibold">
                      Depósito Pichincha / Deuna / Produbanco. Adjuntas la foto de tu baucher.
                    </p>
                  </button>
                </div>
              </div>

              {/* Bank Accounts Selection (Only if Bank Transfer chosen) */}
              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-black text-zinc-300 uppercase tracking-wider">
                    Selecciona tu Banco de Preferencia:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {bankAccounts.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          selectedBank.id === bank.id
                            ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                            : 'border-white/10 bg-black hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Building2 className={`w-4 h-4 ${selectedBank.id === bank.id ? 'text-amber-400' : 'text-zinc-500'}`} />
                          {selectedBank.id === bank.id && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
                          )}
                        </div>
                        <p className="font-black text-xs uppercase text-white mt-2">{bank.bankName}</p>
                        <p className="text-[10px] text-zinc-400 truncate uppercase font-bold">{bank.accountType}</p>
                      </button>
                    ))}
                  </div>

                  {/* Selected Bank Details Card */}
                  <div className="p-4 rounded-xl bg-black text-white border border-amber-500/30 space-y-3 mt-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-black text-sm text-amber-400 flex items-center gap-1.5 uppercase">
                        <Building2 className="w-4 h-4" />
                        {selectedBank.bankName}
                      </span>
                      <span className="text-[10px] bg-white/10 text-zinc-300 px-2 py-0.5 rounded font-black uppercase">
                        {selectedBank.accountType}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase font-black block">Número de Cuenta</span>
                          <span className="font-mono text-sm font-black text-white">{selectedBank.accountNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedBank.accountNumber, 'num')}
                          className="p-1.5 rounded bg-white/10 hover:bg-amber-500 text-white transition-colors cursor-pointer"
                          title="Copiar número"
                        >
                          {copiedBankField === 'num' ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase font-black block">Titular</span>
                          <span className="font-bold text-xs text-white truncate">{selectedBank.holderName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(selectedBank.holderName, 'holder')}
                          className="p-1.5 rounded bg-white/10 hover:bg-amber-500 text-white transition-colors cursor-pointer"
                          title="Copiar titular"
                        >
                          {copiedBankField === 'holder' ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SUBIR COMPROBANTE DE PAGO (BAUCHER) - ONLY FOR BANK TRANSFER */}
              {step === 2 && paymentMethod === 'bank_transfer' && (
                <div className="space-y-6">
                  <div className="text-center max-w-md mx-auto space-y-1">
                    <h3 className="text-lg font-black text-white uppercase">Subir Comprobante de Pago (Baucher)</h3>
                    <p className="text-xs text-zinc-400 uppercase font-semibold">
                      Es obligatorio adjuntar la captura del comprobante bancario para verificar la transferencia.
                    </p>
                  </div>

                  {/* Upload Dropzone */}
                  <div className="border-2 border-dashed border-white/20 hover:border-emerald-500 rounded-2xl p-6 text-center transition-all bg-black hover:bg-emerald-500/5">
                    {receiptImage ? (
                      <div className="space-y-3">
                        <div className="relative max-w-xs mx-auto overflow-hidden rounded-xl border border-emerald-500/40 shadow-md">
                          <img src={receiptImage} alt="Comprobante" className="w-full max-h-56 object-cover" />
                          <div className="absolute top-2 right-2 bg-emerald-500 text-black p-1 rounded-full shadow">
                            <FileCheck className="w-4 h-4" />
                          </div>
                        </div>
                        <p className="text-xs font-black text-emerald-400 uppercase truncate">{receiptFileName}</p>
                        
                        <div className="flex items-center justify-center gap-2">
                          <label className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 font-black text-xs uppercase cursor-pointer">
                            <span>Cambiar imagen</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 py-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase">Haz clic para subir tu comprobante</p>
                          <p className="text-xs text-zinc-400 uppercase font-bold">Formatos: JPG, PNG, WEBP (Max 10MB)</p>
                        </div>
                        
                        <label className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase shadow-md transition-all cursor-pointer hover:bg-emerald-400">
                          <span>Seleccionar Archivo</span>
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Helper Demo Button */}
                  <div className="bg-amber-400/10 p-3 rounded-xl border border-amber-400/30 flex items-center justify-between">
                    <div className="text-xs text-amber-300 uppercase font-bold">
                      <p>¿Prueba rápida del sistema?</p>
                      <p className="text-[10px] text-amber-400/80">Usa un comprobante de prueba automático.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseDemoReceipt}
                      className="px-3 py-1.5 bg-amber-400 text-black hover:bg-amber-300 font-black text-xs uppercase rounded-lg shadow cursor-pointer whitespace-nowrap"
                    >
                      ⚡ Usar Baucher Demo
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 3: RESUMEN Y CONFIRMACIÓN */}
              {step === 3 && (
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
                        <span className="text-white">
                          {paymentMethod === 'wallet_balance' ? '💰 Saldo TunTun USD' : selectedBank.bankName}
                        </span>
                      </div>
                    </div>

                    {paymentMethod === 'wallet_balance' && (
                      <div className="mt-2 p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-bold">Nuevo Saldo tras compra:</span>
                        <span className="text-emerald-400 font-black font-mono">
                          ${(userBalance - product.priceUSD).toFixed(2)} USD
                        </span>
                      </div>
                    )}
                  </div>

                  {paymentMethod === 'bank_transfer' ? (
                    <div className="flex items-center gap-3 p-3.5 bg-black border border-white/10 text-white rounded-xl text-xs">
                      <ImageIcon className="w-8 h-8 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <p className="font-black uppercase text-white">Comprobante Baucher Adjunto</p>
                        <p className="text-zinc-400 truncate text-[11px] font-mono">{receiptFileName || 'comprobante_baucher.jpg'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                      <p className="font-black text-emerald-400 uppercase flex items-center gap-1">
                        <Zap className="w-4 h-4 fill-current text-emerald-400" />
                        <span>Pago Directo con Billetera</span>
                      </p>
                      <p className="text-zinc-300 font-medium">
                        Tu dinero guardado en la plataforma se descontará instantáneamente. No requiere verificación manual de baucher.
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-zinc-400 space-y-1 bg-black p-3.5 rounded-xl border border-white/10 uppercase font-semibold">
                    <p className="font-black text-emerald-400">⏱️ Tiempo estimado de entrega:</p>
                    <p>Tu orden ingresará al sistema con acreditación inmediata de 5 a 15 minutos.</p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-black border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 3 && paymentMethod === 'wallet_balance') {
                      setStep(1);
                    } else {
                      setStep((step - 1) as 1 | 2);
                    }
                  }}
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

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) {
                      if (!playerId.trim()) {
                        setErrorMessage('Por favor ingresa tu ID de jugador antes de continuar.');
                        return;
                      }
                      setErrorMessage(null);
                      if (paymentMethod === 'wallet_balance') {
                        setStep(3); // Skip step 2 for wallet payment!
                      } else {
                        setStep(2);
                      }
                    } else if (step === 2) {
                      if (!receiptImage) {
                        setErrorMessage('Por favor sube una imagen de comprobante antes de continuar.');
                        return;
                      }
                      setErrorMessage(null);
                      setStep(3);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer min-h-[44px]"
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
                  <span>
                    {paymentMethod === 'wallet_balance'
                      ? `Confirmar Pago con Saldo ($${product.priceUSD.toFixed(2)})`
                      : 'Confirmar y Registrar Pedido'}
                  </span>
                </button>
              )}
            </div>

      </div>
    </div>
  );
};
