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
  Ban, 
  CreditCard, 
  Loader2,
  ShieldCheck,
  Zap,
  X,
  ArrowLeft
} from 'lucide-react';
import { usePayPhone } from '../hooks/usePayPhone';
import { payphoneService } from '../services/payphoneService';
import { supabase } from '../supabaseClient';
import { UserProfile, BankAccount, WalletTransaction } from '../types';

interface WalletViewProps {
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

export const WalletView: React.FC<WalletViewProps> = ({
  currentUser,
  bankAccounts,
  walletHistory = [],
  onSubmitTopUpOrder,
  onNavigateToCatalog,
  onPayPhoneGatewayStateChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'topup' | 'history'>('topup');
  
  // Selección de Método: ID de banco (por defecto el primero) o 'payphone'
  const [selectedMethodId, setSelectedMethodId] = useState<string>(bankAccounts[0]?.id || PAYPHONE_METHOD_ID);
  const isPayPhoneSelected = selectedMethodId === PAYPHONE_METHOD_ID;
  
  const selectedBank = bankAccounts.find(b => b.id === selectedMethodId) || bankAccounts[0];

  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | undefined>(undefined);
  const [, setReceiptFileName] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [payphoneSuccess, setPayphoneSuccess] = useState<string | null>(null);
  const [mostrarCajita, setMostrarCajita] = useState<boolean>(false);
  const [cargandoCajita, setCargandoCajita] = useState<boolean>(false);

  const { confirmPayment, prepareTransaction, loading: payphoneLiveLoading, error: payphoneLiveError } = usePayPhone();

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  // Escuchar retornos de PayPhone en la URL (parámetros de consulta o hash) sin salir de la tienda
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);

    const id = searchParams.get('id') || hashParams.get('id');
    const clientTxId = searchParams.get('clientTransactionId') || hashParams.get('clientTransactionId') || searchParams.get('clientTxId') || hashParams.get('clientTxId');

    if (id && clientTxId) {
      const procesarRetornoPayPhone = async () => {
        try {
          const res = await confirmPayment(id, clientTxId);
          if (res.success) {
            setPayphoneSuccess(`¡Recarga exitosa de $${(res.amount_usd || finalAmount).toFixed(2)} USD acreditada a tu billetera!`);
            localStorage.removeItem('tuntun_pending_payphone_order');
            setMostrarCajita(false);
            setActiveSubTab('history');
            window.history.replaceState(null, '', window.location.pathname + '#wallet');
          } else {
            setErrorMessage(res.error || 'No se pudo confirmar la transacción con PayPhone.');
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'Error procesando confirmación de PayPhone');
        }
      };

      procesarRetornoPayPhone();
    }
  }, [confirmPayment, finalAmount]);

  // Escuchar mensaje postMessage desde el iframe modal si aplica
  React.useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PAYPHONE_PAYMENT_SUCCESS') {
        setPayphoneSuccess(`¡Recarga exitosa de $${(event.data.amount_usd || finalAmount).toFixed(2)} USD acreditada a tu billetera!`);
        setMostrarCajita(false);
        setActiveSubTab('history');
      }
    };
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [finalAmount]);

  // Bloquear scroll del fondo en móviles y notificar al contenedor principal cuando la pasarela está activa
  React.useEffect(() => {
    onPayPhoneGatewayStateChange?.(mostrarCajita);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (mostrarCajita && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      onPayPhoneGatewayStateChange?.(false);
    };
  }, [mostrarCajita, onPayPhoneGatewayStateChange]);

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
      if (receiptImage && receiptImage.startsWith('blob:')) {
        URL.revokeObjectURL(receiptImage);
      }
      setReceiptImage(URL.createObjectURL(file));
    }
  };

  const isDeployingCajitaRef = React.useRef(false);

  // Desplegar la Cajita Oficial Inline de PayPhone v2.0 dentro de TunTun Store
  const handleDesplegarCajita = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isDeployingCajitaRef.current || cargandoCajita) return;
    if (currentUser.isBlocked) {
      setErrorMessage('🚫 Tu cuenta se encuentra inhabilitada para recargas de saldo.');
      return;
    }
    if (finalAmount < 1) {
      setErrorMessage('El monto mínimo para PayPhone es de $1.00 USD.');
      return;
    }
    if (finalAmount > 500) {
      setErrorMessage('El monto máximo por recarga con PayPhone es de $500.00 USD.');
      return;
    }

    isDeployingCajitaRef.current = true;
    setErrorMessage(null);
    setMostrarCajita(true);
    setCargandoCajita(true);

    const clientTxId = `tuntun_${currentUser.uid.slice(0, 6)}_${Date.now()}`;
    const pendingData = {
      amount: finalAmount,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.name,
      clientTxId,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('tuntun_pending_payphone_order', JSON.stringify(pendingData));

    // Registrar transacción inicial en BD
    await prepareTransaction(currentUser.uid, finalAmount, clientTxId);

    try {
      await payphoneService.ensureLoaded();
      setTimeout(() => {
        const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 1024;
        const targetContainer = isMobileScreen ? 'pp-button-mobile' : 'pp-button-desktop';
        
        let ok = payphoneService.renderPaymentBox({
          containerId: targetContainer,
          total: finalAmount,
          clientTransactionId: clientTxId,
          reference: `Recarga TunTun Store ${currentUser.name || 'Cliente'}`,
          email: currentUser.email,
          phoneNumber: currentUser.phone || undefined,
        });

        if (!ok) {
          payphoneService.renderPaymentBox({
            containerId: isMobileScreen ? 'pp-button-desktop' : 'pp-button-mobile',
            total: finalAmount,
            clientTransactionId: clientTxId,
            reference: `Recarga TunTun Store ${currentUser.name || 'Cliente'}`,
            email: currentUser.email,
            phoneNumber: currentUser.phone || undefined,
          });
        }
        setCargandoCajita(false);
        isDeployingCajitaRef.current = false;
      }, 300);
    } catch (err: any) {
      isDeployingCajitaRef.current = false;
      setCargandoCajita(false);
      setErrorMessage(err.message || 'Error cargando la pasarela PayPhone');
    }
  };

  // Enviar recarga vía Transferencia Bancaria
  const handleBankTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.isBlocked) {
      setErrorMessage('🚫 Tu cuenta se encuentra inhabilitada para recargas de saldo. Contacta a soporte.');
      return;
    }
    if (finalAmount < 5) {
      setErrorMessage('El monto mínimo de recarga bancaria es de $5 USD.');
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

  const renderPayPhoneDetails = (isMobile: boolean) => {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-orange-500/30 text-white space-y-3.5 shadow-xl relative overflow-hidden ${isMobile ? 'mt-3 animate-in fade-in slide-in-from-top-1' : ''}`}>
        
        {/* Header con Logo y Badge */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/payphone-orange.webp" alt="PayPhone" className="w-7 h-5 object-contain" />
            <div>
              <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-orange-400">PayPhone Ecuador</h3>
              <p className="text-[10px] text-zinc-400">Pasarela 100% automatizada</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Instantáneo ⚡
          </span>
        </div>

        {/* Métodos Aceptados */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-zinc-300 py-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#1a1f71] bg-white px-2 py-0.5 rounded font-black italic text-[11px] leading-tight">VISA</span>
            <span className="text-amber-400 text-xs">MasterCard</span>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 text-xs">Diners</span>
            <span className="text-zinc-600">•</span>
            <span className="text-orange-400 text-xs">Discover</span>
          </div>
          <span className="text-emerald-400 text-xs font-black bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            + App Saldo
          </span>
        </div>

        {/* 2 Micro-Badges Visuales y Concisos */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-black text-xs text-white leading-tight">Sin Esperas</p>
              <p className="text-[10px] text-zinc-400 truncate">Acreditación directa</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-black text-xs text-white leading-tight">100% Seguro</p>
              <p className="text-[10px] text-zinc-400 truncate">3D Secure 2.0</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-28 md:pb-12">
      
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
            Recarga saldo al instante con PayPhone (tarjetas) o mediante transferencia bancaria.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-7 bg-zinc-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            
            {/* Header del Método Seleccionado */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                  {isPayPhoneSelected ? (
                    <>
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      Recarga con Tarjeta / PayPhone
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5 text-amber-400" />
                      Recarga vía Transferencia Bancaria
                    </>
                  )}
                </h2>
              </div>
              <p className="text-xs text-zinc-400">
                {isPayPhoneSelected 
                  ? 'Paga de forma 100% automatizada con tarjeta de crédito, débito o saldo PayPhone sin subir comprobantes.'
                  : 'Transfiere a nuestras cuentas bancarias y sube el baucher para validación de nuestro equipo.'}
              </p>
            </div>

            {/* SELECCIÓN DE MÉTODO DE PAGO / BANCO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-wider block">
                  Selecciona tu Método de Pago
                </label>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">4 Opciones Disponibles</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* OPCIONES DE BANCOS TRADICIONALES (Primeras Opciones) */}
                {bankAccounts.map(bank => {
                  const isSelected = selectedMethodId === bank.id;
                  const isGuayaquil = bank.bankName.toLowerCase().includes('guayaquil');
                  const isPichincha = bank.bankName.toLowerCase().includes('pichincha');
                  const isBinance = bank.bankName.toLowerCase().includes('binance');

                  const accentColor = isGuayaquil 
                    ? 'border-rose-500 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.25)] ring-1 ring-rose-400/50' 
                    : isPichincha 
                    ? 'border-yellow-500 bg-yellow-500/15 shadow-[0_0_20px_rgba(234,179,8,0.25)] ring-1 ring-yellow-400/50'
                    : isBinance
                    ? 'border-amber-400 bg-amber-400/15 shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-1 ring-amber-300/50'
                    : 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50';

                  const badgeColor = isGuayaquil 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                    : isPichincha 
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                    : isBinance
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                  return (
                    <div key={bank.id} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMethodId(bank.id);
                          setErrorMessage(null);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? accentColor
                            : 'border-white/10 bg-black/60 hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className="font-black text-xs uppercase text-white truncate max-w-[140px] tracking-wide">
                            {bank.bankName}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${badgeColor}`}>
                            {isBinance ? 'USDT' : 'Transferencia'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase">
                          <span>{bank.accountType}</span>
                          <Building2 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                      </button>
                      
                      {/* Accordion para Mobile */}
                      {isSelected && (
                        <div className="lg:hidden mt-2">
                          {renderBankDetails(true)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* OPCIÓN PAYPHONE (Última Opción - Destacada) */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethodId(PAYPHONE_METHOD_ID);
                      setErrorMessage(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                      isPayPhoneSelected
                        ? 'border-orange-500 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 shadow-[0_0_25px_rgba(249,115,22,0.35)] ring-1 ring-orange-400/60'
                        : 'border-white/10 bg-black/60 hover:bg-white/5 hover:border-orange-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="font-black text-xs uppercase text-white flex items-center gap-2 tracking-wide">
                        <img src="/payphone-orange.webp" alt="PayPhone" className="w-5 h-3.5 object-contain" />
                        PayPhone Ecuador
                      </span>
                      <span className="px-2 py-0.5 bg-orange-500/25 border border-orange-400/40 rounded-md text-[9px] font-black text-orange-300 uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                        Auto ⚡
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                      <span>Tarjetas Crédito / Débito / App</span>
                    </span>
                  </button>

                  {/* Accordion para Mobile */}
                  {isPayPhoneSelected && (
                    <div className="lg:hidden mt-2">
                      {renderPayPhoneDetails(true)}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* FORMULARIO DINÁMICO SEGÚN EL MÉTODO SELECCIONADO */}
            {isPayPhoneSelected ? (
              // ================================================================
              // VISTA / FORMULARIO PAYPHONE
              // ================================================================
              <div className="space-y-6 pt-2">
                
                {/* Monto a recargar PayPhone */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                      Monto a Recargar con PayPhone (USD)
                    </label>
                    <span className="text-[10px] text-orange-400 font-bold uppercase">Mínimo $1.00 USD</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {PAYPHONE_PRESET_AMOUNTS.map(amount => (
                      <button
                        key={amount}
                        type="button"
                        disabled={mostrarCajita}
                        onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                        className={`px-4 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                          selectedAmount === amount && !customAmount
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] ring-1 ring-orange-300'
                            : 'bg-black text-zinc-400 border border-white/10 hover:border-orange-500/50 hover:text-white'
                        } ${mostrarCajita ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        ${amount}
                      </button>
                    ))}
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-black">$</span>
                      <input
                        type="number"
                        placeholder="Otro"
                        disabled={mostrarCajita}
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount(0);
                        }}
                        className={`w-24 pl-7 pr-3 py-2.5 bg-black border border-white/10 rounded-xl text-sm font-black text-white focus:outline-none focus:border-orange-500 transition-colors ${mostrarCajita ? 'opacity-60 cursor-not-allowed' : ''}`}
                        min="1"
                        max="500"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Previsualización Informativa de Saldo */}
                  {finalAmount >= 1 && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl font-bold animate-in fade-in">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        Se acreditarán <strong>+${finalAmount.toFixed(2)} USD</strong> en tu cuenta listos para canjear en la tienda.
                      </span>
                    </div>
                  )}
                </div>

                {/* Resumen del Pago */}
                <div className="p-4 sm:p-5 bg-black/70 border border-orange-500/30 rounded-2xl space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
                    <span>Monto de Recarga</span>
                    <span className="text-white font-mono">${finalAmount.toFixed(2)} USD</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-bold">
                    <span>Saldo a Acreditar en Billetera</span>
                    <span className="text-emerald-400 font-mono font-bold">+${finalAmount.toFixed(2)} USD</span>
                  </div>
                  <div className="border-t border-white/10 pt-2.5 flex items-center justify-between font-black text-sm">
                    <span className="text-white uppercase">Total a Pagar</span>
                    <span className="text-orange-400 font-mono text-lg">${finalAmount.toFixed(2)} USD</span>
                  </div>
                </div>

                {(errorMessage || payphoneLiveError) && (
                  <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-black flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage || payphoneLiveError}</span>
                  </div>
                )}

                {payphoneSuccess && (
                  <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-black flex items-center gap-3 animate-in zoom-in-95">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{payphoneSuccess}</span>
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
                  <div className="space-y-4 pt-1">
                    {!mostrarCajita ? (
                      <button
                        type="button"
                        onClick={() => handleDesplegarCajita()}
                        disabled={finalAmount < 1 || payphoneLiveLoading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 text-black font-black text-sm uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                      >
                        {payphoneLiveLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Iniciando Pasarela PayPhone...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-black fill-black" />
                            <span>Pagar ${finalAmount.toFixed(2)} USD con Tarjeta / PayPhone</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      /* En PC: Indicador estético en la columna izquierda cuando la pasarela está activa a la derecha */
                      <div className="hidden lg:flex items-center justify-between p-4 bg-orange-500/15 border border-orange-500/30 rounded-2xl animate-in fade-in">
                        <div className="flex items-center gap-2.5 text-xs font-black text-orange-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
                          <span>Pasarela activa en el panel derecho 👉</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMostrarCajita(false)}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase transition-colors cursor-pointer border border-white/10"
                        >
                          Cambiar Monto
                        </button>
                      </div>
                    )}

                    {/* En Móvil: Pantalla Completa Estática (< lg / Teléfonos móviles) */}
                    {mostrarCajita && (
                      <div className="lg:hidden fixed inset-0 z-[99999] w-screen h-[100dvh] bg-[#09090b] flex flex-col justify-between overflow-hidden touch-none select-none p-2 animate-in fade-in duration-150">
                        
                        {/* Barra Superior Móvil */}
                        <header className="h-11 w-full max-w-md mx-auto px-2 flex items-center justify-between z-30 shrink-0">
                          <button
                            type="button"
                            onClick={() => setMostrarCajita(false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-black uppercase transition-all cursor-pointer border border-white/15 shadow-sm"
                          >
                            <ArrowLeft className="w-4 h-4 text-orange-400" />
                            <span>Volver</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#FF6A00] text-white font-black text-[11px] rounded tracking-wider shadow">
                              PayPhone
                            </span>
                            <span className="text-xs font-black font-mono text-orange-400">
                              ${finalAmount.toFixed(2)} USD
                            </span>
                          </div>
                        </header>

                        {/* Área Central Estática Móvil */}
                        <main className="flex-1 w-full max-w-md mx-auto flex items-center justify-center relative overflow-hidden my-auto">
                          {cargandoCajita && (
                            <div className="absolute inset-0 bg-[#09090b]/95 z-20 flex flex-col items-center justify-center gap-2.5 text-zinc-400">
                              <div className="w-10 h-10 animate-spin rounded-full border-4 border-[#FF6A00] border-t-transparent shadow-[0_0_20px_#FF6A00]" />
                              <span className="text-xs font-bold text-white">Cargando Pasarela PayPhone...</span>
                            </div>
                          )}

                          {/* Contenedor DOM oficial Móvil */}
                          <div id="pp-button-mobile" className="w-full flex justify-center items-center overflow-hidden" />
                        </main>

                        <div className="h-2 shrink-0" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // ================================================================
              // VISTA / FORMULARIO TRANSFERENCIA BANCARIA
              // ================================================================
              <form onSubmit={handleBankTopUp} className="space-y-6 pt-2">
                
                {/* Monto a recargar Banco */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                      Monto a Recargar (USD)
                    </label>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Mínimo $5.00 USD</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {PRESET_AMOUNTS.map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                        className={`px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
                          selectedAmount === amount && !customAmount
                            ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : 'bg-black text-zinc-400 border border-white/10 hover:border-amber-500/50 hover:text-white'
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
                        className="w-24 pl-7 pr-3 py-2 bg-black border border-white/10 rounded-xl text-sm font-black text-white focus:outline-none focus:border-amber-500 transition-colors"
                        min="5"
                        step="0.01"
                      />
                    </div>
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
            )}

          </div>

          {/* Info Side (Datos del Banco o Información PayPhone / Pasarela Desktop) - Desktop Only */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
            {isPayPhoneSelected ? (
              mostrarCajita ? (
                /* ========================================================================= */
                /* 💻 EN PC: LA PASARELA REEMPLAZA EL PANEL DERECHO (Ajustada y Elegante)    */
                /* ========================================================================= */
                <div className="bg-zinc-950/90 rounded-3xl border border-orange-500/50 p-4 sm:p-5 shadow-[0_0_35px_rgba(249,115,22,0.2)] relative max-w-[460px] mx-auto space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-[#FF6A00] text-white font-black text-xs rounded tracking-wider shadow">
                        PayPhone
                      </span>
                      <span className="text-xs font-bold text-zinc-200">Cajita Oficial de Pagos</span>
                    </div>
                    <span className="text-sm font-black font-mono text-orange-400">
                      ${finalAmount.toFixed(2)} USD
                    </span>
                  </div>

                  {/* Envoltura ajustada para la cajita de PayPhone con esquinas redondeadas y sin exceso de espacio en blanco */}
                  <div className="rounded-2xl overflow-hidden bg-white shadow-md relative flex items-center justify-center p-1 sm:p-2 border border-zinc-200">
                    {cargandoCajita && (
                      <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center gap-2 text-zinc-600 rounded-xl">
                        <div className="w-8 h-8 animate-spin rounded-full border-4 border-[#FF6A00] border-t-transparent" />
                        <span className="text-xs font-bold text-zinc-800">Cargando formulario seguro...</span>
                      </div>
                    )}
                    {/* Contenedor DOM oficial Desktop */}
                    <div id="pp-button-desktop" className="w-full flex justify-center items-center" />
                  </div>

                  <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-semibold text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      Pago 100% seguro (PCI-DSS)
                    </span>
                    <button
                      type="button"
                      onClick={() => setMostrarCajita(false)}
                      className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase transition-colors cursor-pointer border border-white/10"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                renderPayPhoneDetails(false)
              )
            ) : selectedBank ? (
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
                        {txn.admin_note && (
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {txn.admin_note}
                          </p>
                        )}
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
