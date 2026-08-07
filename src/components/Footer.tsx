import React from 'react';
import { DiamondIcon } from './DiamondIcon';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer id="footer-main" className="fixed bottom-0 left-0 w-full z-0 bg-[#050505] text-zinc-400 text-xs pt-3 pb-16 md:py-3 px-4 sm:px-6 lg:px-8">
      {/* Smooth gradient fade into footer */}
      <div className="absolute top-0 left-0 w-full h-16 sm:h-24 bg-gradient-to-t from-[#050505] to-transparent -translate-y-full pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        
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
};
