import React, { useState } from 'react';
import { DiamondIcon } from './DiamondIcon';
import { ShieldCheck, Heart, ChevronDown } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  return (
    <footer id="footer-main" className="fixed bottom-0 left-0 w-full z-0 bg-[#050505] text-zinc-400 text-xs pt-4 pb-20 md:py-4 px-4 sm:px-6 lg:px-8">
      {/* Smooth gradient fade into footer */}
      <div className="absolute top-0 left-0 w-full h-16 sm:h-24 bg-gradient-to-t from-[#050505] to-transparent -translate-y-full pointer-events-none" />
      <div className="max-w-7xl mx-auto space-y-2 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
          
          {/* Brand Info */}
          <div className="space-y-1.5 col-span-1">
            <div className="flex items-center gap-2">
              <DiamondIcon size="sm" variant="emerald" />
              <span className="text-xl font-black text-zinc-300 uppercase tracking-tighter">TunTun Store</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed font-semibold">
              Plataforma líder en recargas directas de diamantes para videojuegos en Ecuador. Acreditación rápida y garantizada.
            </p>
            <p className="text-[11px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Servidor Oficial: WhatsApp +593 96 872 9952
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-1.5 col-span-1 border-t border-white/5 md:border-0 pt-2 md:pt-0">
            <button 
              onClick={() => toggleSection('links')}
              className="w-full flex items-center justify-between md:cursor-default outline-none"
            >
              <p className="font-black text-zinc-500 text-sm uppercase tracking-widest">Páginas Independientes</p>
              <ChevronDown className={`w-4 h-4 text-zinc-500 md:hidden transition-transform ${openSections.includes('links') ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-2 ${openSections.includes('links') ? 'block' : 'hidden'} md:block`}>
              <ul className="space-y-2 font-bold uppercase text-[11px]">
                <li>
                  <button onClick={() => onSelectTab('catalog')} className="hover:text-emerald-400 transition-colors cursor-pointer text-left">
                    Catálogo de Diamantes
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('wallet')} className="hover:text-emerald-400 transition-colors cursor-pointer text-left">
                    Billetera Virtual USD
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('orders')} className="hover:text-emerald-400 transition-colors cursor-pointer text-left">
                    Seguimiento Mis Pedidos
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('profile')} className="hover:text-emerald-400 transition-colors cursor-pointer text-left">
                    Mi Perfil de Usuario
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('admin')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                    Panel de Administración
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-1.5 col-span-1 border-t border-white/5 md:border-0 pt-2 md:pt-0">
            <button 
              onClick={() => toggleSection('payments')}
              className="w-full flex items-center justify-between md:cursor-default outline-none"
            >
              <p className="font-black text-zinc-500 text-sm uppercase tracking-widest">Métodos de Pago Oficiales</p>
              <ChevronDown className={`w-4 h-4 text-zinc-500 md:hidden transition-transform ${openSections.includes('payments') ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-2 ${openSections.includes('payments') ? 'block' : 'hidden'} md:block`}>
              <ul className="space-y-2 text-zinc-400 font-bold text-[11px]">
                <li className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> BANCO GUAYAQUIL / APP DEUNA
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> BANCO PICHINCHA / MI VECINO
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span> BINANCE PAY (INTERNACIONAL 🌐)
                </li>
              </ul>
            </div>
          </div>

          {/* Security & Guarantees */}
          <div className="space-y-1.5 col-span-1 border-t border-white/5 md:border-0 pt-2 md:pt-0">
            <button 
              onClick={() => toggleSection('security')}
              className="w-full flex items-center justify-between md:cursor-default outline-none"
            >
              <p className="font-black text-zinc-500 text-sm uppercase tracking-widest">Garantía de Servicio</p>
              <ChevronDown className={`w-4 h-4 text-zinc-500 md:hidden transition-transform ${openSections.includes('security') ? 'rotate-180' : ''}`} />
            </button>
            <div className={`space-y-2 ${openSections.includes('security') ? 'block' : 'hidden'} md:block`}>
              <p className="text-zinc-400 text-xs font-medium">
                Todas las cargas se procesan directamente con tu <strong className="text-zinc-300">ID de Jugador</strong>. Nunca solicitaremos tu clave ni datos de acceso a tu cuenta.
              </p>
              <div className="pt-2">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  Atención Inmediata 24/7
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-3 mt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-500 text-[11px] font-bold uppercase text-center sm:text-left">
          <p>© 2026 TunTun Store. Todos los derechos reservados. Operado en Ecuador 🇪🇨.</p>
          <p className="flex items-center gap-1.5">
            <span>Desarrollado por <a href="https://kindevx.web.app/" target="_blank" rel="noreferrer" className="text-emerald-400 font-extrabold tracking-wider hover:underline">KinDev S.A.S</a></span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1">
              Diseñado con <Heart className="w-3 h-3 text-rose-500 fill-current" /> para Gamers
            </span>
          </p>
        </div>

      </div>
    </footer>
  );
};
