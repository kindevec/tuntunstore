import React from 'react';
import { ShieldCheck, Heart, Mail } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: 'home' | 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin') => void;
  activeTab?: string;
}

export const SocialIcons: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className="flex items-center gap-2 sm:gap-3">
    <a 
      href="https://www.facebook.com/profile.php?id=61592564474036" 
      target="_blank" 
      rel="noreferrer" 
      className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer group`}
      title="Facebook"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={compact ? "16" : "20"} height={compact ? "16" : "20"} viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400 group-hover:text-[#1877F2] transition-colors">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    </a>
    <a 
      href="https://www.instagram.com/sahur055?igsh=MWs3cXI1cDM0Z2x2YQ==" 
      target="_blank" 
      rel="noreferrer" 
      className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer group`}
      title="Instagram"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={compact ? "16" : "20"} height={compact ? "16" : "20"} viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400 group-hover:text-[#dc2743] transition-colors">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 7.052.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    </a>
    <a 
      href="https://wa.me/593968729952" 
      target="_blank" 
      rel="noreferrer" 
      className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer group`}
      title="WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={compact ? "16" : "20"} height={compact ? "16" : "20"} viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400 group-hover:text-[#25D366] transition-colors">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>
    <a 
      href="https://tiktok.com/@tuntunstore1" 
      target="_blank" 
      rel="noreferrer" 
      className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer group`}
      title="TikTok"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={compact ? "16" : "20"} height={compact ? "16" : "20"} viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400 group-hover:text-[#ff0050] transition-colors drop-shadow-[1px_1px_0_#00f2fe]">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.28 6.28 0 005.4 15.65a6.28 6.28 0 006.28 6.28A6.28 6.28 0 0018 15.65V9.43a8.3 8.3 0 004 1V6.69z"/>
      </svg>
    </a>
  </div>
);

export const Footer: React.FC<FooterProps> = ({ onSelectTab, activeTab }) => {
  // 1. Footer exclusivo para la página de inicio (exactamente el original)
  if (activeTab === 'home') {
    return (
      <footer id="footer-main" className="fixed bottom-0 left-0 w-full z-0 bg-[#050505] text-zinc-400 text-xs pt-3 pb-16 md:py-3 px-4 sm:px-6 lg:px-8">
        {/* Smooth gradient fade into footer */}
        <div className="absolute top-0 left-0 w-full h-16 sm:h-24 bg-gradient-to-t from-[#050505] to-transparent -translate-y-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 mb-8 border-b border-white/5">
            {/* Brand Column */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => onSelectTab('home')}>
                <img src="/logo-transparent.png" alt="TunTun Store Logo" className="w-12 h-12 object-contain" />
                <span className="text-xl font-black tracking-tighter text-white">
                  TUNTUN<span className="text-emerald-500 italic">STORE</span>
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-6 font-medium max-w-xs">
                Tu tienda de confianza para recargas de juegos. Rápido, seguro y con entrega automática en segundos.
              </p>
              <SocialIcons />
            </div>

            {/* Links Column */}
            <div className="hidden md:flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-white font-black uppercase tracking-wider mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-3 font-medium">
                <li><button onClick={() => onSelectTab('catalog')} className="hover:text-emerald-400 transition-colors cursor-pointer">Catálogo de Productos</button></li>
                <li><button onClick={() => onSelectTab('wallet')} className="hover:text-emerald-400 transition-colors cursor-pointer">Recargar Billetera</button></li>
                <li><button onClick={() => onSelectTab('orders')} className="hover:text-emerald-400 transition-colors cursor-pointer">Mis Pedidos</button></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="hidden md:flex flex-col items-center md:items-start text-center md:text-left">
              <h3 className="text-white font-black uppercase tracking-wider mb-4">Soporte y Ayuda</h3>
              <ul className="space-y-4">
                <li className="flex flex-col md:flex-row items-center md:items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white text-sm">Garantía de Seguridad</p>
                    <p className="text-xs">Transacciones encriptadas y protegidas.</p>
                  </div>
                </li>
                <li className="flex flex-col md:flex-row items-center md:items-start gap-2">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white text-sm">Contacto Directo</p>
                    <p className="text-xs">Soporte por WhatsApp Lunes a Viernes.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px] font-bold uppercase text-center sm:text-left">
            <p>© 2026 TunTun Store. Todos los derechos reservados. Operado en Ecuador 🇪🇨.</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-1.5 gap-y-1">
              <span>Desarrollado por <a href="https://kindevx.web.app/" target="_blank" rel="noreferrer" className="text-emerald-400 font-extrabold tracking-wider hover:underline">KinDev S.A.S</a></span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Diseñado con <Heart className="w-3 h-3 text-rose-500 fill-current" /> para Gamers
              </span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // 2. Footer sencillo, compacto e independiente para las demás páginas (SIN espacios vacíos ni gradient overlays)
  return (
    <footer id="footer-main" className="bg-[#050505] text-zinc-400 border-t border-white/5 py-4 pb-20 sm:pb-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[11px] font-bold uppercase text-center sm:text-left">
        {/* 1. Logo & Brand */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectTab('home')}>
          <img src="/logo-transparent.png" alt="TunTun Store Logo" className="w-6 h-6 object-contain" />
          <span className="text-sm font-black tracking-tighter text-white">
            TUNTUN<span className="text-emerald-500 italic">STORE</span>
          </span>
        </div>

        {/* 2. Redes Sociales */}
        <div className="flex items-center justify-center">
          <SocialIcons compact />
        </div>

        {/* 3. Mensaje de Copyright */}
        <div className="text-zinc-500 text-center sm:text-right">
          <span>© 2026 TunTun Store • <a href="https://kindevx.web.app/" target="_blank" rel="noreferrer" className="text-emerald-400 font-extrabold hover:underline">KinDev S.A.S</a></span>
        </div>
      </div>
    </footer>
  );
};
