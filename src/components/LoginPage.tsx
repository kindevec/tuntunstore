import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  User, Lock, Mail, ShieldCheck, Sparkles, Gamepad2,
  Eye, EyeOff, ArrowLeft, LogIn, AlertCircle, Zap,
  CreditCard, Headphones, Gem, CheckCircle2, Diamond
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginGoogle: (role: 'client' | 'admin') => void;
  onLoginSuccess: (user: UserProfile) => void;
  onRegisterUser: (name: string, email: string, playerId?: string) => void;
  redirectReason?: string | null;
  onBackToCatalog: () => void;
  registeredUsers: UserProfile[];
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginGoogle,
  onLoginSuccess,
  onRegisterUser,
  redirectReason,
  onBackToCatalog,
  registeredUsers,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setErrorMessage(`Error de acceso: ${error.message}`);
    } else if (data.user) {
      // The onAuthStateChange listener in App.tsx will pick this up automatically
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          full_name: name.trim(),
          player_id: playerId.trim() || null,
        }
      }
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      if (!data.session) {
        alert("¡Cuenta creada exitosamente! Si Supabase requiere confirmación, por favor revisa tu bandeja de entrada.");
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#05070a] text-white flex flex-col lg:flex-row overflow-hidden">
      
      {/* LEFT COLUMN: Clean Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col p-3 sm:p-6 lg:p-16 relative z-10 h-full overflow-hidden">
        
        {/* Subtle ambient glow for mobile */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none lg:hidden" />
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none lg:hidden" />


        {/* Center: Logo + Brand + Form */}
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md mx-auto relative z-10">
          
          {/* ----------------- MOBILE LOGO (Premium Animated) ----------------- */}
          <div className="relative flex justify-center w-full mb-3 pt-1 lg:hidden shrink-0">
            {/* Outer Glow / Halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 bg-emerald-500/30 blur-[40px] rounded-full animate-pulse pointer-events-none" />
            {/* Animated Rotating Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-t-2 border-r-2 border-emerald-400/50 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] rounded-full border-b-2 border-l-2 border-emerald-500/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
            
            {/* The Logo Itself */}
            <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-b from-zinc-800 via-zinc-950 to-black shadow-[0_0_30px_rgba(16,185,129,0.3)] ring-2 ring-black/50">
              <div className="w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-emerald-600 via-emerald-400 to-emerald-900">
                <img
                  src="/logo.jpeg"
                  alt="TunTun Store"
                  className="w-full h-full object-cover rounded-full border-2 border-black"
                />
              </div>
              {/* Micro-badge on logo */}
              <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-black p-1 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-black">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* ----------------- DESKTOP LOGO (Original) ----------------- */}
          <div className="hidden lg:flex items-center gap-3.5 mb-6 self-start">
            <img 
              src="/logo-transparent.png" 
              alt="TunTun Store Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] shrink-0"
            />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                <span>TunTun</span>
                <span className="text-emerald-400 italic">Store</span>
              </h2>
              <p className="text-xs text-emerald-400/80 font-semibold">Tu Tienda Gamer de Recargas Directas</p>
            </div>
          </div>

          {/* Form Title */}
          <div className="mb-2 sm:mb-4 w-full text-center lg:text-left relative z-10 shrink-0">
            <h1 className="text-lg sm:text-3xl font-black tracking-tight text-white mb-0 sm:mb-1.5">
              {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Gamer'}
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-zinc-400">
              {authMode === 'login'
                ? 'Ingresa a tu cuenta para recargar tus juegos y comprar PINs al instante'
                : 'Únete hoy y disfruta de las recargas más rápidas y los PINs más accesibles'}
            </p>
          </div>

          {/* FORM CONTAINER (Premium Glassmorphism on Mobile, Original on Desktop) */}
          <div className="w-full bg-zinc-950/60 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border border-white/5 lg:border-transparent rounded-3xl lg:rounded-none p-4 sm:p-8 lg:p-0 shadow-2xl lg:shadow-none relative overflow-hidden lg:overflow-visible">
            
            {/* Decorative glare for mobile card */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent lg:hidden" />
            
            {/* Redirect Notice Banner */}
            {redirectReason && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2.5 w-full">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{redirectReason}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-3 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2 w-full">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-2.5 sm:space-y-4 w-full relative z-10">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1 lg:text-zinc-400 text-zinc-300">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 lg:text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tuemail@ejemplo.com"
                      className="w-full bg-zinc-900/80 lg:bg-zinc-950/80 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-600 lg:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1 lg:text-zinc-400 text-zinc-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 lg:text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900/80 lg:bg-zinc-950/80 border border-zinc-800/80 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 lg:text-zinc-600 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 lg:text-zinc-500 hover:text-white">
                    <input type="checkbox" className="rounded bg-black border-zinc-700 text-emerald-500 focus:ring-emerald-500 w-3 h-3" defaultChecked />
                    <span>Recordarme</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Para recuperar tu clave comunícate directamente con soporte por WhatsApp.')}
                    className="text-emerald-400 lg:text-emerald-500/70 hover:text-emerald-300 lg:hover:text-emerald-400 hover:underline cursor-pointer font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-[0.98] !mt-4 lg:!mt-3"
                >
                  Iniciar Sesión
                </button>

                <div className="flex items-center gap-3 !mt-4 lg:!mt-3">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-[10px] text-zinc-500 lg:text-zinc-600 font-bold uppercase tracking-widest">o</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                <button
                  type="button"
                  onClick={() => onLoginGoogle('client')}
                  className="w-full py-2.5 sm:py-3 px-4 bg-white/5 hover:bg-white/10 border border-zinc-700/80 lg:border-zinc-800/80 text-zinc-200 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Iniciar sesión con Google</span>
                </button>

                <div className="mt-4 lg:mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer w-full py-2.5 lg:py-3 px-4 bg-transparent lg:hover:bg-emerald-500/5 lg:border lg:border-emerald-500/20 lg:text-emerald-400 lg:font-semibold rounded-xl"
                  >
                    ¿No tienes cuenta? <span className="text-emerald-400 lg:text-emerald-400">Registrarme gratis</span>
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-4 w-full relative z-10">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1 lg:text-zinc-400 text-zinc-300">
                    Nombre Completo / Gamer
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 lg:text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre completo o nick"
                      className="w-full bg-zinc-900/80 lg:bg-zinc-950/80 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1 lg:text-zinc-400 text-zinc-300">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 lg:text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tuemail@ejemplo.com"
                      className="w-full bg-zinc-900/80 lg:bg-zinc-950/80 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1 lg:text-zinc-400 text-zinc-300">
                    ID de Jugador Free Fire (Opcional)
                  </label>
                  <div className="relative">
                    <Gamepad2 className="w-4 h-4 text-zinc-500 lg:text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                      placeholder="Ej. 748920193"
                      className="w-full bg-zinc-900/80 lg:bg-zinc-950/80 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-zinc-400 mb-1 lg:text-zinc-400 text-zinc-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 lg:text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crea una contraseña"
                      className="w-full bg-zinc-900/80 lg:bg-zinc-950/80 border border-zinc-800/80 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 lg:text-zinc-600 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-98 mt-2"
                >
                  Registrarme y Crear Cuenta
                </button>

                <div className="text-center my-3 text-[11px] text-zinc-500 lg:text-zinc-600 font-bold uppercase tracking-widest">
                  o
                </div>

                <button
                  type="button"
                  onClick={() => onLoginGoogle('client')}
                  className="w-full py-2.5 sm:py-3 px-4 bg-white/5 lg:bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 lg:border-zinc-800 text-zinc-200 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Registrarse con Google</span>
                </button>

                <div className="mt-4 lg:mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer w-full py-2.5 lg:py-3 px-4 bg-transparent lg:bg-black lg:hover:bg-zinc-900 lg:border lg:border-zinc-800 lg:text-zinc-300 lg:font-semibold rounded-xl"
                  >
                    ¿Ya tienes cuenta? <span className="text-emerald-400 lg:text-zinc-300">Iniciar Sesión</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer terms */}
        <div className="hidden lg:block mt-8 text-xs text-zinc-500 w-full max-w-md mx-auto pt-4 border-t border-zinc-900 text-center">
          Al continuar, aceptas nuestros{' '}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-zinc-400 hover:underline">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="#" onClick={(e) => e.preventDefault()} className="text-zinc-400 hover:underline">
            Política de Privacidad
          </a>.
        </div>
      </div>

      {/* RIGHT COLUMN: Original Emerald & Black Side Panel with Premium Brand Identity (Hidden on Mobile) */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-[#020b06] via-[#05140b] to-[#010403] p-6 sm:p-10 lg:p-16 flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-l border-emerald-500/20 min-h-screen">
        {/* Decorative light ambient glow */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 my-auto w-full max-w-lg mx-auto flex flex-col items-center justify-center">
          
          {/* Creative Logo Showcase */}
          <div className="relative flex justify-center w-full mb-10">
            {/* Outer animated ring */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-[40px] rounded-full animate-pulse" />
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full p-1.5 bg-gradient-to-br from-emerald-400 via-black to-emerald-700 shadow-[0_0_50px_rgba(16,185,129,0.3)] group">
              <img
                src="/logo.jpeg"
                alt="TunTun Store Identity"
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
              />
              {/* Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-emerald-500/50 text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                Oficial Store
              </div>
            </div>
          </div>

          {/* Main Hero Title */}
          <div className="text-center w-full">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Domina tu Juego con <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">TunTun Store</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-10">
              La plataforma más rápida, automatizada y segura para obtener tus Diamantes de Free Fire, códigos y recargas directas por ID.
            </p>
          </div>

          {/* Metric Cards Grid at Bottom - Glassmorphism */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
            <div className="bg-black/40 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors rounded-2xl p-5 sm:p-6 text-center shadow-[0_10_30px_rgba(0,0,0,0.5)] group">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">&lt; 2 min</div>
              <div className="text-[10px] sm:text-xs text-emerald-400/80 font-bold uppercase tracking-widest mt-1.5">Entrega Flash</div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors rounded-2xl p-5 sm:p-6 text-center shadow-[0_10_30px_rgba(0,0,0,0.5)] group">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                  <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">100%</div>
              <div className="text-[10px] sm:text-xs text-emerald-400/80 font-bold uppercase tracking-widest mt-1.5">Compra Segura</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
