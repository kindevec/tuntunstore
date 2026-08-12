import React, { useState, useEffect, useRef } from 'react';
import { Product, HeroSlide } from '../types';
import { ShoppingCart, Diamond, Wallet, ArrowRight, Play, CheckCircle2, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CyanProductCard } from './ProductCatalog';

interface HomeViewProps {
  currentUser?: any;
  products: Product[];
  heroSlides?: HeroSlide[];
  onSelectProduct: (product: Product) => void;
  onNavigateToWallet: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToAdminBanners?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  heroSlides = [],
  currentUser,
  onSelectProduct,
  onNavigateToWallet,
  onNavigateToCatalog,
  onNavigateToAdminBanners
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const registerUserInteraction = () => {
    setIsUserInteracting(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    // Pausar auto-scroll y reanudar tras 1 minuto (60,000 ms) de inactividad
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
      setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe) {
      setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    }
  };

  const goToSlide = (index: number) => {
    registerUserInteraction();
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    registerUserInteraction();
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    registerUserInteraction();
    setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const defaultSlides = [
    {
      image: '/slide1.webp',
    },
    {
      image: '/slide2.webp',
    }
  ];

  const slides = heroSlides.length > 0 
    ? heroSlides.map(hs => ({
        image: hs.image_url,
      }))
    : defaultSlides;

  // Auto-scroll (5s), se desactiva por 1 minuto al interactuar
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
    { id: 'dia-2398', num: 2398 }
  ];

  let featuredProducts: Product[] = [];
  targetKeys.forEach(tk => {
    const found = products.find(p => p.id === tk.id || p.diamonds === tk.num || p.name.includes(String(tk.num)));
    if (found) featuredProducts.push(found);
  });

  // Fallback de respaldo en caso de que falte algún producto en el catálogo
  if (featuredProducts.length < 3) {
    const existingIds = new Set(featuredProducts.map(p => p.id));
    const extra = products.filter(p => p.active && !existingIds.has(p.id));
    featuredProducts = [...featuredProducts, ...extra].slice(0, 3);
  }

  // Mobile Product Carousel State
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
      setActiveProductIndex(prev => (prev + 1) % featuredProducts.length);
    }
    if (distance < -minSwipeDistance) {
      setActiveProductIndex(prev => (prev - 1 + featuredProducts.length) % featuredProducts.length);
    }
  };

  return (
    <div className="bg-[#050505] text-white min-h-screen pb-20 md:pb-0 font-sans w-full animate-in fade-in duration-500">
      
      {/* Banner / Agenda Semanal Section */}
      <section className="pt-6 pb-8 md:pt-8 md:pb-12 px-0 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative flex items-center justify-center mb-4 sm:mb-6 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter text-white text-center">
            AGENDA <span className="text-amber-400">SEMANAL</span>
          </h2>
          {currentUser?.role === 'admin' && onNavigateToAdminBanners && (
            <button
              onClick={() => onNavigateToAdminBanners()}
              className="absolute right-4 sm:right-0 bg-black/70 hover:bg-black/90 backdrop-blur-md border border-amber-500/40 text-amber-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xl"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="hidden sm:inline">Administrar Banners</span>
              <span className="sm:hidden">Banners</span>
            </button>
          )}
        </div>

        {/* Mobile Banner (Standard Slider) */}
        <div 
          className="sm:hidden relative w-full rounded-none overflow-hidden border-y border-white/10 shadow-2xl group touch-pan-y bg-zinc-950"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="relative flex transition-transform duration-700 ease-in-out" 
            style={{ width: `${slides.length * 100}%`, transform: `translateX(-${(currentSlide * 100) / slides.length}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.image || index} className="relative w-full flex items-center justify-center shrink-0" style={{ width: `${100 / slides.length}%` }}>
                <img 
                  src={slide.image} 
                  alt={`Agenda Semanal ${index + 1}`} 
                  className="w-full h-auto max-h-[550px] sm:max-h-[650px] object-contain sm:object-cover mx-auto"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Dots for Mobile */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide 
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-125' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Banner (3D Carousel) */}
        <div className="hidden sm:flex relative w-full h-[400px] md:h-[500px] lg:h-[580px] overflow-hidden items-center justify-center group my-2">
          {(slides.length === 2 ? [...slides, ...slides] : slides).map((slide, idx, arr) => {
             const len = arr.length;
             let position = 'hidden';
             let transform = 'scale(0.6) translateX(0)';
             let zIndex = 0;
             let opacity = 0;

             if (len === 1) {
                position = 'center';
                transform = 'translateX(0) scale(1)';
                zIndex = 20;
                opacity = 1;
             } else {
                if (idx === currentSlide) {
                   position = 'center';
                   transform = 'translateX(0) scale(1)';
                   zIndex = 20;
                   opacity = 1;
                } else if (idx === (currentSlide - 1 + len) % len) {
                   position = 'left';
                   transform = 'translateX(-65%) scale(0.85)';
                   zIndex = 10;
                   opacity = 0.5;
                } else if (idx === (currentSlide + 1) % len) {
                   position = 'right';
                   transform = 'translateX(65%) scale(0.85)';
                   zIndex = 10;
                   opacity = 0.5;
                } else {
                   transform = 'translateX(0) scale(0.5)';
                   opacity = 0;
                }
             }

             return (
               <div 
                 key={`${slide.image || idx}-${idx}`}
                 className="absolute h-[90%] transition-all duration-700 ease-out cursor-pointer group"
                 style={{ transform, zIndex, opacity }}
                 onClick={() => {
                   if (position === 'left') prevSlide();
                   else if (position === 'right') nextSlide();
                   else goToSlide(idx % slides.length);
                 }}
               >
                  <img 
                    src={slide.image} 
                    className={`h-full w-auto max-w-[80vw] lg:max-w-[900px] object-cover rounded-3xl border transition-all duration-700 relative z-10 ${
                      position === 'center' 
                        ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                        : 'border-emerald-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:border-emerald-400 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                    }`} 
                    alt={`Banner ${idx}`} 
                  />
                  <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 z-20 rounded-3xl ${position === 'center' ? 'opacity-0' : 'opacity-60 bg-black'}`}></div>
               </div>
             )
          })}

          {/* Desktop Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 hover:bg-emerald-500 text-white backdrop-blur-sm border border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:scale-110 group/btn"
              >
                <ChevronLeft className="w-7 h-7 group-hover/btn:-translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 hover:bg-emerald-500 text-white backdrop-blur-sm border border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:scale-110 group/btn"
              >
                <ChevronRight className="w-7 h-7 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}

          {/* Dots for Desktop */}
          {slides.length > 1 && (
            <div className="absolute bottom-0 lg:bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide 
                      ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] scale-125' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How to Buy Section - Compact Version */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-xl md:text-3xl font-black text-center mb-6 uppercase italic text-white tracking-tighter">
          CÓMO <span className="text-amber-400">COMPRAR</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {/* Step 1 */}
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-white/5 relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-md flex flex-row sm:flex-col items-center sm:text-center text-left gap-3 sm:gap-0">
            <div className="absolute -right-5 -top-5 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center sm:mb-3 border border-white/10 group-hover:border-emerald-500 shadow-md transition-colors shrink-0">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-black text-sm mb-1 text-white uppercase tracking-tight">1. Recarga Saldo</h3>
              <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-medium">
                Agrega fondos a tu cuenta con transferencia bancaria segura.
              </p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-white/5 relative overflow-hidden group hover:border-amber-400/50 transition-colors shadow-md flex flex-row sm:flex-col items-center sm:text-center text-left gap-3 sm:gap-0">
            <div className="absolute -right-5 -top-5 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all pointer-events-none"></div>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center sm:mb-3 border border-white/10 group-hover:border-amber-400 shadow-md transition-colors shrink-0">
              <Diamond className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-sm mb-1 text-white uppercase tracking-tight">2. Elige tu Pack</h3>
              <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-medium">
                Selecciona el paquete de diamantes en nuestro catálogo.
              </p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-white/5 relative overflow-hidden group hover:border-teal-400/50 transition-colors shadow-md flex flex-row sm:flex-col items-center sm:text-center text-left gap-3 sm:gap-0">
            <div className="absolute -right-5 -top-5 w-24 h-24 bg-teal-400/10 rounded-full blur-2xl group-hover:bg-teal-400/20 transition-all pointer-events-none"></div>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center sm:mb-3 border border-white/10 group-hover:border-teal-400 shadow-md transition-colors shrink-0">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-black text-sm mb-1 text-white uppercase tracking-tight">3. Canjea Códigos</h3>
              <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-medium">
                Recibe tu código al instante en tus pedidos y actívalo.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={onNavigateToWallet}
            className="bg-emerald-500 text-black font-black text-xs uppercase px-6 py-3 rounded-xl hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] cursor-pointer flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            RECARGAR AHORA
          </button>
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section className="py-10 md:py-16 bg-zinc-950 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            {/* Glow Orbs */}
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
            {/* HUD Elements */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/20 rounded-tl-xl"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-emerald-500/20 rounded-br-xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-2xl md:text-4xl font-black text-center mb-8 uppercase italic text-white tracking-tighter">
            APRENDE A <span className="text-emerald-400">CANJEAR</span>
          </h2>
          
          <div className="flex justify-center">
              {/* TikTok Video — iframe directo, solo el video */}
              <div className="relative p-[3px] rounded-3xl bg-gradient-to-tr from-emerald-500/40 via-transparent to-amber-500/40 shadow-[0_0_50px_rgba(16,185,129,0.15)] max-w-[340px] w-full">
                  <div className="relative w-full rounded-[22px] overflow-hidden bg-black" style={{ aspectRatio: '9/16' }}>
                    <iframe
                      src="https://www.tiktok.com/player/v1/7672753276164607250?music_info=1&description=1"
                      loading="lazy"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="fullscreen"
                      title="TunTun Store — Video Oficial"
                    />
                  </div>
              </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <h2 className="text-xl md:text-3xl font-black uppercase italic text-white tracking-tighter">
            OFERTAS <span className="text-amber-400">DESTACADAS</span>
          </h2>
          <button 
            onClick={onNavigateToCatalog}
            className="text-xs font-black text-amber-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl"
          >
            VER TODAS <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Versión Escritorio (Grid) */}
        <div className="hidden sm:grid grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <CyanProductCard 
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              isFeaturedMode={true}
            />
          ))}
        </div>

        {/* Versión Móvil (Carrusel Infinito Real 3D) */}
        <div 
          className="sm:hidden relative w-full h-[380px] overflow-hidden flex items-center justify-center touch-pan-y"
          onTouchStart={onProdTouchStart}
          onTouchMove={onProdTouchMove}
          onTouchEnd={onProdTouchEnd}
        >
          {featuredProducts.length === 3 ? featuredProducts.map((product, idx) => {
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
                className="absolute w-[55%] h-[90%] transition-all duration-500 ease-out cursor-pointer"
                style={{ transform, zIndex }}
                onClick={() => {
                   if (position === 'left') setActiveProductIndex((activeProductIndex - 1 + 3) % 3);
                   if (position === 'right') setActiveProductIndex((activeProductIndex + 1) % 3);
                }}
              >
                <CyanProductCard 
                  product={product}
                  onSelectProduct={onSelectProduct}
                  carouselMode={true}
                  isFeaturedMode={true}
                  forceActive={position === 'center'}
                />
              </div>
            );
          }) : (
            <div className="text-zinc-500 text-center w-full px-4 text-sm font-bold">
              Mostrando vista de respaldo.
            </div>
          )}
        </div>

        {featuredProducts.length === 0 && (
            <div className="col-span-1 sm:col-span-3 py-16 text-center border-2 border-dashed border-white/10 rounded-3xl bg-zinc-900/50 mt-4">
               <p className="text-zinc-500 font-bold text-sm uppercase tracking-wider">No hay productos destacados disponibles en este momento.</p>
            </div>
        )}
      </section>

      {/* Redes Sociales Section */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/5">
        <h2 className="text-xl md:text-3xl font-black text-center mb-6 uppercase italic text-white tracking-tighter">
          NUESTRAS <span className="text-emerald-400">COMUNIDADES</span>
        </h2>
        
        {/* WhatsApp Community Prominent Banner */}
        <a 
          href="https://whatsapp.com/channel/0029VbCH5rr0bIdfTxGoPH2u" 
          target="_blank" 
          rel="noreferrer"
          className="group block relative w-full rounded-3xl overflow-hidden mb-6 sm:mb-8 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:border-emerald-400/50 transition-all duration-500"
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-[#050505] to-zinc-900/90 z-0"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 lg:p-10 gap-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
              {/* Floating WhatsApp Icon */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-400/40 transition-colors animate-pulse"></div>
                <div className="relative w-full h-full bg-black rounded-2xl flex items-center justify-center shadow-xl rotate-3 group-hover:-rotate-3 transition-transform duration-500 border border-white/20 overflow-hidden">
                  <img 
                    src="/logo-comunidad.webp" 
                    alt="Logo Comunidad" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              
              <div>
                <div className="inline-block bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 mb-2">Canal Oficial</div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 tracking-tight">Comunidad TunTun Store</h3>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-md leading-relaxed font-medium">Únete a nuestro canal de WhatsApp para ser el primero en enterarte de <span className="text-white font-bold">ofertas exclusivas, torneos y sorteos de diamantes</span>.</p>
              </div>
            </div>
            
            <div className="w-full sm:w-auto shrink-0">
              <div className="bg-[#25D366] text-black font-black uppercase text-sm px-6 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 group-hover:bg-[#1fbe58] transition-colors shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)]">
                Unirme Ahora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </a>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Facebook */}
          <a href="https://www.facebook.com/profile.php?id=61592564474036" target="_blank" rel="noreferrer" className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg border border-white/10 block">
            {/* Fondo de imagen difuminada */}
            <div className="absolute inset-0 bg-[url('/logo.webp')] bg-cover bg-center blur-[2px] scale-105 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-black/60 group-hover:bg-[#1877F2]/80 transition-colors duration-300"></div>
            
            {/* Contenido revelado en Hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md mb-3 border border-white/20 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white group-hover:text-[#1877F2] transition-colors">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <h3 className="font-black text-lg text-white uppercase tracking-wider translate-y-2 group-hover:translate-y-0 transition-transform">Facebook</h3>
              <p className="text-xs text-white/0 group-hover:text-white/90 font-medium mt-1 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">Únete a nuestra página</p>
            </div>
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/sahur055?igsh=MWs3cXI1cDM0Z2x2YQ==" target="_blank" rel="noreferrer" className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg border border-white/10 block">
            <div className="absolute inset-0 bg-[url('/logo.webp')] bg-cover bg-center blur-[2px] scale-105 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-black/60 group-hover:bg-gradient-to-tr group-hover:from-[#f09433] group-hover:via-[#dc2743] group-hover:to-[#bc1888] group-hover:opacity-90 transition-all duration-300"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md mb-3 border border-white/20 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white group-hover:text-[#dc2743] transition-colors">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </div>
              <h3 className="font-black text-lg text-white uppercase tracking-wider translate-y-2 group-hover:translate-y-0 transition-transform">Instagram</h3>
              <p className="text-xs text-white/0 group-hover:text-white/90 font-medium mt-1 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">Síguenos para sorteos</p>
            </div>
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/593968729952" target="_blank" rel="noreferrer" className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg border border-white/10 block">
            <div className="absolute inset-0 bg-[url('/logo.webp')] bg-cover bg-center blur-[2px] scale-105 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-black/60 group-hover:bg-[#25D366]/90 transition-colors duration-300"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md mb-3 border border-white/20 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white group-hover:text-[#25D366] transition-colors">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <h3 className="font-black text-lg text-white uppercase tracking-wider translate-y-2 group-hover:translate-y-0 transition-transform">WhatsApp</h3>
              <p className="text-xs text-white/0 group-hover:text-white/90 font-medium mt-1 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">Soporte y compras</p>
            </div>
          </a>

          {/* TikTok */}
          <a href="https://tiktok.com/@tuntunstore1" target="_blank" rel="noreferrer" className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg border border-white/10 block">
            <div className="absolute inset-0 bg-[url('/logo.webp')] bg-cover bg-center blur-[2px] scale-105 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/80 transition-colors duration-300"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md mb-3 border border-white/20 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white group-hover:text-[#ff0050] transition-colors drop-shadow-[1px_1px_0_#00f2fe]">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.28 6.28 0 005.4 15.65a6.28 6.28 0 006.28 6.28A6.28 6.28 0 0018 15.65V9.43a8.3 8.3 0 004 1V6.69z"/>
                </svg>
              </div>
              <h3 className="font-black text-lg text-white uppercase tracking-wider translate-y-2 group-hover:translate-y-0 transition-transform">TikTok</h3>
              <p className="text-xs text-white/0 group-hover:text-white/90 font-medium mt-1 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">Contenido exclusivo</p>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
};
