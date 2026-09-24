import React, { useState, useRef, useEffect } from 'react';
import { Product, HeroSlide, UserProfile } from '../../types';
import { CyanProductCard } from '../ProductCatalog';
import {
  Sparkles,
  Wallet,
  ShieldCheck,
  Zap,
  ArrowRight,
  MessageCircle,
  Clock,
  Flame,
  Diamond,
  CheckCircle2,
  Play,
  Share2,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWAHomeViewProps {
  products: Product[];
  heroSlides?: HeroSlide[];
  currentUser?: UserProfile | null;
  onSelectProduct: (product: Product) => void;
  onNavigateToWallet: () => void;
  onNavigateToCatalog: (category?: string) => void;
  onNavigateToAdminBanners?: () => void;
}

export const PWAHomeView: React.FC<PWAHomeViewProps> = ({
  products,
  heroSlides = [],
  currentUser,
  onSelectProduct,
  onNavigateToWallet,
  onNavigateToCatalog,
  onNavigateToAdminBanners,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Diapositivas por defecto si no hay en la base de datos
  const defaultSlides = [
    { id: '1', image_url: '/slide1.webp', title: 'Agenda Semanal Free Fire' },
    { id: '2', image_url: '/slide2.webp', title: 'Recargas Inmediatas 24/7' },
  ];
  const slides = heroSlides.length > 0 ? heroSlides : defaultSlides;

  const registerUserInteraction = () => {
    setIsUserInteracting(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    // Pausar auto-scroll y reanudar tras 60 segundos de inactividad
    resumeTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 60000);
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    registerUserInteraction();
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    registerUserInteraction();
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }
  };

  const goToSlide = (index: number) => {
    registerUserInteraction();
    setCurrentSlide(index);
  };

  // Auto-scroll del slider de banners cada 5 segundos si no hay interacción del usuario
  useEffect(() => {
    if (isUserInteracting || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isUserInteracting]);

  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  // Exclusivamente los 3 productos solicitados para "OFERTAS DESTACADAS": 110, 572 y 2398 DIAMANTES
  const targetKeys = [
    { id: 'dia-110', num: 110 },
    { id: 'dia-572', num: 572 },
    { id: 'dia-2398', num: 2398 },
  ];

  let featuredProducts: Product[] = [];
  targetKeys.forEach((tk) => {
    const found = products.find((p) => p.id === tk.id || p.diamonds === tk.num || p.name.includes(String(tk.num)));
    if (found) featuredProducts.push(found);
  });

  if (featuredProducts.length < 3) {
    const existingIds = new Set(featuredProducts.map((p) => p.id));
    const extra = products.filter((p) => !existingIds.has(p.id));
    featuredProducts = [...featuredProducts, ...extra].slice(0, 3);
  } else {
    featuredProducts = featuredProducts.slice(0, 3);
  }

  // Mobile Product Carousel State (3D Real Infinito)
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [prodTouchStart, setProdTouchStart] = useState<number | null>(null);
  const [prodTouchEnd, setProdTouchEnd] = useState<number | null>(null);

  const onProdTouchStart = (e: React.TouchEvent) => {
    setProdTouchEnd(null);
    setProdTouchStart(e.targetTouches[0].clientX);
  };
  const onProdTouchMove = (e: React.TouchEvent) => {
    setProdTouchEnd(e.targetTouches[0].clientX);
  };
  const onProdTouchEnd = () => {
    if (!prodTouchStart || !prodTouchEnd || featuredProducts.length < 3) return;
    const distance = prodTouchStart - prodTouchEnd;

    if (distance > minSwipeDistance) {
      triggerHaptic('light');
      setActiveProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }
    if (distance < -minSwipeDistance) {
      triggerHaptic('light');
      setActiveProductIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
    }
  };

  return (
    <div className="min-h-screen bg-[#020b08] text-white pb-28 select-none">
      {/* 🎠 BANNER / AGENDA SEMANAL — IDÉNTICO AL DISEÑO NAVEGADOR MÓVIL (SWIPE TÁCTIL, SIN SCROLLBARS) */}
      <section className="pt-3 pb-3 px-0 max-w-7xl mx-auto">
        <div className="relative flex items-center justify-center mb-3 px-4">
          <h2 className="text-xl sm:text-3xl font-black uppercase italic tracking-tighter text-white text-center">
            AGENDA <span className="text-amber-400">SEMANAL</span>
          </h2>
          {currentUser?.role === 'admin' && onNavigateToAdminBanners && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                onNavigateToAdminBanners();
              }}
              className="absolute right-4 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xl active:scale-95"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Banners</span>
            </button>
          )}
        </div>

        {/* Contenedor del Slider con transform translateX para evitar scrollbars nativos */}
        <div
          className="relative w-full rounded-none overflow-hidden border-y border-white/10 shadow-2xl group touch-pan-y bg-zinc-950"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="relative flex transition-transform duration-700 ease-in-out"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${(currentSlide * 100) / slides.length}%)`,
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.id || index}
                className="relative w-full flex items-center justify-center shrink-0"
                style={{ width: `${100 / slides.length}%` }}
              >
                <img
                  src={slide.image_url}
                  alt={slide.title || `Agenda Semanal ${index + 1}`}
                  className="w-full h-auto max-h-[550px] object-contain mx-auto"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Indicadores de bolitas */}
          {slides.length > 1 && (
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-125'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🔥 SECCIÓN: OFERTAS DESTACADAS (CARRUSEL INFINITO 3D REAL IDÉNTICO AL ORIGINAL) */}
      <section className="py-2 px-0 max-w-5xl mx-auto my-2">
        <div className="flex items-center justify-between mb-2 px-4">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              OFERTAS <span className="text-amber-400">DESTACADAS</span>
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigateToCatalog();
            }}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer active:scale-95 transition-all bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
          >
            <span>VER TODO</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Versión Móvil: Carrusel Infinito Real 3D */}
        <div 
          className="relative w-full h-[380px] overflow-hidden flex items-center justify-center touch-pan-y"
          onTouchStart={onProdTouchStart}
          onTouchMove={onProdTouchMove}
          onTouchEnd={onProdTouchEnd}
        >
          {featuredProducts.length === 3 ? (
            featuredProducts.map((product, idx) => {
              let position = 'center';
              if (idx === (activeProductIndex - 1 + 3) % 3) position = 'left';
              if (idx === (activeProductIndex + 1) % 3) position = 'right';

              let transform = 'translateX(0) scale(1)';
              let zIndex = 20;

              if (position === 'left') {
                transform = 'translateX(-65%) scale(0.85)';
                zIndex = 10;
              } else if (position === 'right') {
                transform = 'translateX(65%) scale(0.85)';
                zIndex = 10;
              }

              return (
                <div 
                  key={product.id} 
                  className="absolute w-[56%] max-w-[250px] h-[90%] transition-all duration-500 ease-out cursor-pointer"
                  style={{ transform, zIndex }}
                  onClick={() => {
                    if (position === 'left') {
                      triggerHaptic('light');
                      setActiveProductIndex((activeProductIndex - 1 + 3) % 3);
                    }
                    if (position === 'right') {
                      triggerHaptic('light');
                      setActiveProductIndex((activeProductIndex + 1) % 3);
                    }
                  }}
                >
                  <CyanProductCard 
                    product={product}
                    onSelectProduct={(p) => {
                      triggerHaptic('medium');
                      onSelectProduct(p);
                    }}
                    carouselMode={true}
                    isFeaturedMode={true}
                    forceActive={position === 'center'}
                  />
                </div>
              );
            })
          ) : (
            <div className="text-zinc-500 text-center w-full px-4 text-sm font-bold">
              Mostrando ofertas destacadas.
            </div>
          )}
        </div>

        {/* Dots para el carrusel de productos */}
        {featuredProducts.length === 3 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {[0, 1, 2].map((dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveProductIndex(dotIdx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeProductIndex === dotIdx
                    ? 'w-6 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'w-1.5 bg-white/20'
                }`}
                aria-label={`Ver oferta ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 📖 CÓMO COMPRAR — DISEÑO PLANO SIN CONTENEDOR ENVOLVENTE (SIN BOX-IN-BOX) */}
      <section className="py-4 px-3.5 max-w-6xl mx-auto">
        <h2 className="text-base sm:text-xl font-black text-center mb-3.5 uppercase italic text-white tracking-tighter">
          CÓMO <span className="text-amber-400">COMPRAR</span>
        </h2>

        <div className="grid grid-cols-1 gap-2.5 mb-3.5">
          {/* Paso 1 */}
          <div className="bg-zinc-900/90 rounded-2xl p-3.5 border border-white/10 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-400 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs text-white uppercase tracking-tight">1. Recarga Saldo</h3>
              <p className="text-[10.5px] text-zinc-400 leading-tight">
                Pichincha, Guayaquil, DeUna o pago en línea con PayPhone.
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="bg-zinc-900/90 rounded-2xl p-3.5 border border-white/10 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-amber-500/30 text-amber-400 shrink-0">
              <Diamond className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs text-white uppercase tracking-tight">2. Elige tu Pack</h3>
              <p className="text-[10.5px] text-zinc-400 leading-tight">
                Selecciona la cantidad de diamantes, pase o membresía.
              </p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="bg-zinc-900/90 rounded-2xl p-3.5 border border-white/10 flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-teal-500/30 text-teal-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xs text-white uppercase tracking-tight">3. Canjea Códigos</h3>
              <p className="text-[10.5px] text-zinc-400 leading-tight">
                Copia tu PIN instantáneo en Pedidos y actívalo en Garena.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('medium');
            onNavigateToWallet();
          }}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Recargar Saldo Ahora</span>
        </button>
      </section>

      {/* 🎬 VIDEO TUTORIAL OFICIAL — APRENDE A CANJEAR (DIRECTO COMO EN EL NAVEGADOR) */}
      <section className="py-5 px-3.5 bg-zinc-950/80 border-y border-white/5 relative overflow-hidden my-2">
        <div className="text-center mb-3">
          <h2 className="text-base sm:text-xl font-black uppercase italic text-white tracking-tighter">
            APRENDE A <span className="text-emerald-400">CANJEAR</span>
          </h2>
          <p className="text-[10.5px] text-zinc-400 mt-0.5">
            Tutorial oficial paso a paso para activar tus pines en Garena
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative p-[2px] rounded-2xl bg-gradient-to-tr from-emerald-500/40 via-transparent to-amber-500/40 shadow-xl max-w-[280px] w-full">
            <div className="relative w-full rounded-[14px] overflow-hidden bg-black aspect-[9/16]">
              <iframe
                src="https://www.tiktok.com/player/v1/7675461351858244882?music_info=1&description=1"
                loading="lazy"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="fullscreen"
                title="TunTun Store — Video Tutorial"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 📱 BANNER OFICIAL CANAL DE WHATSAPP (CON LOGO DE COMUNIDAD Y DISEÑO PRO) */}
      <div className="mx-3.5 my-4 relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)] bg-gradient-to-br from-emerald-950/80 via-[#03160e] to-black p-3.5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3 mb-3">
          {/* Logo Oficial de Comunidad */}
          <div className="relative w-14 h-14 shrink-0">
            <div className="absolute inset-0 bg-emerald-500/25 rounded-xl blur-md animate-pulse" />
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden border border-white/20 shadow-md">
              <img
                src="/logo-comunidad.webp"
                alt="Comunidad TunTun Store"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="inline-block bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/30 mb-1">
              Canal Oficial
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate tracking-tight">
              Comunidad TunTun Store
            </h4>
            <p className="text-[10.5px] text-zinc-300 line-clamp-2 leading-tight mt-0.5 font-medium">
              Ofertas exclusivas, torneos y sorteos de diamantes de Free Fire.
            </p>
          </div>
        </div>

        <a
          href="https://whatsapp.com/channel/0029VbCH5rr0bIdfTxGoPH2u"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => triggerHaptic('light')}
          className="w-full bg-[#25D366] hover:bg-[#20ba59] text-black font-black uppercase text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.4)] active:scale-95 transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span>Unirme al Canal Oficial</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 🌐 COMUNIDADES Y CONTACTO DIRECTO CON ÍCONOS OFICIALES */}
      <div className="grid grid-cols-2 gap-2.5 px-3.5 mb-4">
        {/* Soporte WhatsApp 24/7 con SVG Oficial */}
        <a
          href="https://wa.me/593968729952"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => triggerHaptic('light')}
          className="p-3 rounded-2xl bg-gradient-to-b from-[#0a2318] to-[#04130d] border border-emerald-500/30 flex flex-col justify-between active:scale-95 transition-all shadow-md cursor-pointer group"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center mb-2 shadow-sm group-hover:bg-[#25D366] group-hover:text-black transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <span className="text-[9px] font-black uppercase text-emerald-400 block tracking-wide">
              Soporte 24/7
            </span>
            <h5 className="text-xs font-black text-white leading-tight mt-0.5">
              WhatsApp Oficial
            </h5>
            <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
              Atención personalizada para recargas inmediatas.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-950/80 flex items-center justify-between text-emerald-400 text-[10.5px] font-black">
            <span>+593 96 872 9952</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </a>

        {/* TikTok Oficial con SVG Oficial */}
        <a
          href="https://tiktok.com/@tuntunstore1"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => triggerHaptic('light')}
          className="p-3 rounded-2xl bg-gradient-to-b from-[#1b0816] to-[#0d040e] border border-rose-500/30 flex flex-col justify-between active:scale-95 transition-all shadow-md cursor-pointer group"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff0050]/20 to-[#00f2fe]/20 border border-rose-500/30 text-white flex items-center justify-center mb-2 shadow-sm group-hover:from-[#ff0050] group-hover:to-[#00f2fe] group-hover:text-black transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 drop-shadow-[1px_1px_0_rgba(0,242,254,0.6)]">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.28 6.28 0 005.4 15.65a6.28 6.28 0 006.28 6.28A6.28 6.28 0 0018 15.65V9.43a8.3 8.3 0 004 1V6.69z"/>
              </svg>
            </div>
            <span className="text-[9px] font-black uppercase text-rose-400 block tracking-wide">
              Videos & Sorteos
            </span>
            <h5 className="text-xs font-black text-white leading-tight mt-0.5">
              TikTok Oficial
            </h5>
            <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
              Tutoriales, demostraciones y sorteos de diamantes.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-950/80 flex items-center justify-between text-rose-400 text-[10.5px] font-black">
            <span>@tuntunstore1</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </a>
      </div>

      {/* 🛡️ BADGES DE GARANTÍA RÁPIDOS */}
      <div className="mx-3.5 grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-400">
        <div className="p-2.5 rounded-xl bg-[#051711] border border-emerald-500/15">
          <Zap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="font-bold text-white block">Automático</span>
          <span>Entrega de PIN</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#051711] border border-emerald-500/15">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="font-bold text-white block">100% Seguro</span>
          <span>Sin riesgo de baneo</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#051711] border border-emerald-500/15">
          <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <span className="font-bold text-white block">Soporte 24/7</span>
          <span>En WhatsApp</span>
        </div>
      </div>
    </div>
  );
};
