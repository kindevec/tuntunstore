import React from 'react';

interface DiamondChestGraphicProps {
  amount: number;
  bonus?: number;
  type?: 'pinxtore' | 'mascot';
  className?: string;
}

export const DiamondChestGraphic: React.FC<DiamondChestGraphicProps> = ({
  amount,
  bonus,
  type = 'pinxtore',
  className = '',
}) => {
  // Determine scale of diamond pile
  const isLarge = amount >= 2000;
  const isHuge = amount >= 5000;

  if (type === 'mascot') {
    return (
      <div className={`relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#1a2e1a] via-[#0d170d] to-black border border-emerald-500/20 p-2 ${className}`}>
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.25)_0%,transparent_70%)]" />
        
        {/* Wood Log Character SVG Illustration */}
        <svg viewBox="0 0 200 160" className="w-full h-full relative z-10 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b47b48" />
              <stop offset="50%" stopColor="#8d5b2d" />
              <stop offset="100%" stopColor="#57381a" />
            </linearGradient>
            <linearGradient id="metalChestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="50%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="cyanDiamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Baseball bat behind wood character */}
          <path d="M140 120 L180 20 L190 25 L150 125 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />

          {/* Wood Log Body */}
          <rect x="75" y="20" width="50" height="110" rx="12" fill="url(#woodGrad)" stroke="#3e2410" strokeWidth="3" />
          {/* Wood Rings Top */}
          <ellipse cx="100" cy="24" rx="22" ry="6" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />

          {/* Deal With It Glasses */}
          <polygon points="80,48 120,48 118,60 82,60" fill="#000" />
          <polygon points="82,50 98,50 96,58 84,58" fill="#fff" opacity="0.9" />
          <polygon points="102,50 118,50 116,58 104,58" fill="#fff" opacity="0.9" />

          {/* Smirk Smile */}
          <path d="M 88,72 Q 100,82 112,72" fill="none" stroke="#2a1608" strokeWidth="3" strokeLinecap="round" />

          {/* Arms holding the chest */}
          <path d="M 75,85 C 60,95 65,115 80,120" fill="none" stroke="#8d5b2d" strokeWidth="8" strokeLinecap="round" />
          <path d="M 125,85 C 140,95 135,115 120,120" fill="none" stroke="#8d5b2d" strokeWidth="8" strokeLinecap="round" />

          {/* Treasure Box / Chest overflowing with blue diamonds */}
          <rect x="80" y="100" width="40" height="30" rx="4" fill="url(#metalChestGrad)" stroke="#e4e4e7" strokeWidth="1" />
          <rect x="78" y="98" width="44" height="6" rx="2" fill="#d4d4d8" />

          {/* Overflowing Glowing Blue Diamonds */}
          <g filter="url(#glowCyan)">
            <polygon points="90,92 96,86 102,92 96,100" fill="url(#cyanDiamondGrad)" />
            <polygon points="98,90 104,84 110,90 104,98" fill="url(#cyanDiamondGrad)" />
            <polygon points="84,94 90,88 96,94 90,102" fill="url(#cyanDiamondGrad)" />
            <polygon points="102,95 108,89 114,95 108,103" fill="url(#cyanDiamondGrad)" />
          </g>

          {/* Floating Diamonds Left & Right */}
          <g filter="url(#glowCyan)">
            <polygon points="35,60 42,52 49,60 42,70" fill="url(#cyanDiamondGrad)" />
            <polygon points="155,75 162,67 169,75 162,85" fill="url(#cyanDiamondGrad)" />
            <polygon points="45,100 50,94 55,100 50,108" fill="url(#cyanDiamondGrad)" />
          </g>
        </svg>

        {/* Diamond Count Badge */}
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg font-black text-xs uppercase flex items-center gap-1.5 z-20">
          <span>💎 {amount.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  // Default Pinxtore high-tech cyan diamonds style
  return (
    <div className={`relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-[#030914] border border-cyan-500/20 p-2 ${className}`}>
      {/* Background Grid Lines & Cyan Radial Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c710_1px,transparent_1px),linear-gradient(to_bottom,#0284c710_1px,transparent_1px)] bg-[size:12px_12px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.2)_0%,transparent_75%)]" />

      {/* SVG Cyan Diamond Crystals Group */}
      <svg viewBox="0 0 200 130" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
        <defs>
          <linearGradient id="cyanDiamondGradPin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="35%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="goldCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          <filter id="glowCyanHigh" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Central Pile of Glowing Cyan Diamonds */}
        <g filter="url(#glowCyanHigh)">
          {/* Main Large Diamond */}
          <polygon points="100,35 125,55 100,105 75,55" fill="url(#cyanDiamondGradPin)" stroke="#e0f2fe" strokeWidth="1.5" />
          <path d="M 100,35 L 88,55 L 100,105 L 112,55 Z" fill="#ffffff" fillOpacity="0.25" />
          <line x1="75" y1="55" x2="125" y2="55" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />

          {/* Left Companion Diamond */}
          <polygon points="65,50 82,65 65,100 48,65" fill="url(#cyanDiamondGradPin)" stroke="#38bdf8" strokeWidth="1" />
          <line x1="48" y1="65" x2="82" y2="65" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" />

          {/* Right Companion Diamond */}
          <polygon points="135,50 152,65 135,100 118,65" fill="url(#cyanDiamondGradPin)" stroke="#38bdf8" strokeWidth="1" />
          <line x1="118" y1="65" x2="152" y2="65" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" />

          {/* Extra Stacked Diamonds for Large Packs */}
          {(isLarge || isHuge) && (
            <>
              <polygon points="85,30 98,42 85,70 72,42" fill="url(#cyanDiamondGradPin)" opacity="0.9" />
              <polygon points="115,30 128,42 115,70 102,42" fill="url(#cyanDiamondGradPin)" opacity="0.9" />
            </>
          )}

          {/* Huge Tray/Base for 5000+ Packs */}
          {isHuge && (
            <path d="M 40,95 Q 100,120 160,95 L 150,110 Q 100,125 50,110 Z" fill="url(#goldCapGrad)" />
          )}
        </g>

        {/* Sparkling Glint Effects */}
        <circle cx="100" cy="35" r="3" fill="#ffffff" className="animate-pulse" />
        <circle cx="125" cy="55" r="2" fill="#ffffff" />
        <circle cx="48" cy="65" r="2" fill="#ffffff" />
        <circle cx="152" cy="65" r="2" fill="#ffffff" />
      </svg>

      {/* Top Left Game Label */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20">
        <span className="text-[9px] font-black uppercase text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded tracking-wider">
          FREE FIRE LATAM
        </span>
      </div>

      {/* Top Right Store Label */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
        <span className="text-[9px] font-black uppercase text-white/80 bg-black/60 border border-white/10 px-2 py-0.5 rounded tracking-wider">
          TUNTUN STORE
        </span>
      </div>
    </div>
  );
};
