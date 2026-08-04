import React, { useState } from 'react';
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor completa todos los campos.');
      return;
    }

    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (found) {
      onLoginSuccess(found);
    } else {
      onRegisterUser(
        name.trim() || email.split('@')[0],
        email.trim(),
        playerId.trim() || undefined
      );
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
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

    onRegisterUser(name.trim(), email.trim(), playerId.trim() || undefined);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col lg:flex-row overflow-x-hidden">
      
      {/* LEFT COLUMN: Clean Form Panel (TunTun Emerald & Black Style) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative z-10 min-h-screen">
        <div>
          {/* Top back button */}
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors mb-8 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a TunTun Store</span>
          </button>

          {/* Official TunTun Mascot Brand Header */}
          <div className="flex items-center gap-3.5 mb-8">
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
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              {authMode === 'login' ? 'Inicia Sesión en TunTun' : 'Crear Cuenta Gamer'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
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
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md">
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-98 mt-2"
              >
                Iniciar Sesión
              </button>

              <div className="text-center my-3 text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                o
              </div>

              <button
                type="button"
                onClick={() => onLoginGoogle('client')}
                className="w-full py-3 px-4 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Iniciar sesión con Google (Demo Cliente)</span>
              </button>

              <button
                type="button"
                onClick={() => onLoginGoogle('admin')}
                className="w-full py-2.5 px-4 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 text-emerald-400/90 hover:text-emerald-300 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Acceder como Administrador (Demo Admin)</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="w-full py-3 px-4 bg-black hover:bg-zinc-900 border border-emerald-500/30 text-emerald-400 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center mt-2"
              >
                ¿No tienes cuenta? Registrarme gratis
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-md">
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-98 mt-2"
              >
                Registrarme y Crear Cuenta
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="w-full py-3 px-4 bg-black hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                ¿Ya tienes cuenta? Iniciar Sesión
              </button>
            </form>
          )}
        </div>

        {/* Footer terms */}
        <div className="mt-8 text-xs text-zinc-500 max-w-md pt-4 border-t border-zinc-900">
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

      {/* RIGHT COLUMN: Emerald & Black Side Panel with Image Banner & Player Value Props */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#020b06] via-[#05140b] to-[#010403] p-6 sm:p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-l border-emerald-500/20 min-h-screen">
        {/* Decorative light ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 my-auto max-w-lg mx-auto lg:mx-0 w-full">
          {/* Featured Banner Image */}
          <div className="relative rounded-2xl overflow-hidden mb-8 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] group">
            <img
              src="/logo.jpeg"
              alt="TunTun Store Gaming Center"
              className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="font-bold text-emerald-400 uppercase tracking-widest bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/40">
                💎 Recargas & PINs
              </span>
              <span className="text-zinc-300 font-medium">TunTun Store 2026</span>
            </div>
          </div>

          {/* Main Hero Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-3">
            ¡Los PINs y Recargas Gamer <span className="text-emerald-400">Más Accesibles</span>!
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed mb-8">
            Obtén tus Diamantes de Free Fire, códigos de juegos y recargas directas por ID con soporte garantizado.
          </p>

          {/* Clean Un-encapsulated Feature List */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <Gem className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-100">Los PINs más accesibles y económicos</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-100">Entrega instantánea por ID de Jugador</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-100">100% Garantizado con atención por WhatsApp</span>
            </div>
          </div>

          {/* Metric Cards Grid at Bottom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950/80 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">+50,000</div>
              <div className="text-xs text-zinc-400 font-medium mt-1">Recargas Exitosas</div>
            </div>

            <div className="bg-zinc-950/80 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-white font-mono">&lt; 2 min</div>
              <div className="text-xs text-zinc-400 font-medium mt-1">Entrega Rápida</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

