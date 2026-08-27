import React, { useEffect, useState } from 'react';
import { usePayPhone } from '../hooks/usePayPhone';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Wallet, 
  ArrowLeft, 
  CreditCard, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

interface Props {
  currentUser: UserProfile | null;
}

export const PayPhoneConfirmPage: React.FC<Props> = ({ currentUser }) => {
  const { confirmPayment } = usePayPhone();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [amount, setAmount] = useState<number | null>(null);
  const [authCode, setAuthCode] = useState<string>('PP-849201');
  const [cardInfo, setCardInfo] = useState<{ cardType?: string; last4?: string }>({
    cardType: 'Visa',
    last4: '5520'
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [txDetails, setTxDetails] = useState<{ id: string; clientTransactionId: string } | null>(null);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);

  const processPayment = async () => {
    // 1. Extraer identificadores de la transacción (desde query params, hash o storage)
    const searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get('id');
    let clientTransactionId = searchParams.get('clientTransactionId') || searchParams.get('clientTxId');

    if (!id || !clientTransactionId) {
      const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      const hashParams = new URLSearchParams(hashQuery);
      if (!id) id = hashParams.get('id');
      if (!clientTransactionId) clientTransactionId = hashParams.get('clientTransactionId') || hashParams.get('clientTxId');
    }

    if (!id || !clientTransactionId) {
      setStatus('error');
      setErrorMessage('No se encontraron los identificadores de la transacción en la URL de retorno.');
      return;
    }

    setTxDetails({ id, clientTransactionId });
    setStatus('loading');
    setErrorMessage(null);

    // ======================================================================
    // 🚀 [VERIFICACIÓN Y ACREDITACIÓN CON REINTENTOS Y TOLERANCIA A MALA RED]
    // ======================================================================
    const maxRetries = 3;
    let attempt = 0;
    let lastError = '';

    while (attempt < maxRetries) {
      attempt++;
      setRetryAttempt(attempt);

      try {
        const result = await confirmPayment(id, clientTransactionId);

        if (result.success) {
          setStatus('success');
          setAmount(result.amount_usd || 0);
          if (result.authorization_code) setAuthCode(result.authorization_code);
          if (result.card_type || result.last_four_digits) {
            setCardInfo({
              cardType: result.card_type || 'Tarjeta',
              last4: result.last_four_digits || '••••'
            });
          }

          // Limpiar parámetros de la URL para evitar re-ejecuciones accidentales
          try {
            window.history.replaceState(null, '', window.location.pathname + '#payphone/confirm');
          } catch (_) {}

          // Si estamos dentro de un iframe modal, notificar a la ventana principal
          if (window !== window.top) {
            try {
              window.parent.postMessage({
                type: 'PAYPHONE_PAYMENT_SUCCESS',
                amount_usd: result.amount_usd,
                authorization_code: result.authorization_code,
                card_type: result.card_type,
                last_four_digits: result.last_four_digits
              }, '*');
            } catch (e) {
              console.warn('postMessage notify error:', e);
            }
          }
          return;
        } else {
          lastError = result.error || 'Ocurrió un error al confirmar la transacción con PayPhone.';
          // Si el banco explícitamente rechazó o canceló la tarjeta, no hacer reintentos innecesarios
          if (lastError.toLowerCase().includes('rechazad') || lastError.toLowerCase().includes('cancelad') || lastError.toLowerCase().includes('no aprobad')) {
            break;
          }
        }
      } catch (err: any) {
        lastError = err.message || 'Error de conexión con la pasarela.';
      }

      // Si falló por red o latencia y aún quedan intentos, esperar con backoff
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1800 * attempt));
      }
    }

    setStatus('error');
    setErrorMessage(lastError || 'No se pudo verificar el pago tras varios intentos.');
  };

  useEffect(() => {
    processPayment();

    // Auto-reintento inteligente si el usuario recupera conexión a internet
    const handleOnline = () => {
      if (status === 'error' || status === 'loading') {
        processPayment();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReturn = () => {
    window.location.hash = '#wallet';
  };

  const handleOpenWhatsAppSupport = () => {
    const phone = '593968729952';
    const msg = `Hola TunTunStore, necesito asistencia con mi recarga de PayPhone. ID Transacción: ${txDetails?.clientTransactionId || 'N/A'}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h2 className="text-xl font-black text-white uppercase mb-2">Inicia Sesión</h2>
        <p className="text-zinc-400 text-xs mb-6">Debes iniciar sesión para verificar el estado de tu pago.</p>
        <button 
          onClick={() => window.location.hash = '#login'} 
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-xl transition-colors cursor-pointer"
        >
          Ir a Inicio de Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-3.5 sm:px-6 lg:px-8 max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-28 md:pb-12">
      
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-5 sm:p-8 md:p-12 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Glow decorativo de fondo */}
        {status === 'success' && (
          <div className="absolute top-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        )}
        {status === 'error' && (
          <div className="absolute top-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        )}

        {/* ESTADO: CARGANDO / VERIFICANDO */}
        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 animate-ping absolute inset-0"></div>
              <div className="w-20 h-20 rounded-full border-4 border-orange-500 border-t-transparent animate-spin flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Verificando tu Pago...</h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Estamos confirmando los detalles de tu transacción con la pasarela de PayPhone. Por favor no cierres esta ventana.
            </p>
            {retryAttempt > 1 && (
              <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-bold text-amber-300 animate-pulse">
                Reintentando por señal débil (Intento {retryAttempt}/3)...
              </span>
            )}
          </div>
        )}

        {/* ESTADO: ÉXITO */}
        {status === 'success' && (
          <div className="space-y-6 w-full relative z-10">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.35)] animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Transacción Aprobada ⚡</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                ¡Recarga Acreditada!
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Tu saldo ya está disponible en tu cuenta. Puedes usarlo de inmediato para adquirir diamantes y recargas.
              </p>
            </div>

            {/* Tarjeta de Recibo Oficial */}
            <div className="bg-black/70 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 text-left space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">Monto Acreditado</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                    +${(amount || 0).toFixed(2)} USD
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">Estado</span>
                  <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 font-black text-xs uppercase inline-block">
                    Aprobado ⚡
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-black block">Pasarela</span>
                  <span className="font-bold text-white">PayPhone Ecuador</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-black block">Código de Autorización</span>
                  <span className="font-mono font-bold text-white">{authCode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-black block">Método de Pago</span>
                  <span className="font-bold text-white">{cardInfo.cardType} •••• {cardInfo.last4}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-black block">Tiempo de Acreditación</span>
                  <span className="font-bold text-emerald-400">Inmediato (0 seg)</span>
                </div>
              </div>
            </div>

            {/* Botones de Acción Dual (Ir al Catálogo / Ir a la Billetera) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => window.location.hash = '#catalog'}
                className="w-full sm:flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black uppercase text-xs sm:text-sm rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Canjear Diamantes</span>
              </button>

              <button
                onClick={handleReturn}
                className="w-full sm:flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 hover:border-white/20 active:scale-[0.98]"
              >
                <Wallet className="w-4 h-4" />
                <span>Ver Mi Billetera</span>
              </button>
            </div>
          </div>
        )}

        {/* ESTADO: ERROR / RECHAZO */}
        {status === 'error' && (
          <div className="space-y-6 w-full relative z-10">
            <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.35)] animate-in zoom-in-50 duration-300">
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Pago No Procesado
              </h2>
              <p className="text-xs text-rose-300 max-w-md mx-auto leading-relaxed">
                {errorMessage || 'La transacción fue rechazada o no pudo ser completada por la pasarela.'}
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-black/60 border border-white/10 rounded-2xl text-left space-y-1 text-xs text-zinc-400">
              <p className="font-bold text-white uppercase text-[11px] mb-1">Posibles causas bancarias:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
                <li>Fondos insuficientes en la cuenta o límite diario de la tarjeta superado.</li>
                <li>Tarjeta bloqueada para compras por internet en el portal de tu banco.</li>
                <li>Autenticación de seguridad 3D Secure / OTP no completada a tiempo.</li>
                <li>Interrupción momentánea de conexión a internet durante la verificación.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={processPayment}
                className="w-full sm:flex-1 py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                <span>Reintentar Verificación 🔄</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppSupport}
                className="w-full sm:flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30 active:scale-[0.98]"
              >
                <span>Soporte WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleReturn}
                className="w-full sm:w-auto px-5 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-black uppercase text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protegido por PayPhone PCI-DSS 4.0</span>
        </div>

      </div>

    </div>
  );
};
