import React, { useState } from 'react';
import { X, ShieldCheck, Zap } from 'lucide-react';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

interface WhatsAppButtonProps {
  customMessage?: string;
  hasBottomNav?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ customMessage, hasBottomNav = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState<'id' | 'bank' | null>(null);

  const defaultPhone = '593968729952'; // Ecuador phone format +593 96 872 9952
  const finalMsg = userQuery || customMessage || '¡Hola TunTun Store! Quisiera realizar una consulta sobre una recarga de diamantes.';

  const handleOpenWhatsApp = (overrideMsg?: string) => {
    const msgToEncode = overrideMsg || finalMsg;
    const encoded = encodeURIComponent(msgToEncode);
    window.open(`https://wa.me/${defaultPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div
      id="whatsapp-floating-widget"
      className={`fixed ${hasBottomNav ? 'bottom-20' : 'bottom-5'} md:bottom-6 right-4 md:right-6 z-[100] transition-all duration-300 flex flex-col items-end`}
    >
      
      {/* Expanded Quick Chat Drawer */}
      {isOpen && (
        <div className="mb-3 w-80 bg-zinc-950 border border-emerald-500/30 text-white rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-black">
                <WhatsAppIcon className="w-5 h-5" />
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
                setSelectedOption('id');
                setUserQuery('¡Hola TunTun Store! Necesito ayuda para ingresar mi ID de Free Fire.');
              }}
              className={`w-full text-left p-2.5 rounded-xl text-[11px] font-bold uppercase transition-all border ${selectedOption === 'id' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/5'}`}
            >
              ❓ ¿Cómo encuentro mi ID de juego?
            </button>
            {selectedOption === 'id' && (
              <div className="p-2.5 bg-black rounded-lg border border-emerald-500/20 text-[10.5px] text-zinc-400 font-medium animate-in fade-in zoom-in-95 leading-relaxed">
                <strong className="text-emerald-400 block mb-0.5">Respuesta rápida:</strong>
                Ve a tu perfil en Free Fire, toca el ícono de copiar junto a tu número de ID (debajo de tu nombre). Si aún tienes dudas, haz clic abajo en "Abrir WhatsApp Directo" para ayudarte personalmente.
              </div>
            )}

            <button
              onClick={() => {
                setSelectedOption('bank');
                setUserQuery('¡Hola TunTun Store! Quisiera confirmar el número de cuenta de Banco Pichincha.');
              }}
              className={`w-full text-left p-2.5 rounded-xl text-[11px] font-bold uppercase transition-all border ${selectedOption === 'bank' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/5'}`}
            >
              🏦 Confirmar cuentas bancarias
            </button>
            {selectedOption === 'bank' && (
              <div className="p-2.5 bg-black rounded-lg border border-emerald-500/20 text-[10.5px] text-zinc-400 font-medium animate-in fade-in zoom-in-95 leading-relaxed">
                <strong className="text-emerald-400 block mb-0.5">Respuesta rápida:</strong>
                Trabajamos con Banco Pichincha, Guayaquil, Mi Vecino y Produbanco. Para pasarte los datos exactos y confirmar tu depósito, haz clic abajo en "Abrir WhatsApp Directo".
              </div>
            )}
          </div>

          <div className="pt-1">
            <button
              id="btn-open-whatsapp-direct"
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Abrir WhatsApp Directo</span>
            </button>
          </div>

        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        id="whatsapp-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group hover:scale-110 active:scale-95 transition-transform duration-300 cursor-pointer drop-shadow-[0_4px_10px_rgba(37,211,102,0.4)]"
        title="Atención por WhatsApp"
      >
        <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 ring-2 ring-black animate-ping z-10"></span>
        <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500 ring-2 ring-black z-10"></span>
        {/* Official WhatsApp Color: #25D366 */}
        <WhatsAppIcon className="w-14 h-14 sm:w-16 sm:h-16 text-[#25D366]" />
      </button>

    </div>
  );
};
