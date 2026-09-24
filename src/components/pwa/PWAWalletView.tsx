import React, { useState, useEffect } from 'react';
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
  Loader2,
  Zap,
  ArrowLeft,
  X,
  Ban,
  Eye,
  EyeOff,
  ShoppingBag,
  User,
  Gamepad2,
  Mail,
  CheckCircle2,
  RotateCw,
  CreditCard,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { usePayPhone } from '../../hooks/usePayPhone';
import { payphoneService } from '../../services/payphoneService';
import { supabase } from '../../supabaseClient';
import { UserProfile, BankAccount, WalletTransaction } from '../../types';
import { triggerHaptic } from '../../utils/haptics';
import { copyTextToClipboard } from '../../utils/clipboard';
import { calculateFileHash, checkReceiptDuplicate } from '../../utils/receiptSecurity';

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
  bankAccounts = [],
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
  const [payphoneSuccess, setPayphoneSuccess] = useState<string | null>(null);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // PayPhone Hook
  const { confirmPayment, prepareTransaction, loading: payphoneLiveLoading, error: payphoneLiveError } = usePayPhone();
  const [payPhoneBoxActive, setPayPhoneBoxActive] = useState(false);
  const [payPhoneInitLoading, setPayPhoneInitLoading] = useState(false);
  const [payPhoneInitError, setPayPhoneInitError] = useState<string | null>(null);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const balance = currentUser.walletBalanceUSD ?? 0;

  const [isVerifyingHash, setIsVerifyingHash] = useState(false);

  // 🛡️ Detección de Recarga Pendiente Activa (Restricción de 1 Solicitud Pendiente)
  const activePendingTopUp = walletHistory.find(
    (tx) => tx.type === 'top_up' && tx.status === 'Pendiente'
  );

  const handleCopyPlayerId = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!id) return;
    try {
      const ok = await copyTextToClipboard(id);
      if (ok) {
        setCopiedField('playerId');
        triggerHaptic('success');
        setTimeout(() => setCopiedField(null), 1800);
      }
    } catch {
      // Fallback
    }
  };

  // Escuchar retornos de PayPhone en la URL (parámetros de consulta o hash)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);

    const id = searchParams.get('id') || hashParams.get('id');
    const clientTxId =
      searchParams.get('clientTransactionId') ||
      hashParams.get('clientTransactionId') ||
      searchParams.get('clientTxId') ||
      hashParams.get('clientTxId');

    if (id && clientTxId) {
      const procesarRetornoPayPhone = async () => {
        try {
          const res = await confirmPayment(id, clientTxId);
          if (res.success) {
            triggerHaptic('success');
            setPayphoneSuccess(`¡Recarga exitosa de $${(res.amount_usd || finalAmount).toFixed(2)} USD acreditada a tu billetera!`);
            localStorage.removeItem('tuntun_pending_payphone_order');
            setPayPhoneBoxActive(false);
            setActiveTab('history');
            window.history.replaceState(null, '', window.location.pathname + '#wallet');
          } else {
            triggerHaptic('error');
            setErrorMsg(res.error || 'No se pudo confirmar la transacción con PayPhone.');
          }
        } catch (err: any) {
          triggerHaptic('error');
          setErrorMsg(err.message || 'Error procesando confirmación de PayPhone');
        }
      };

      procesarRetornoPayPhone();
    }
  }, [confirmPayment, finalAmount]);

  // Escuchar mensaje postMessage desde el iframe modal
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PAYPHONE_PAYMENT_SUCCESS') {
        triggerHaptic('success');
        setPayphoneSuccess(`¡Recarga exitosa de $${(event.data.amount_usd || finalAmount).toFixed(2)} USD acreditada a tu billetera!`);
        setPayPhoneBoxActive(false);
        setActiveTab('history');
      }
    };
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [finalAmount]);

  const copyToClipboard = async (text: string, field: string) => {
    triggerHaptic('light');
    const ok = await copyTextToClipboard(text);
    if (ok) {
      triggerHaptic('success');
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // 1. La Regla de Oro: Validación de Hash SHA-256 en Selección de Imagen
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerHaptic('error');
      setErrorMsg('Por favor sube una imagen válida (JPG, PNG, WEBP).');
      return;
    }

    setErrorMsg('');
    setIsVerifyingHash(true);

    try {
      // Calcular Hash SHA-256 preliminar directo en el navegador
      const fileHash = await calculateFileHash(file);

      // Comprobar si ya existe en la base de datos (Global vía RPC o propio vía RLS)
      const isDuplicate = await checkReceiptDuplicate(fileHash);

      if (isDuplicate) {
        triggerHaptic('error');
        setErrorMsg('⚠️ Este comprobante ya fue registrado previamente en el sistema. Por favor espera a que sea verificado o sube un comprobante nuevo.');
        setReceiptFile(undefined);
        setReceiptImage(null);
        e.target.value = '';
        setIsVerifyingHash(false);
        return;
      }
    } catch (err) {
      console.warn('Verificación preliminar de hash SHA-256:', err);
    } finally {
      setIsVerifyingHash(false);
    }

    triggerHaptic('light');
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.isBlocked) {
      triggerHaptic('error');
      setErrorMsg('🚫 Tu cuenta se encuentra inhabilitada para recargas de saldo.');
      return;
    }
    if (activePendingTopUp) {
      triggerHaptic('error');
      setErrorMsg(`⏳ Ya tienes una recarga pendiente de $${Number(activePendingTopUp.amount).toFixed(2)} USD en revisión.`);
      return;
    }
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
      {/* 💎 TARJETA FLIPPABLE DELUXE TUN TUN NEO-WALLET 3D */}
      <div className="relative w-full select-none pt-1 pb-3 [perspective:1000px]">
        {/* Contenedor Giratorio 3D con transición suave */}
        <div 
          className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${
            isCardFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* ============================================================ */}
          {/* LADO FRONTAL (FRONT SIDE DE LA TARJETA)                     */}
          {/* ============================================================ */}
          <div 
            onClick={() => {
              triggerHaptic('medium');
              setIsCardFlipped(true);
            }}
            className={`relative w-full rounded-[28px] p-[1.5px] bg-gradient-to-b from-emerald-400/70 via-teal-500/25 to-emerald-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(16,185,129,0.25)] overflow-hidden [backface-visibility:hidden] cursor-pointer transition-opacity duration-300 ${
              isCardFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* Superficie de la tarjeta en obsidiana con micro-texturas y auroras fluidas */}
            <div className="relative rounded-[26.5px] bg-gradient-to-b from-[#0b2419] via-[#04120a] to-[#010805] overflow-hidden p-4 sm:p-5 flex flex-col justify-between min-h-[240px] sm:min-h-[255px]">
              {/* Trama de micro-puntos estilo cyberpunk / fintech */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />

              {/* Ondas líquidas fluidas tipo aurora y reflejo holográfico */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-emerald-400/40 via-teal-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-52 h-36 bg-gradient-to-b from-emerald-400/30 via-emerald-500/10 to-transparent rounded-bl-[90px] pointer-events-none border-b border-l border-emerald-400/25" />
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-transparent pointer-events-none" />

              {/* Marca de agua sutil del logotipo de TunTun en el fondo */}
              <div className="absolute -right-6 -bottom-6 w-40 h-40 opacity-[0.06] pointer-events-none">
                <img src="/logo-transparent.webp" alt="" className="w-full h-full object-contain filter invert" />
              </div>

              {/* 1. CABECERA: LOGO PURO SIN CONTENEDOR + ESTADO + BOTÓN GIRAR */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  {/* Logo Puro TunTun (Sin marco ni contenedor) */}
                  <img 
                    src="/logo-transparent.webp" 
                    alt="TunTun Store" 
                    className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.7)] shrink-0" 
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-black uppercase tracking-tight text-white leading-none">
                        TUNTUN <span className="text-emerald-400 italic">WALLET</span>
                      </span>
                    </div>
                    <span className="text-[8.5px] text-emerald-400/80 font-bold block mt-0.5 leading-none uppercase tracking-wider">
                      Digital Gamer Card
                    </span>
                  </div>
                </div>

                {/* Lado derecho: Estado Verificado + Botón Girar */}
                <div className="flex items-center gap-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-black/45 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300">
                      {currentUser.role === 'admin' ? 'Admin VIP' : 'Cuenta Activa'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('medium');
                      setIsCardFlipped(true);
                    }}
                    className="h-6 px-2 rounded-full bg-white/5 hover:bg-white/15 active:scale-90 border border-white/15 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-300 hover:text-white transition-all cursor-pointer shadow-sm"
                    title="Girar para ver reverso"
                  >
                    <RotateCw className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Girar</span>
                  </button>
                </div>
              </div>

              {/* 2. CENTRO: SALDO DISPONIBLE CON PRIVACIDAD */}
              <div className="my-2.5 relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-400/90">
                      Saldo Disponible
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  {/* Botón Ocultar / Mostrar Saldo */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      setIsBalanceHidden(!isBalanceHidden);
                    }}
                    className="h-6 px-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 flex items-center gap-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm"
                    title={isBalanceHidden ? 'Mostrar saldo' : 'Ocultar saldo'}
                  >
                    {isBalanceHidden ? (
                      <>
                        <EyeOff className="w-3 h-3 text-zinc-400" />
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Oculto</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span className="text-[8px] font-bold text-emerald-300 uppercase tracking-wider">Visible</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-[0_2px_16px_rgba(16,185,129,0.35)]">
                    {isBalanceHidden ? '••••••' : `$${balance.toFixed(2)}`}
                  </span>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm">
                    USD
                  </span>
                </div>
              </div>

              {/* 3. DATOS GENUINOS: USUARIO & ID FREE FIRE */}
              <div className="grid grid-cols-2 gap-3 py-2 px-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-emerald-500/20 relative z-10 shadow-inner">
                {/* Columna 1: Usuario */}
                <div className="min-w-0 pr-1 flex flex-col justify-center">
                  <div className="flex items-center gap-1 text-zinc-400 mb-0.5">
                    <User className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-[8px] uppercase font-bold text-zinc-400 tracking-wider">
                      Usuario
                    </span>
                  </div>
                  <span className="font-black text-white text-xs truncate block uppercase tracking-wide">
                    {currentUser.name || currentUser.gamerTag || 'Gamer TunTun'}
                  </span>
                  {currentUser.email && (
                    <span className="text-[9px] text-zinc-400 truncate block mt-0.5">
                      {currentUser.email}
                    </span>
                  )}
                </div>

                {/* Columna 2: ID Free Fire */}
                <div className="min-w-0 pl-3 border-l border-emerald-500/20 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Gamepad2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-[8px] uppercase font-bold text-zinc-400 tracking-wider">
                        ID Free Fire
                      </span>
                    </div>
                    {currentUser.playerIdDefault && (
                      <button
                        type="button"
                        onClick={(e) => handleCopyPlayerId(e, currentUser.playerIdDefault!)}
                        className="text-[8px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest flex items-center gap-0.5 cursor-pointer active:scale-90 transition-transform"
                        title="Copiar ID Free Fire"
                      >
                        {copiedField === 'playerId' ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {currentUser.playerIdDefault ? (
                    <div 
                      onClick={(e) => handleCopyPlayerId(e, currentUser.playerIdDefault!)}
                      className="font-mono font-black text-emerald-300 text-xs truncate tracking-wider cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                      title="Toca para copiar ID"
                    >
                      <span>{currentUser.playerIdDefault}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    </div>
                  ) : (
                    <span className="text-[9.5px] text-zinc-500 italic font-medium truncate">
                      Sin ID vinculado
                    </span>
                  )}
                </div>
              </div>

              {/* 4. PIE DE TARJETA: ACCIONES RÁPIDAS */}
              <div className="pt-2.5 flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-400/80 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>VIP Gamer Pass</span>
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      setActiveTab('topup');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:brightness-110 active:scale-95 text-black font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Recargar</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('light');
                      onNavigateToCatalog();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-emerald-400/30 text-emerald-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1 text-[11px] font-bold"
                    title="Ir al Catálogo de Diamantes"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden xs:inline">Catálogo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* LADO POSTERIOR (BACK SIDE: BRANDING DELUXE CON LOGO TUNTUN)  */}
          {/* ============================================================ */}
          <div 
            onClick={() => {
              triggerHaptic('medium');
              setIsCardFlipped(false);
            }}
            className={`absolute inset-0 w-full h-full rounded-[28px] p-[1.5px] bg-gradient-to-b from-emerald-400/70 via-teal-500/25 to-emerald-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(16,185,129,0.25)] overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer transition-opacity duration-300 ${
              isCardFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="relative w-full h-full rounded-[26.5px] bg-gradient-to-b from-[#072015] via-[#021008] to-[#010603] overflow-hidden flex flex-col justify-between p-4 sm:p-5">
              {/* Trama tech y aura central esmeralda profunda */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* 1. CABECERA POSTERIOR */}
              <div className="flex items-center justify-between relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300">
                    TunTun Gamer Pass
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('medium');
                    setIsCardFlipped(false);
                  }}
                  className="h-6 px-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-90 border border-emerald-400/30 flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-300 hover:text-white transition-all cursor-pointer shadow-sm"
                  title="Volver al frente"
                >
                  <RotateCw className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Volver</span>
                </button>
              </div>

              {/* 2. CENTRO: EL LOGO MÁS BACÁN CON AURA NEÓN */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
                <div className="relative group flex flex-col items-center">
                  <div className="absolute inset-0 bg-emerald-400/25 rounded-full blur-2xl scale-125 pointer-events-none animate-pulse" />
                  <img 
                    src="/logo-transparent.webp" 
                    alt="TunTun Store" 
                    className="relative z-10 h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.85)] group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="mt-2 text-center">
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-[0.35em] text-white drop-shadow-[0_2px_12px_rgba(16,185,129,0.5)] leading-tight">
                      TUNTUN <span className="text-emerald-400 italic">STORE</span>
                    </h3>
                    <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.25em] text-emerald-400/90 block mt-0.5">
                      Recargas Oficiales • Diamantes Free Fire
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. PIE POSTERIOR: RESUMEN DE IDENTIDAD GAMER */}
              <div className="relative z-10">
                <div className="p-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-emerald-500/20 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[7.5px] uppercase font-bold text-zinc-500 tracking-wider block">
                      Jugador
                    </span>
                    <span className="font-black text-white text-xs truncate block uppercase">
                      {currentUser.name || currentUser.gamerTag || 'Gamer TunTun'}
                    </span>
                  </div>
                  <div className="text-right shrink-0 pl-3 border-l border-emerald-500/20">
                    <span className="text-[7.5px] uppercase font-bold text-emerald-400/80 tracking-wider block">
                      ID Free Fire
                    </span>
                    <span className="font-mono font-black text-emerald-300 text-xs block">
                      {currentUser.playerIdDefault || 'Sin ID'}
                    </span>
                  </div>
                </div>
                <span className="text-[7.5px] text-zinc-500 font-semibold text-center block mt-1.5 tracking-wide">
                  Toca para volver al saldo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de Estado / Notificaciones */}
      {payphoneSuccess && (
        <div className="p-3 my-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{payphoneSuccess}</span>
          </div>
          <button
            onClick={() => setPayphoneSuccess(null)}
            className="text-zinc-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {currentUser.isBlocked && (
        <div className="p-3 my-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 shadow-md">
          <Ban className="w-4 h-4 text-rose-400 shrink-0" />
          <span>🚫 Tu cuenta se encuentra inhabilitada para recargas. Contacta a soporte por WhatsApp.</span>
        </div>
      )}

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

          {/* ============================================================ */}
          {/* CASO 1: YA TIENE UNA RECARGA PENDIENTE EN REVISIÓN           */}
          {/* (Restricción de 1 Solicitud Pendiente + Mitigación Ansiedad)   */}
          {/* ============================================================ */}
          {!isPayPhoneSelected && activePendingTopUp ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#141c10] via-[#0b140a] to-[#050c05] border-2 border-amber-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)] space-y-4">
              {/* Header con Badge de Estado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 block leading-tight">
                      Recarga en Verificación
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(activePendingTopUp.created_at).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })} • ID #{activePendingTopUp.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-400 text-black shadow-sm flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  En Revisión
                </span>
              </div>

              {/* Resumen del Monto Solicitado */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/20 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Monto en Revisión:</span>
                <span className="text-xl font-black font-mono text-amber-300">
                  ${Number(activePendingTopUp.amount).toFixed(2)} USD
                </span>
              </div>

              {/* Mensaje de Mitigación Psicológica */}
              <div className="space-y-2">
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  ⏳ <strong className="text-white">Tienes una recarga de ${Number(activePendingTopUp.amount).toFixed(2)} USD en revisión.</strong> Nuestro equipo la está procesando en orden de llegada para evitar duplicados y proteger tu saldo.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400 w-full justify-center">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tiempo promedio de atención: 5 a 15 minutos</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-1 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    const phone = '593968729952';
                    const msg = `Hola TunTun Store, tengo una solicitud de recarga en revisión de $${Number(activePendingTopUp.amount).toFixed(2)} USD (ID: #${activePendingTopUp.id.slice(0, 8)}). Quisiera consultar el estado.`;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <MessageCircle className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Agilizar o Consultar por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('history');
                  }}
                  className="w-full py-2.5 text-center text-xs text-zinc-400 hover:text-white font-bold transition-colors cursor-pointer"
                >
                  Ver en Historial de Movimientos →
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Selector de Monto (Chips táctiles) */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block mb-2">
                  2. Monto a Recargar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-2">
                  {(isPayPhoneSelected ? PAYPHONE_PRESET_AMOUNTS : PRESET_AMOUNTS).map((amt) => {
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
                    <div className="text-right">
                      <span className="text-xs font-black text-white block">{selectedBank.bankName}</span>
                      {selectedBank.accountType && (
                        <span className="text-[10px] text-emerald-400 font-medium block">{selectedBank.accountType}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                    <span className="text-[11px] text-zinc-400 font-bold">Número de Cuenta:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedBank.accountNumber, 'acc')}
                      className="flex items-center gap-1.5 font-mono font-black text-xs text-emerald-400 hover:text-emerald-300 active:text-white cursor-pointer active:scale-95 transition-all select-none py-0.5"
                      title="Toca para copiar número de cuenta"
                    >
                      <span>{selectedBank.accountNumber}</span>
                      {copiedField === 'acc' ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-black animate-in fade-in duration-150">
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                          <span>¡Copiado!</span>
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-emerald-500 hover:text-emerald-400 shrink-0 transition-colors" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                    <span className="text-[11px] text-zinc-400 font-bold">Titular:</span>
                    <span className="text-xs font-bold text-zinc-200">{selectedBank.holderName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold">Cédula / RUC:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedBank.holderId, 'idNum')}
                      className="flex items-center gap-1.5 font-mono font-black text-xs text-emerald-400 hover:text-emerald-300 active:text-white cursor-pointer active:scale-95 transition-all select-none py-0.5"
                      title="Toca para copiar cédula o RUC"
                    >
                      <span>{selectedBank.holderId}</span>
                      {copiedField === 'idNum' ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-black animate-in fade-in duration-150">
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                          <span>¡Copiado!</span>
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-emerald-500 hover:text-emerald-400 shrink-0 transition-colors" />
                      )}
                    </button>
                  </div>
                  {selectedBank.notes && (
                    <div className="pt-1 text-[10px] text-amber-300/90 italic bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      💡 {selectedBank.notes}
                    </div>
                  )}
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
                    <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/50 bg-[#061711] cursor-pointer transition-colors text-center relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isVerifyingHash}
                        className="hidden"
                      />
                      {isVerifyingHash ? (
                        <div className="py-4 flex flex-col items-center gap-2 text-emerald-400">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="text-xs font-black">Verificando comprobante por seguridad...</span>
                        </div>
                      ) : receiptImage ? (
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
                    <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !receiptFile || isVerifyingHash}
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
            </>
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
                      {tx.admin_note && (
                        <span className="text-[10px] text-amber-300/90 block leading-tight mt-1 italic">
                          Nota: {tx.admin_note}
                        </span>
                      )}
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

      {/* 🚀 PANTALLA COMPLETA NATIVA DE PASARELA DE PAGO PAYPHONE */}
      {payPhoneBoxActive && (
        <div className="fixed inset-0 z-[150] w-screen h-[100dvh] bg-white text-slate-900 flex flex-col overflow-hidden select-none animate-in fade-in duration-150">
          {/* Barra Superior Minimalista */}
          <div className="h-12 sm:h-13 px-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 z-20 pt-[env(safe-area-inset-top,0px)]">
            <button
              type="button"
              onClick={handleClosePayPhone}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
              <span>Volver</span>
            </button>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-xs font-semibold text-gray-400">Total:</span>
              <span className="text-sm font-black text-orange-600">
                ${finalAmount.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Área 100% limpia para la pasarela oficial PayPhone (sin contenedores, ni banners decorativos) */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start bg-white pt-2 pb-12 pb-[env(safe-area-inset-bottom,0px)]">
            {payPhoneInitLoading && (
              <div className="w-full py-24 flex flex-col items-center justify-center gap-3 text-gray-500">
                <div className="w-9 h-9 rounded-full border-3 border-orange-500 border-t-transparent animate-spin" />
                <span className="text-xs font-medium text-gray-600">Cargando pasarela de pago...</span>
              </div>
            )}

            {/* Inyección directa en el DOM de la pasarela PayPhone */}
            <div
              id="pwa-payphone-element"
              className={`w-full max-w-lg transition-opacity duration-200 ${
                payPhoneInitLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
