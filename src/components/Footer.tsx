import React from 'react';
import { DiamondIcon } from './DiamondIcon';
import { ShieldCheck, Heart, ExternalLink, Facebook, Instagram } from 'lucide-react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
  </svg>
);

interface FooterProps {
  onSelectTab: (tab: 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer id="footer-main" className="fixed bottom-0 left-0 w-full z-0 bg-[#050505] text-zinc-400 text-xs py-6 md:py-4 px-4 sm:px-6 lg:px-8">
      {/* Smooth gradient fade into footer */}
      <div className="absolute top-0 left-0 w-full h-16 sm:h-24 bg-gradient-to-t from-[#050505] to-transparent -translate-y-full pointer-events-none" />
      <div className="max-w-7xl mx-auto space-y-4 relative z-10">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Brand Info */}
          <div className="space-y-3 col-span-2 md:col-span-1">
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
            
            {/* Social Media Links */}
            <div className="flex items-center gap-4 pt-2">
              <a href="https://www.facebook.com/profile.php?id=61592564474036" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-zinc-900 hover:bg-emerald-500 hover:text-black text-zinc-400 transition-colors" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/sahur055?igsh=MWs3cXI1cDM0Z2x2YQ==" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-zinc-900 hover:bg-emerald-500 hover:text-black text-zinc-400 transition-colors" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@tuntunstore1" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-zinc-900 hover:bg-emerald-500 hover:text-black text-zinc-400 transition-colors" title="TikTok">
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 col-span-1">
            <p className="font-black text-zinc-500 text-sm uppercase tracking-widest">Páginas Independientes</p>
            <ul className="space-y-1.5 font-bold uppercase text-[11px]">
              <li>
                <button onClick={() => onSelectTab('catalog')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Catálogo de Diamantes
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('wallet')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Billetera Virtual USD
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('orders')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Seguimiento Mis Pedidos
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('profile')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Mi Perfil de Usuario
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('admin')} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Panel de Administración
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2 col-span-1">
            <p className="font-black text-zinc-500 text-sm uppercase tracking-widest">Métodos de Pago Oficiales</p>
            <ul className="space-y-1.5 text-zinc-400 font-bold text-[11px]">
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

          {/* Security & Guarantees */}
          <div className="space-y-2 col-span-2 md:col-span-1">
            <p className="font-black text-zinc-500 text-sm uppercase tracking-widest">Garantía de Servicio</p>
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

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px] font-bold uppercase text-center sm:text-left">
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
