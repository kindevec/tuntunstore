import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Gamepad2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  UserPlus,
  LogIn,
  AlertCircle,
  Zap,
  Shield,
  CreditCard,
  Headphones,
  Award,
  Gem
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
      // But we can trigger a manual redirect or toast if needed.
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
      // Automatically attempt to login or tell the user to confirm email.
      if (data.session) {
        // Logged in immediately (email confirmation disabled)
      } else {
        alert("¡Cuenta creada exitosamente! Si Supabase requiere confirmación, por favor revisa tu bandeja de entrada.");
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#05070a] text-white flex flex-col lg:flex-row overflow-hidden">
      
      {/* LEFT COLUMN: Clean Form Panel (TunTun Emerald & Black Style) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-4 sm:p-10 lg:p-16 relative z-10 h-full overflow-hidden">
        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto">
          {/* Mobile Glowing Logo Showcase (Only visible on mobile) */}
          <div className="relative flex justify-center w-full mb-2 sm:mb-6 lg:hidden mt-1">
            {/* Outer animated ring */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-[30px] rounded-full animate-pulse" />
            <div className="relative w-24 h-24 sm:w-48 sm:h-48 rounded-full p-1.5 bg-gradient-to-br from-emerald-400 via-black to-emerald-700 shadow-[0_0_50px_rgba(16,185,129,0.3)] group">
              <img
                src="/logo.jpeg"
                alt="TunTun Store Identity"
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
              />
              {/* Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-emerald-500/50 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                Oficial Store
              </div>
            </div>
          </div>

          {/* Official TunTun Mascot Brand Header (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-3.5 mb-6">
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

          {/* Back Button (Regresar) */}
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors mb-3 cursor-pointer group w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Regresar</span>
          </button>

          {/* Form Title */}
          <div className="mb-3 sm:mb-5">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-0.5 sm:mb-1.5">
              {authMode === 'login' ? 'Inicia Sesión en TunTun' : 'Crear Cuenta Gamer'}
            </h1>
            <p className="hidden sm:block text-xs sm:text-sm text-zinc-400">
              {authMode === 'login'
                ? 'Ingresa a tu cuenta para recargar tus juegos y comprar PINs al instante'
                : 'Únete hoy y disfruta de las recargas más rápidas y los PINs más accesibles'}
            </p>
          </div>

          {/* Redirect Notice Banner */}
          {redirectReason && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{redirectReason}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Correo o Usuario
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tuemail@ejemplo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white">
                  <input type="checkbox" className="rounded bg-black border-zinc-700 text-emerald-500 focus:ring-emerald-500" defaultChecked />
                  <span>Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Para recuperar tu clave comunícate directamente con soporte por WhatsApp.')}
                  className="text-emerald-400 hover:underline cursor-pointer font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 sm:py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-98 mt-2"
              >
                Iniciar Sesión
              </button>

              <div className="text-center my-2 sm:my-3 text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                o
              </div>

              <button
                type="button"
                onClick={() => onLoginGoogle('client')}
                className="w-full py-2.5 sm:py-3 px-4 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Iniciar sesión con Google</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="w-full py-2.5 sm:py-3 px-4 bg-black hover:bg-zinc-900 border border-emerald-500/30 text-emerald-400 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center mt-2"
              >
                ¿No tienes cuenta? Registrarme gratis
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nombre Completo / Gamer
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo o nick"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tuemail@ejemplo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  ID de Jugador Free Fire (Opcional)
                </label>
                <div className="relative">
                  <Gamepad2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="Ej. 748920193"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crea una contraseña"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
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

              <div className="text-center my-2 sm:my-3 text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                o
              </div>

              <button
                type="button"
                onClick={() => onLoginGoogle('client')}
                className="w-full py-2.5 sm:py-3 px-4 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Registrarse con Google</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="w-full py-2.5 sm:py-3 px-4 bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center mt-2 sm:mt-4"
              >
                ¿Ya tienes cuenta? Iniciar Sesión
              </button>
            </form>
          )}
        </div>

        {/* Footer terms */}
        <div className="hidden sm:block mt-8 text-xs text-zinc-500 w-full max-w-md mx-auto pt-4 border-t border-zinc-900 text-center">
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

      {/* RIGHT COLUMN: Emerald & Black Side Panel with Premium Brand Identity (Hidden on Mobile) */}
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

