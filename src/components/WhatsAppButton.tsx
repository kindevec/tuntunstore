import React, { useState } from 'react';
import { MessageCircle, X, Send, HelpCircle, ShieldCheck, Zap } from 'lucide-react';

interface WhatsAppButtonProps {
  customMessage?: string;
  hasBottomNav?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ customMessage, hasBottomNav = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');

  const defaultPhone = '593990084680'; // Ecuador phone format +593 99 008 4680
  const finalMsg = userQuery || customMessage || '¡Hola TunTun Store! Quisiera realizar una consulta sobre una recarga de diamantes.';

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(finalMsg);
    window.open(`https://wa.me/${defaultPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div
      id="whatsapp-floating-widget"
      className={`fixed ${hasBottomNav ? 'bottom-20' : 'bottom-5'} md:bottom-6 right-4 md:right-6 z-40 transition-all duration-300`}
    >
      
      {/* Expanded Quick Chat Drawer */}
      {isOpen && (
        <div className="mb-3 w-80 bg-zinc-950 border border-emerald-500/30 text-white rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-black">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="font-black uppercase text-xs text-white tracking-wider">Soporte TunTun Store 🇪🇨</p>
                <p className="text-[10px] text-emerald-400 font-extrabold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En línea para atenderte
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-black p-3 rounded-xl border border-white/10 text-xs space-y-1.5 text-zinc-300">
            <p className="font-black text-white uppercase">¡Hola! Bienvenida/o a TunTun Store.</p>
            <p className="text-[11px] leading-relaxed font-semibold">
              ¿Tienes dudas con tu pago o ID de jugador? Escríbenos directamente a nuestro WhatsApp oficial.
            </p>
          </div>

          {/* Quick options */}
          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => {
                setUserQuery('¡Hola TunTun Store! Necesito ayuda para ingresar mi ID de Free Fire.');
              }}
              className="w-full text-left p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-bold uppercase transition-colors border border-white/5"
            >
              ❓ ¿Cómo encuentro mi ID de juego?
            </button>

            <button
              onClick={() => {
                setUserQuery('¡Hola TunTun Store! Quisiera confirmar el número de cuenta de Banco Pichincha.');
              }}
              className="w-full text-left p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-bold uppercase transition-colors border border-white/5"
            >
              🏦 Confirmar cuentas bancarias
            </button>
          </div>

          <div className="pt-1">
            <button
              id="btn-open-whatsapp-direct"
              onClick={handleOpenWhatsApp}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Abrir WhatsApp Directo</span>
            </button>
          </div>

        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        id="whatsapp-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-2.5 sm:p-3 rounded-xl bg-emerald-500 text-black font-black shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-emerald-300 cursor-pointer"
        title="Atención por WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-black animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-black"></span>
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-current text-black" />
      </button>

    </div>
  );
};
