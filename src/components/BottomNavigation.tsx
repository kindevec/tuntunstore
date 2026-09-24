import React, { useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { ShoppingBag, ClipboardList, Wallet, UserCog, Sparkles, Code, Home } from 'lucide-react';
import { useMotionValue, useSpring } from 'motion/react';
import { UserProfile } from '../types';

interface BottomNavigationProps {
  activeTab: 'home' | 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login';
  adminSubTab?: 'orders' | 'catalog' | 'email' | 'wallets' | 'codes' | 'banners';
  setActiveTab: (
    tab: 'home' | 'catalog' | 'wallet' | 'orders' | 'profile' | 'admin' | 'login',
    subTab?: 'orders' | 'catalog' | 'email' | 'wallets' | 'codes' | 'banners'
  ) => void;
  pendingOrdersCount: number;
  lowStockCodesCount?: number;
  currentUser: UserProfile | null;
  isPWA?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// 📐 GENERADORES GEOMÉTRICOS DEL EFECTO ONDULACIÓN / HUECO (IDÉNTICO A EMPAQUE AL TOQUE)
// Se hace un hueco suave hacia abajo y la bolita flota dejando un espacio visible
// ════════════════════════════════════════════════════════════════════════════
const SCOOP_HALF_W = 50; // Ancho del hueco
const SCOOP_DEPTH = 40;  // Profundidad del hueco hacia abajo
const TOTAL_NAV_H = 160; // Altura generosa para cubrir safe-area-inset-bottom en cualquier dispositivo

const getBorderPath = (cx: number, w: number) => {
  const leftX = cx - SCOOP_HALF_W;
  const rightX = cx + SCOOP_HALF_W;
  return `M 0,1.5 L ${Math.max(0, leftX)},1.5 C ${cx - 28},1.5 ${cx - 16},${SCOOP_DEPTH} ${cx},${SCOOP_DEPTH} C ${cx + 16},${SCOOP_DEPTH} ${cx + 28},1.5 ${Math.min(w, rightX)},1.5 L ${w},1.5`;
};

const getBgPath = (cx: number, w: number, totalH: number = TOTAL_NAV_H) => {
  const leftX = cx - SCOOP_HALF_W;
  const rightX = cx + SCOOP_HALF_W;
  return `M 0,1.5 L ${Math.max(0, leftX)},1.5 C ${cx - 28},1.5 ${cx - 16},${SCOOP_DEPTH} ${cx},${SCOOP_DEPTH} C ${cx + 16},${SCOOP_DEPTH} ${cx + 28},1.5 ${Math.min(w, rightX)},1.5 L ${w},1.5 L ${w},${totalH} L 0,${totalH} Z`;
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  adminSubTab = 'orders',
  setActiveTab,
  pendingOrdersCount,
  lowStockCodesCount = 0,
  currentUser,
  isPWA = false,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Refs para animación fluida directa al DOM (60-120 fps sin re-renders de React)
  const menuRef = useRef<HTMLDivElement>(null);
  const borderPathRef = useRef<SVGPathElement>(null);
  const bgPathRef = useRef<SVGPathElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navWidthRef = useRef<number>(
    typeof window !== 'undefined' ? window.innerWidth : 390
  );

  // Lista de items según rol (SOLO ÍCONOS EN MODO PWA)
  const clientItems = [
    { id: 'catalog' as const, label: 'Catálogo', icon: ShoppingBag },
    { id: 'wallet' as const, label: 'Billetera', icon: Wallet },
    { id: 'home' as const, label: 'Inicio', icon: Home },
    { id: 'orders' as const, label: 'Pedidos', icon: ClipboardList },
    { id: 'profile' as const, label: 'Perfil', icon: UserCog },
  ];

  const adminItems = [
    { id: 'catalog' as const, subTab: undefined, label: 'Catálogo', icon: ShoppingBag },
    { id: 'admin' as const, subTab: 'orders' as const, label: 'Pedidos', icon: ClipboardList },
    { id: 'admin' as const, subTab: 'wallets' as const, label: 'Saldos', icon: Wallet },
    { id: 'admin' as const, subTab: 'catalog' as const, label: 'CRUD', icon: Sparkles },
    { id: 'admin' as const, subTab: 'codes' as const, label: 'Códigos', icon: Code },
  ];

  const currentItems = isAdmin ? adminItems : clientItems;

  const getActiveIndex = useCallback((): number => {
    if (isAdmin) {
      if (activeTab === 'catalog') return 0;
      if (activeTab === 'admin') {
        if (adminSubTab === 'wallets') return 2;
        if (adminSubTab === 'catalog') return 3;
        if (adminSubTab === 'codes') return 4;
        return 1; // Default a Pedidos
      }
      return 0;
    }
    if (activeTab === 'catalog') return 0;
    if (activeTab === 'wallet') return 1;
    if (activeTab === 'home') return 2;
    if (activeTab === 'orders') return 3;
    if (activeTab === 'profile') return 4;
    return 2; // Por defecto Inicio
  }, [isAdmin, activeTab, adminSubTab]);

  const activeIndex = getActiveIndex();

  // Física de resorte suave ultra-fluida (estilo Empaque al Toque)
  const rawX = useMotionValue(
    typeof window !== 'undefined' ? window.innerWidth / 2 : 195
  );
  const springX = useSpring(rawX, { stiffness: 240, damping: 26, mass: 0.85 });

  const updateScoopPosition = useCallback(() => {
    const activeItem = itemRefs.current[activeIndex];
    const menu = menuRef.current;
    if (activeItem && menu) {
      const activeRect = activeItem.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const centerX = activeRect.left - menuRect.left + activeRect.width / 2;
      navWidthRef.current = menuRect.width || window.innerWidth;
      rawX.set(centerX);

      if (borderPathRef.current && bgPathRef.current) {
        const w = navWidthRef.current;
        borderPathRef.current.setAttribute('d', getBorderPath(centerX, w));
        bgPathRef.current.setAttribute('d', getBgPath(centerX, w, TOTAL_NAV_H));
      }
    }
  }, [activeIndex, rawX]);

  useLayoutEffect(() => {
    if (!isPWA) return;
    updateScoopPosition();

    const handleResize = () => {
      updateScoopPosition();
    };

    window.addEventListener('resize', handleResize);
    const rId = requestAnimationFrame(updateScoopPosition);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rId);
    };
  }, [updateScoopPosition, isPWA, activeTab, adminSubTab]);

  // Actualización directa al DOM del SVG a 60-120fps sin re-renders de React
  useEffect(() => {
    if (!isPWA) return;
    return springX.on('change', (cx) => {
      const w = navWidthRef.current;
      if (borderPathRef.current) {
        borderPathRef.current.setAttribute('d', getBorderPath(cx, w));
      }
      if (bgPathRef.current) {
        bgPathRef.current.setAttribute('d', getBgPath(cx, w, TOTAL_NAV_H));
      }
    });
  }, [springX, isPWA]);

  // ════════════════════════════════════════════════════════════════════════════
  // 📱 MODO 1: ESTILO PWA — 100% ANCHO, PEGADO AL PISO, HUECO ONDULADO + BOLITA FLOTANTE (SIN LETRAS)
  // Optimizado: CSS transforms nativas (GPU), sin motion.div por botón, sin SVG filters costosos
  // ════════════════════════════════════════════════════════════════════════════
  if (isPWA) {
    const initialW = typeof window !== 'undefined' ? window.innerWidth : 390;
    const initialCx = initialW / 2;

    return (
      <nav
        ref={menuRef}
        id="bottom-navigation-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 h-[54px] pb-[env(safe-area-inset-bottom)] select-none overflow-visible pointer-events-none"
      >
        {/* FONDO Y LÍNEA SUPERIOR SVG CON HUECO ONDULADO (MUTABLE DIRECTO POR SPRING, SIN FILTERS) */}
        <svg
          className="absolute inset-0 w-full h-[calc(54px+env(safe-area-inset-bottom,0px)+60px)] pointer-events-none overflow-visible"
        >
          <defs>
            <linearGradient id="tuntun-pwa-border-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {isAdmin ? (
                <>
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Fondo oscuro con hueco ondulado hacia abajo */}
          <path
            ref={bgPathRef}
            d={getBgPath(initialCx, initialW, TOTAL_NAV_H)}
            fill="#07090e"
            fillOpacity="0.98"
          />

          {/* Borde superior continuo con el hueco — sin filter SVG costoso, glow via CSS */}
          <path
            ref={borderPathRef}
            d={getBorderPath(initialCx, initialW)}
            fill="none"
            stroke="url(#tuntun-pwa-border-gradient)"
            strokeWidth="2.4"
            strokeLinecap="round"
            style={{
              filter: isAdmin
                ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.5))'
                : 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.45))',
            }}
          />
        </svg>

        {/* CONTENEDOR DE BOTONES (OCUPANDO EL 100% DEL ANCHO, SOLO ÍCONOS) */}
        <div className="flex items-center justify-around w-full h-full relative z-30 pointer-events-auto px-1">
          {currentItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;

            const handleClick = () => {
              if (isAdmin && 'subTab' in item) {
                setActiveTab(item.id, item.subTab);
              } else {
                setActiveTab(item.id);
              }
            };

            return (
              <button
                key={`${item.id}-${index}`}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onClick={handleClick}
                className="relative flex-1 h-full flex items-center justify-center cursor-pointer select-none py-1 group"
                aria-label={item.label}
              >
                {/* BOLITA ELEVADA — CSS transform + transition nativa (GPU-acelerada, 0 re-renders React) */}
                <div
                  className="flex items-center justify-center relative will-change-transform"
                  style={{
                    transform: isActive ? 'translateY(-17px) scale(1)' : 'translateY(0) scale(1)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {/* Aro activo — siempre en DOM, controlado por opacity+scale para evitar mount/unmount */}
                  <div
                    className={`absolute inset-0 w-[44px] h-[44px] rounded-full p-[2px] flex items-center justify-center will-change-[opacity,transform] ${
                      isAdmin
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-300 shadow-[0_4px_15px_rgba(245,158,11,0.45)]'
                        : 'bg-gradient-to-tr from-emerald-500 to-emerald-300 shadow-[0_4px_15px_rgba(16,185,129,0.45)]'
                    }`}
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scale(1)' : 'scale(0.7)',
                      transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      // Centrar el aro respecto al contenedor del ícono
                      left: '50%',
                      top: '50%',
                      marginLeft: '-22px',
                      marginTop: '-22px',
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-[#07090e]" />
                  </div>

                  {/* Ícono — siempre montado, color cambia via CSS transition */}
                  <div className="w-9 h-9 flex items-center justify-center relative z-10">
                    <Icon
                      className={`w-[21px] h-[21px] transition-colors duration-200 ${
                        isActive
                          ? isAdmin
                            ? 'text-amber-400 stroke-[2.5]'
                            : 'text-emerald-400 stroke-[2.5]'
                          : 'text-zinc-400 stroke-[2] group-hover:text-white'
                      }`}
                    />
                  </div>

                  {/* Badges de notificación */}
                  {item.id === 'orders' && pendingOrdersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[7.5px] font-black px-1.5 rounded-full border border-black leading-none py-0.5 shadow-sm z-20">
                      {pendingOrdersCount}
                    </span>
                  )}
                  {item.id === 'wallet' && currentUser && (
                    <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-black text-[7px] font-black px-1.5 rounded-full font-mono leading-none py-0.5 shadow-sm z-20">
                      ${(currentUser?.walletBalanceUSD ?? 0).toFixed(0)}
                    </span>
                  )}
                  {isAdmin && 'subTab' in item && item.subTab === 'codes' && lowStockCodesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[7.5px] font-black px-1.5 rounded-full border border-black leading-none py-0.5 shadow-sm z-20">
                      {lowStockCodesCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 🌐 MODO 2: ESTILO BROWSER WEB NORMAL (100% INTACTO Y ORIGINAL)
  // ════════════════════════════════════════════════════════════════════════════
  if (isAdmin) {
    return (
      <nav
        id="bottom-navigation-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07090e]/95 border-t border-amber-500/30 backdrop-blur-xl px-1 py-1.5 flex items-center justify-around gap-0.5 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]"
      >
        {/* Admin Tab 1: Catálogo */}
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'catalog'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ShoppingBag className={`w-4 h-4 ${activeTab === 'catalog' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Catálogo</span>
        </button>

        {/* Admin Tab 2: Pedidos Admin */}
        <button
          onClick={() => setActiveTab('admin', 'orders')}
          className={`relative flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'admin' && adminSubTab === 'orders'
              ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <ClipboardList className={`w-4 h-4 ${activeTab === 'admin' && adminSubTab === 'orders' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-black text-[8px] font-black px-1 py-0.2 rounded-full border border-black animate-pulse leading-none">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Pedidos</span>
        </button>

        {/* Admin Tab 3: Billeteras USD & Usuarios */}
        <button
          onClick={() => setActiveTab('admin', 'wallets')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'admin' && adminSubTab === 'wallets'
              ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Wallet className={`w-4 h-4 ${activeTab === 'admin' && adminSubTab === 'wallets' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Saldos</span>
        </button>

        {/* Admin Tab 4: CRUD Productos */}
        <button
          onClick={() => setActiveTab('admin', 'catalog')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'admin' && adminSubTab === 'catalog'
              ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'admin' && adminSubTab === 'catalog' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">CRUD</span>
        </button>

        {/* Admin Tab 5: Códigos */}
        <button
          onClick={() => setActiveTab('admin', 'codes')}
          className={`relative flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer px-1 ${
            activeTab === 'admin' && adminSubTab === 'codes'
              ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Code className={`w-4 h-4 ${activeTab === 'admin' && adminSubTab === 'codes' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
            {lowStockCodesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-black px-1 py-0.2 rounded-full border border-black animate-pulse leading-none">
                {lowStockCodesCount}
              </span>
            )}
          </div>
          <span className="text-[8px] xs:text-[9.5px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Códigos</span>
        </button>
      </nav>
    );
  }

  // Cliente en Browser Web Normal
  return (
    <nav
      id="bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07090e]/95 border-t border-emerald-500/20 backdrop-blur-xl px-1.5 py-1.5 flex items-center justify-around gap-1 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]"
    >
      {/* Tab 1: Catálogo */}
      <button
        onClick={() => setActiveTab('catalog')}
        className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer ${
          activeTab === 'catalog'
            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <ShoppingBag className={`w-4 h-4 xs:w-5 xs:h-5 ${activeTab === 'catalog' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
        <span className="text-[8.5px] xs:text-[10px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Catálogo</span>
      </button>

      {/* Tab 2: Billetera USD */}
      <button
        onClick={() => setActiveTab('wallet')}
        className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all relative cursor-pointer ${
          activeTab === 'wallet'
            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <Wallet className={`w-4 h-4 xs:w-5 xs:h-5 ${activeTab === 'wallet' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
          {currentUser && (
            <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-black text-[7px] xs:text-[8px] font-black px-1 rounded-full font-mono leading-none py-0.5 shadow-sm">
              ${(currentUser?.walletBalanceUSD ?? 0).toFixed(0)}
            </span>
          )}
        </div>
        <span className="text-[8.5px] xs:text-[10px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Billetera</span>
      </button>

      {/* Tab 3: Inicio (Centro) */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer ${
          activeTab === 'home'
            ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Home className={`w-4 h-4 xs:w-5 xs:h-5 ${activeTab === 'home' ? 'text-amber-400 stroke-[2.5]' : ''}`} />
        <span className="text-[8.5px] xs:text-[10px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Inicio</span>
      </button>

      {/* Tab 4: Mis Pedidos */}
      <button
        onClick={() => setActiveTab('orders')}
        className={`relative flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer ${
          activeTab === 'orders'
            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <ClipboardList className={`w-4 h-4 xs:w-5 xs:h-5 ${activeTab === 'orders' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
          {pendingOrdersCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-amber-400 text-black text-[8px] font-black px-1 py-0.2 rounded-full border border-black animate-pulse leading-none">
              {pendingOrdersCount}
            </span>
          )}
        </div>
        <span className="text-[8.5px] xs:text-[10px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Pedidos</span>
      </button>

      {/* Tab 5: Mi Perfil */}
      {currentUser && (
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 min-w-0 h-11 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <UserCog className={`w-4 h-4 xs:w-5 xs:h-5 ${activeTab === 'profile' ? 'text-emerald-400 stroke-[2.5]' : ''}`} />
          <span className="text-[8.5px] xs:text-[10px] font-black uppercase tracking-tight mt-0.5 truncate max-w-full">Perfil</span>
        </button>
      )}
    </nav>
  );
};
