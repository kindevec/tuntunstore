import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  X, 
  Plus, 
  ArrowUp, 
  MoreVertical, 
  Smartphone, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { useInstallPWA } from '../hooks/useInstallPWA';
import { useIsPWA } from '../hooks/useIsPWA';

// Flag a nivel de módulo JS: solo se reinicia cuando la página se recarga por completo (F5 / refresh)
let hasDismissedInCurrentPageLoad = false;

interface InstallPWAPromptProps {
  onVisibilityChange?: (isVisible: boolean) => void;
  onPromptElapsed?: () => void;
  openTrigger?: number;
}

export const InstallPWAPrompt: React.FC<InstallPWAPromptProps> = ({ 
  onVisibilityChange,
  onPromptElapsed,
  openTrigger = 0
}) => {
  const { canInstall, isInstalled, isIOS, isAndroid, browserInfo, shouldShowPrompt, installApp, dismissPrompt } = useInstallPWA();
  const isPWA = useIsPWA();
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const lastTriggerRef = useRef(0);
  const onPromptElapsedRef = useRef(onPromptElapsed);

  // Navegador Android que no soporta WebAPK nativo de Google (como Brave, Firefox, Opera)
  const isNonChromeAndroid = isAndroid && !browserInfo.isChrome && !browserInfo.isSamsung;

  // Mantener la referencia actualizada sin causar re-renders del efecto
  useEffect(() => {
    onPromptElapsedRef.current = onPromptElapsed;
  }, [onPromptElapsed]);

  // Aparece durante los primeros 5 segundos en cada recarga de página y luego da paso a la barra superior
  useEffect(() => {
    if (isInstalled || isPWA || !shouldShowPrompt || hasDismissedInCurrentPageLoad) {
      setIsVisible(false);
      if (hasDismissedInCurrentPageLoad && !isInstalled && !isPWA) {
        onPromptElapsedRef.current?.();
      }
      return;
    }

    // Entrada suave tras 250ms
    const enterTimer = setTimeout(() => {
      if (!hasDismissedInCurrentPageLoad) {
        setIsVisible(true);
      }
    }, 250);

    // Desaparición automática tras exactamente 5 segundos
    const autoDismissTimer = setTimeout(() => {
      hasDismissedInCurrentPageLoad = true;
      setIsVisible(false);
      onPromptElapsedRef.current?.();
    }, 5250);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(autoDismissTimer);
    };
  }, [shouldShowPrompt, isInstalled, isPWA]);

  // Si la alerta o el modal están activos en pantalla
  const isPromptActive = !isPWA && !isInstalled && (isVisible || showModal);

  // Informar al componente padre (App) para ocultar WhatsApp mientras la alerta esté activa
  useEffect(() => {
    onVisibilityChange?.(isPromptActive);
    return () => {
      onVisibilityChange?.(false);
    };
  }, [isPromptActive, onVisibilityChange]);

  const handleInstallClick = useCallback(async () => {
    if (canInstall) {
      const result = await installApp();
      if (result === 'accepted') {
        hasDismissedInCurrentPageLoad = true;
        setIsVisible(false);
        setShowModal(false);
      } else if (result === 'unavailable') {
        setShowModal(true);
        setIsVisible(false);
      }
    } else {
      setShowModal(true);
      setIsVisible(false);
    }
  }, [canInstall, installApp]);

  // Si se pulsa la barra superior del header, ir DIRECTO a la instalación (no re-abre la ventana publicitaria)
  useEffect(() => {
    if (openTrigger > 0 && openTrigger > lastTriggerRef.current) {
      lastTriggerRef.current = openTrigger;
      setIsVisible(false);
      handleInstallClick();
    }
  }, [openTrigger, handleInstallClick]);

  const handleDismiss = useCallback(() => {
    hasDismissedInCurrentPageLoad = true;
    dismissPrompt();
    setIsVisible(false);
    setShowModal(false);
    onPromptElapsedRef.current?.();
  }, [dismissPrompt]);

  // Abrir enlace directo en la app de Google Chrome vía Android Intent
  const handleOpenInChrome = useCallback(() => {
    const cleanUrl = window.location.href.split('?')[0];
    if (browserInfo.openInChromeIntentUrl) {
      window.location.href = browserInfo.openInChromeIntentUrl;
    }
    // Copiar al portapapeles como respaldo
    try {
      navigator.clipboard.writeText(cleanUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // ignore
    }
  }, [browserInfo.openInChromeIntentUrl]);

  const handleCopyLink = useCallback(() => {
    try {
      const cleanUrl = window.location.href.split('?')[0];
      navigator.clipboard.writeText(cleanUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // ignore
    }
  }, []);

  // Si ya está instalada o es PWA o no hay nada activo, no renderizar nada
  if (isInstalled || isPWA || (!isVisible && !showModal)) return null;

  return (
    <>
      {/* Toast flotante — Ultra compacto, optimizado y con brillito dorado distintivo */}
      <AnimatePresence>
        {isVisible && !showModal && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[68px] md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-[60]"
          >
            <div className="relative bg-gradient-to-r from-[#032219]/98 via-[#06382a]/98 to-[#021a13]/98 backdrop-blur-2xl border-2 border-amber-400 rounded-2xl p-2.5 sm:p-3 shadow-[0_0_35px_rgba(245,158,11,0.55),0_15px_45px_rgba(0,0,0,0.95)] ring-2 ring-amber-300/80 ring-offset-2 ring-offset-black/70 overflow-hidden">
              {/* Barra de progreso dorada TunTun de 5 segundos */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,1)]"
              />

              {isNonChromeAndroid ? (
                /* 🟡 VISTA ULTRA COMPACTA PARA BRAVE / NAVEGADORES SECUNDARIOS */
                <div className="flex flex-col gap-2">
                  {/* Fila 1: Logo + Título + Botón "En Chrome" + Botón X */}
                  <div className="flex items-center gap-2.5">
                    {/* Logo de TunTun con aro dorado */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/25 via-emerald-950/80 to-[#021a13] border-2 border-amber-400/80 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                      <img src="/logo-transparent.webp" alt="TunTun Store" className="w-7 h-7 object-contain drop-shadow" />
                    </div>

                    {/* Título y badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-white text-xs font-black tracking-tight leading-tight">Instala TunTun</span>
                        <span className="text-[8.5px] bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-sm">
                          {browserInfo.displayName}
                        </span>
                      </div>
                      <p className="text-amber-200/90 text-[10.5px] leading-tight mt-0.5 truncate">
                        {copiedLink ? '¡Enlace copiado! Abre Chrome' : 'Recomendado abrir en Chrome'}
                      </p>
                    </div>

                    {/* Botón principal directo: Abrir en Chrome */}
                    <button
                      onClick={handleOpenInChrome}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95 transition-all shrink-0"
                      title="Abrir en Google Chrome para instalar limpio sin sello"
                    >
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>En Chrome</span>
                    </button>

                    {/* Botón cerrar */}
                    <button
                      onClick={handleDismiss}
                      className="p-1.5 text-amber-200/80 hover:text-white transition-colors rounded-lg hover:bg-amber-400/20 cursor-pointer shrink-0"
                      aria-label="Cerrar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Fila 2: Franja informativa TunTun con opción de instalar aquí inline */}
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-[#021a13]/90 border border-amber-400/40 text-[10.5px] leading-tight text-emerald-100">
                    <span className="truncate">
                      💡 <strong>Para icono sin sello de {browserInfo.displayName}</strong>, usa Chrome.
                    </span>
                    <button
                      onClick={handleInstallClick}
                      className="underline font-bold text-amber-300 hover:text-white shrink-0 cursor-pointer"
                    >
                      Instalar aquí
                    </button>
                  </div>
                </div>
              ) : (
                /* 🟢 VISTA ULTRA COMPACTA PARA CHROME / ESTÁNDAR (1 SOLA FILA HORIZONTAL, CERO HUECOS) */
                <div className="flex items-center gap-2.5">
                  {/* Logo de TunTun con aro dorado */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/25 via-emerald-950/80 to-[#021a13] border-2 border-amber-400/80 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    <img src="/logo-transparent.webp" alt="TunTun Store" className="w-7 h-7 object-contain drop-shadow" />
                  </div>

                  {/* Textos: Ocupa todo el espacio horizontal sobrante */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-white text-xs font-black tracking-tight leading-tight">
                        Instala TunTun Store
                      </span>
                      {browserInfo.isChrome ? (
                        <span className="text-[8.5px] bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" /> Chrome
                        </span>
                      ) : (
                        <span className="text-[8.5px] bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-sm">
                          App Web
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-100/90 text-[10.5px] leading-tight mt-0.5 truncate">
                      Acceso rápido y experiencia App nativa
                    </p>
                  </div>

                  {/* Botón de acción dorado llamativo */}
                  <button
                    onClick={handleInstallClick}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Instalar</span>
                  </button>

                  {/* Botón cerrar */}
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 text-amber-200/80 hover:text-white transition-colors rounded-lg hover:bg-amber-400/20 cursor-pointer shrink-0"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal educativo de instalación */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4"
            onClick={handleDismiss}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-md bg-gradient-to-b from-[#06382a] via-[#032219] to-[#021610] border-t sm:border-2 border-amber-400/90 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.4),0_25px_60px_rgba(0,0,0,0.95)] ring-2 ring-amber-300/40 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Barra superior de arrastre móvil */}
              <div className="w-12 h-1 bg-amber-400/40 rounded-full mx-auto mb-4 sm:hidden" />

              {/* Cabecera del modal */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/25 via-emerald-950/80 to-[#021610] border-2 border-amber-400/80 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
                  <img src="/logo-transparent.webp" alt="TunTun Store" className="w-8 h-8 object-contain drop-shadow" />
                </div>
                <div>
                  <h3 className="text-white text-base font-black tracking-tight leading-tight">
                    Instalar TunTun Store
                  </h3>
                  <p className="text-emerald-200/90 text-xs mt-0.5 flex items-center gap-1">
                    {isIOS 
                      ? 'En tu iPhone / iPad (Safari)' 
                      : `Navegador: ${browserInfo.displayName}`}
                  </p>
                </div>
              </div>

              {/* Pasos para iOS Safari */}
              {isIOS ? (
                <div className="space-y-3.5 bg-[#02241b]/90 border border-emerald-500/30 rounded-2xl p-4 my-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-emerald-400 text-xs font-black">1</span>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-white text-xs font-bold flex items-center gap-1.5">
                        Toca el botón
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-md">
                          <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                        </span>
                        Compartir
                      </p>
                      <p className="text-zinc-400 text-[10.5px] mt-0.5">
                        Ubicado en la barra inferior de Safari
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-emerald-400 text-xs font-black">2</span>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-white text-xs font-bold flex items-center gap-1.5">
                        Selecciona
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-md">
                          <Plus className="w-3.5 h-3.5 text-white" />
                        </span>
                        "Agregar a Inicio"
                      </p>
                      <p className="text-zinc-400 text-[10.5px] mt-0.5">
                        Baja un poco en el menú de opciones
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-emerald-400 text-xs font-black">3</span>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-white text-xs font-bold">
                        Toca "Agregar" arriba a la derecha
                      </p>
                      <p className="text-zinc-400 text-[10.5px] mt-0.5">
                        ¡Listo! TunTun Store se abrirá como app independiente
                      </p>
                    </div>
                  </div>
                </div>
              ) : isNonChromeAndroid ? (
                /* CASO BRAVE / OTRO NAVEGADOR EN ANDROID: Sugerencia de Chrome + opción de instalar aquí */
                <div className="my-3 space-y-3">
                  {/* Tarjeta de recomendación de Chrome */}
                  <div className="bg-gradient-to-b from-[#064031]/90 via-[#03291f]/90 to-[#021d15]/90 border border-emerald-400/50 rounded-2xl p-3.5 shadow-lg">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-black text-amber-300">Recomendación: Instala desde Google Chrome</p>
                        <p className="text-emerald-100/90 text-[11px] mt-1 leading-snug">
                          En <strong className="text-white">{browserInfo.displayName}</strong>, Android le agrega automáticamente la insignia del navegador en la esquina del icono. Para que se instale como una <strong className="text-emerald-300 font-bold">App nativa 100% limpia sin sellos</strong>, te sugerimos abrirla en Chrome:
                        </p>
                        
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleOpenInChrome}
                            className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow-[0_2px_12px_rgba(245,158,11,0.35)] cursor-pointer active:scale-95 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir en Google Chrome</span>
                          </button>
                          
                          <button
                            onClick={handleCopyLink}
                            className="px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-500/40 cursor-pointer active:scale-95 transition-all"
                          >
                            {copiedLink ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">¡Enlace copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar enlace</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 h-[1px] bg-emerald-500/30" />
                    <span className="text-[10px] uppercase font-black text-emerald-400/80 tracking-wider">
                      O continúa en {browserInfo.displayName}
                    </span>
                    <div className="flex-1 h-[1px] bg-emerald-500/30" />
                  </div>

                  {/* Pasos en el navegador actual */}
                  <div className="space-y-3 bg-[#02241b]/90 border border-emerald-500/30 rounded-2xl p-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">1</div>
                      <div className="flex-1 text-xs text-zinc-300">
                        Toca el menú de 3 puntos de <strong>{browserInfo.displayName}</strong>
                      </div>
                    </div>
                    <div className="flex-1 flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">2</div>
                      <div className="flex-1 text-xs text-zinc-300">
                        Selecciona <strong className="text-emerald-400">"Instalar aplicación"</strong> o "Agregar a pantalla principal"
                      </div>
                    </div>
                    <div className="flex-1 flex items-start gap-2.5">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">3</div>
                      <div className="flex-1 text-xs text-zinc-300">
                        Confirma para tener el acceso en tu pantalla
                      </div>
                    </div>
                  </div>

                  {/* Botón para forzar instalación en el navegador actual */}
                  {canInstall && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-2.5 bg-emerald-900/80 hover:bg-emerald-800/80 text-emerald-100 font-black text-xs uppercase tracking-wider rounded-xl border border-emerald-500/40 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Instalar en {browserInfo.displayName} ahora</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Pasos para Android Chrome (Navegador nativo optimizado) */
                <div className="space-y-3.5 my-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Navegador optimizado detectado (Google Chrome):</strong> Tu instalación generará una App nativa limpia y sin sellos.</span>
                  </div>

                  <div className="space-y-3 bg-[#02241b]/90 border border-emerald-500/30 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs font-black">1</span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-white text-xs font-bold flex items-center gap-1.5">
                          Toca el menú de 3 puntos
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-md">
                            <MoreVertical className="w-3.5 h-3.5 text-white" />
                          </span>
                        </p>
                        <p className="text-zinc-400 text-[10.5px] mt-0.5">
                          En la esquina superior derecha de tu navegador
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs font-black">2</span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-white text-xs font-bold flex items-center gap-1.5">
                          Toca
                          <span className="text-emerald-400 font-black">"Instalar aplicación"</span>
                        </p>
                        <p className="text-zinc-400 text-[10.5px] mt-0.5">
                          O "Agregar a la pantalla principal"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs font-black">3</span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-white text-xs font-bold">
                          Confirma tocando "Instalar"
                        </p>
                        <p className="text-zinc-400 text-[10.5px] mt-0.5">
                          ¡Listo! La app se agregará a tus aplicaciones nativas
                        </p>
                      </div>
                    </div>
                  </div>

                  {canInstall && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 shadow-[0_4px_20px_rgba(245,158,11,0.55)] flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Instalar TunTun App Ahora</span>
                    </button>
                  )}
                </div>
              )}

              {/* Botón cerrar */}
              <button
                onClick={handleDismiss}
                className="w-full mt-3 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300/90 hover:text-white border border-emerald-500/40 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPWAPrompt;
