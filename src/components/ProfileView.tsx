import React, { useState } from 'react';
import { 
  User, 
  Gamepad2, 
  Phone, 
  Building2, 
  Save, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  ShieldCheck, 
  Mail, 
  Wallet,
  LogOut,
  ArrowRight,
  Key
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  currentUser: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onLogout: () => void;
  onNavigateToWallet: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    name: 'Gamer Masculino',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'avatar-2',
    name: 'Pro Gamer Cyber',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'avatar-3',
    name: 'Gamer Femenina',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'avatar-4',
    name: 'Streamer VIP',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'avatar-5',
    name: 'Anime Avatar',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'avatar-6',
    name: 'Gamer Neon',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
];

const PREFERRED_BANKS = [
  'Banco Pichincha',
  'Banco Guayaquil / Deuna',
  'Produbanco / Servipagos',
  'Banco del Pacífico',
  'Efectivo / Mi Vecino',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onSaveProfile,
  onLogout,
  onNavigateToWallet,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0].url);
  const [playerIdDefault, setPlayerIdDefault] = useState(currentUser.playerIdDefault || '');
  const [gamerTag, setGamerTag] = useState(currentUser.gamerTag || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [preferredBank, setPreferredBank] = useState(currentUser.preferredBank || PREFERRED_BANKS[0]);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
      avatar: avatar,
      playerIdDefault: playerIdDefault.trim(),
      gamerTag: gamerTag.trim(),
      phone: phone.trim(),
      preferredBank,
    };

    onSaveProfile(updated);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">
          <span>Página Independiente</span>
          <span>•</span>
          <span>Cuenta Verificada</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          Mi Perfil
        </h1>
        <p className="text-sm text-zinc-400 font-medium mt-2">
          Administra tu identidad digital, datos de Free Fire y preferencias de seguridad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10">
        
        {/* BENTO 1: Identity Card (col-12 md:col-4) */}
        <div className="md:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse z-0" />
            <img
              src={avatar}
              alt={name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-2 ring-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 relative z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
              }}
            />
            <span className="absolute -bottom-3 -right-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black p-2 rounded-xl text-xs font-black shadow-lg pointer-events-none z-20 transform transition-transform group-hover:scale-110">
              <Sparkles className="w-5 h-5" />
            </span>
          </div>

          <h2 className="relative z-10 text-xl sm:text-2xl font-black text-white line-clamp-1">{currentUser.name}</h2>
          <p className="relative z-10 text-xs text-zinc-400 font-mono mt-1 mb-4">{currentUser.email}</p>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider w-full sm:w-auto shadow-inner ${
              currentUser.role === 'admin' 
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30' 
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            }`}>
              {currentUser.role === 'admin' ? '⭐ Administrador' : 'Cliente Verificado'}
            </span>
            
            <button
              type="button"
              onClick={() => setIsAvatarStudioOpen(!isAvatarStudioOpen)}
              className="px-4 py-2 rounded-xl w-full sm:w-auto text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ImageIcon className="w-4 h-4" />
              Editar Avatar
            </button>
          </div>
        </div>

        {/* BENTO 2: Wallet Banner (col-12 md:col-8) */}
        <div 
          onClick={onNavigateToWallet}
          className="md:col-span-8 bg-gradient-to-br from-zinc-900 to-[#0a1f16] backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer group shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:border-emerald-500/40 transition-all duration-500 overflow-hidden relative gap-6"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <Wallet className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-emerald-400/80 font-black uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Billetera Virtual
              </p>
              <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 tracking-tight">
                ${(currentUser.walletBalanceUSD || 0).toFixed(2)} USD
              </p>
            </div>
          </div>
          
          <div className="w-full sm:w-12 h-12 rounded-2xl sm:rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black group-hover:translate-x-2 transition-all duration-300 z-10 border border-emerald-500/30">
            <ArrowRight className="w-5 h-5 stroke-[3] hidden sm:block" />
            <span className="sm:hidden font-black uppercase tracking-wider text-xs flex items-center gap-2">Ir a Billetera <ArrowRight className="w-4 h-4" /></span>
          </div>
        </div>

        {/* BENTO 3: Avatar Studio (col-12) */}
        <div className={`md:col-span-12 transition-all duration-500 ease-in-out ${isAvatarStudioOpen ? 'opacity-100 max-h-[1000px] mb-2' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent rounded-3xl pointer-events-none" />
            
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ImageIcon className="w-4 h-4" />
              </span>
              Estudio de Avatar
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-5">
              {PRESET_AVATARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAvatar(p.url)}
                  className={`p-2 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer relative group/avatar ${
                    avatar === p.url
                      ? 'border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105'
                      : 'border-white/5 bg-black/60 hover:border-indigo-500/30 hover:scale-105'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full aspect-square rounded-xl object-cover shadow-inner" />
                  <span className={`block text-[10px] font-bold text-center mt-2 truncate transition-colors ${avatar === p.url ? 'text-indigo-300' : 'text-zinc-500 group-hover/avatar:text-zinc-300'}`}>
                    {p.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BENTO 4: Datos Personales (col-12 md:col-6) */}
        <div className="md:col-span-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <User className="w-5 h-5" />
            </span>
            Datos Personales
          </h3>
          
          <div className="space-y-5 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 pl-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 pl-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                placeholder="Ej: 0990084680"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* BENTO 5: Perfil Gamer (col-12 md:col-6) */}
        <div className="md:col-span-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
              <Gamepad2 className="w-5 h-5" />
            </span>
            Perfil Gamer
          </h3>
          
          <div className="space-y-5 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 pl-1">ID de Jugador (Principal)</label>
              <input
                type="text"
                placeholder="Ej: 284910293"
                value={playerIdDefault}
                onChange={(e) => setPlayerIdDefault(e.target.value)}
                className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4 text-sm text-amber-300 font-mono font-bold placeholder-amber-500/30 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 pl-1">Gamer Tag (Apodo)</label>
              <input
                type="text"
                placeholder="Ej: ꧁⚡PRO_GAMER⚡꧂"
                value={gamerTag}
                onChange={(e) => setGamerTag(e.target.value)}
                className="w-full bg-cyan-500/5 border border-cyan-500/20 rounded-2xl px-5 py-4 text-sm text-cyan-300 font-bold placeholder-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* BENTO 6: Banco Frecuente (col-12 md:col-6) */}
        <div className="md:col-span-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
            <span className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
              <Building2 className="w-5 h-5" />
            </span>
            Banco Frecuente
          </h3>
          
          <div className="relative z-10">
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 pl-1">Método Preferido</label>
            <select
              value={preferredBank}
              onChange={(e) => setPreferredBank(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-zinc-100 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-bold cursor-pointer transition-all shadow-inner appearance-none"
            >
              {PREFERRED_BANKS.map((b) => (
                <option key={b} value={b} className="bg-zinc-900 text-white">
                  {b}
                </option>
              ))}
            </select>
            {/* Custom arrow for select */}
            <div className="absolute right-4 top-[42px] pointer-events-none text-zinc-500">
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>

          <div className="mt-8 p-5 bg-black/40 border border-white/5 rounded-2xl">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4" /> Nivel de Cuenta
            </h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px]">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-300 font-mono mb-1">{email}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Google OAuth Verificado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO 7: Seguridad y Sesión (col-12 md:col-6) */}
        <div className="md:col-span-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                <Key className="w-5 h-5" />
              </span>
              Seguridad y Acceso
            </h3>
            
            <button
              type="button"
              className="w-full px-5 py-4 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white font-black text-xs uppercase flex items-center justify-between transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                <span>Actualizar Contraseña</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </button>
            
            <button
              type="button"
              onClick={onLogout}
              className="w-full px-5 py-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 font-black text-xs uppercase flex items-center justify-between transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Cerrar Sesión Segura</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-[10px] text-zinc-500 font-semibold">
              Todas las conexiones están encriptadas de extremo a extremo.
            </p>
          </div>
        </div>

        {/* BENTO 8: Submit Area (col-12) */}
        <div className="md:col-span-12 mt-4 pt-6 border-t border-white/5 flex justify-end">
          <button
            type="submit"
            disabled={isSavedSuccess}
            className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-2xl relative overflow-hidden group ${
              isSavedSuccess
                ? 'bg-emerald-400 text-black shadow-[0_0_40px_rgba(52,211,153,0.5)] scale-[0.98]'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-[0.98]'
            }`}
          >
            {/* Shimmer effect */}
            {!isSavedSuccess && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            )}
            
            <span className="relative z-10 flex items-center gap-3">
              {isSavedSuccess ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>¡Cambios Guardados!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Guardar Mi Perfil</span>
                </>
              )}
            </span>
          </button>
        </div>

      </form>
    </div>
  );
};
