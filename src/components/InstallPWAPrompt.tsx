import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Plus, ArrowUp, MoreVertical, Smartphone } from 'lucide-react';
import { useInstallPWA } from '../hooks/useInstallPWA';
import { useIsPWA } from '../hooks/useIsPWA';

/**
 * InstallPWAPrompt — Componente de instalación PWA para TunTun Store.
 * 
 * Comportamiento:
 * - Primera visita: Toast flotante visible inmediatamente en móvil (encima de BottomNavigation)
 *   o abajo a la derecha en desktop.
 * - Si el navegador soporta instalación directa (Chrome Desktop/Android en HTTPS o localhost):
 *   El botón ejecuta el diálogo nativo directo de instalación.
 * - Si está en red local HTTP o navegador sin prompt automático (iOS Safari / Chrome LAN IP):
 *   Abre una guía paso a paso adaptada al sistema del usuario (iOS o Android).
 * - Se oculta si la app ya está instalada o abierta en modo PWA.
 */
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
  const { canInstall, isInstalled, isIOS, isAndroid, shouldShowPrompt, installApp, dismissPrompt } = useInstallPWA();
  const isPWA = useIsPWA();
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastTriggerRef = useRef(0);
  const onPromptElapsedRef = useRef(onPromptElapsed);

  // Mantener la referencia actualizada sin causar re-renders del efecto
  useEffect(() => {
    onPromptElapsedRef.current = onPromptElapsed;
  }, [onPromptElapsed]);

  // Aparece durante los primeros 30 segundos en cada recarga de página y luego desaparece permanentemente hasta la próxima recarga
  useEffect(() => {
    // Si ya es PWA, está instalada, no se debe mostrar o ya fue cerrada en esta sesión de página, no hacer nada
    if (isInstalled || isPWA || !shouldShowPrompt || hasDismissedInCurrentPageLoad) {
      setIsVisible(false);
      return;
    }

    // Entrada suave tras 250ms
    const enterTimer = setTimeout(() => {
      if (!hasDismissedInCurrentPageLoad) {
        setIsVisible(true);
      }
    }, 250);

    // Desaparición automática tras exactamente 30 segundos
    const autoDismissTimer = setTimeout(() => {
      hasDismissedInCurrentPageLoad = true;
      setIsVisible(false);
      onPromptElapsedRef.current?.();
    }, 30250);

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

  // Si se pulsa el botón de descarga del header, disparar instalación o modal
  useEffect(() => {
    if (openTrigger > 0 && openTrigger > lastTriggerRef.current) {
      lastTriggerRef.current = openTrigger;
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

  // Si ya está instalada o es PWA o no hay nada activo, no renderizar nada
  if (isInstalled || isPWA || (!isVisible && !showModal)) return null;

  return (
    <>
      {/* Toast flotante — Visible durante los primeros 10 segundos */}
      <AnimatePresence>
        {isVisible && !showModal && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[68px] md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-sm z-[60]"
          >
            <div className="relative bg-gradient-to-r from-[#061810]/95 via-[#082015]/95 to-[#07090e]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl px-4 py-3 shadow-[0_-8px_30px_rgba(16,185,129,0.25)] overflow-hidden">
              {/* Barra de progreso de la ventana de 30 segundos */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 30, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-emerald-400 to-emerald-200 opacity-70"
              />

              {/* Botón cerrar */}
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white transition-colors rounded-full"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 pr-6">
                {/* Ícono de App */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-inner">
                  <Download className="w-5 h-5 text-emerald-400" />
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-black tracking-tight leading-tight flex items-center gap-1.5">
                    Instala TunTun Store
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30 uppercase">App</span>
                  </p>
                  <p className="text-zinc-400 text-[10px] leading-tight mt-0.5 truncate">
                    Acceso rápido y pantalla completa
                  </p>
                </div>

                {/* Botón de acción */}
                <button
                  onClick={handleInstallClick}
                  className="flex-shrink-0 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black text-[11px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-[0_4px_14px_rgba(16,185,129,0.35)] cursor-pointer"
                >
                  Instalar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal educativo de instalación (adaptado a iOS o Android) */}
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
              className="w-full max-w-md bg-[#090d13] border-t sm:border border-emerald-500/30 rounded-t-3xl sm:rounded-3xl p-6 pb-10 sm:pb-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Barra superior de arrastre móvil */}
              <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />

              {/* Cabecera del modal */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white text-base font-black tracking-tight leading-tight">
                    Instalar TunTun Store
                  </h3>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    {isIOS ? 'En tu iPhone / iPad (Safari)' : 'En tu celular Android (Chrome)'}
                  </p>
                </div>
              </div>

              {/* Pasos para iOS Safari */}
              {isIOS ? (
                <div className="space-y-3.5 bg-black/40 border border-zinc-800/80 rounded-2xl p-4 my-4">
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
                      <p className="text-zinc-500 text-[10.5px] mt-0.5">
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
                      <p className="text-zinc-500 text-[10.5px] mt-0.5">
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
                      <p className="text-zinc-500 text-[10.5px] mt-0.5">
                        ¡Listo! TunTun Store se abrirá como app independiente
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Pasos para Android Chrome */
                <div className="space-y-3.5 bg-black/40 border border-zinc-800/80 rounded-2xl p-4 my-4">
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
                      <p className="text-zinc-500 text-[10.5px] mt-0.5">
                        En la esquina superior derecha de tu navegador Chrome
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
                      <p className="text-zinc-500 text-[10.5px] mt-0.5">
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
                      <p className="text-zinc-500 text-[10.5px] mt-0.5">
                        ¡Listo! La app se agregará a tus aplicaciones
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón cerrar */}
              <button
                onClick={handleDismiss}
                className="w-full mt-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPWAPrompt;
