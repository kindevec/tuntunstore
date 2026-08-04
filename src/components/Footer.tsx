import React from 'react';
import { DiamondIcon } from './DiamondIcon';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer id="footer-main" className="bg-[#050505] text-zinc-400 text-xs border-t border-emerald-500/20 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <DiamondIcon size="sm" variant="emerald" />
              <span className="text-xl font-black text-white uppercase tracking-tighter">TunTun Store</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed font-semibold">
              Plataforma líder en recargas directas de diamantes para videojuegos en Ecuador. Acreditación rápida y garantizada.
            </p>
            <p className="text-[11px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Servidor Oficial: WhatsApp +593 99 008 4680
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <p className="font-black text-white text-xs uppercase tracking-widest">Páginas Independientes</p>
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
          <div className="space-y-2">
            <p className="font-black text-white text-xs uppercase tracking-widest">Métodos de Pago Ecuador</p>
            <ul className="space-y-1.5 text-zinc-400 font-bold text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> BANCO PICHINCHA (BANCA WEB / VECINO)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> BANCO GUAYAQUIL / APLICACIÓN DEUNA
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> PRODUBANCO / SERVIPAGOS
              </li>
            </ul>
          </div>

          {/* Security & Guarantees */}
          <div className="space-y-2">
            <p className="font-black text-white text-xs uppercase tracking-widest">Garantía de Servicio</p>
            <p className="text-zinc-400 text-xs font-medium">
              Todas las cargas se procesan directamente con tu <strong className="text-white">ID de Jugador</strong>. Nunca solicitaremos tu clave ni datos de acceso a tu cuenta.
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
            <span>Desarrollado por <strong className="text-emerald-400 font-extrabold tracking-wider">KinDev S.A.S</strong></span>
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
