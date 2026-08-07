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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* BENTO 1: Identity Card (col-4) */}
        <div className="md:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative mb-5">
            <img
              src={avatar}
              alt={name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-2xl transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
              }}
            />
            <span className="absolute -bottom-3 -right-3 bg-emerald-500 text-black p-2 rounded-xl text-xs font-black shadow-lg">
              <Sparkles className="w-5 h-5" />
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white line-clamp-1">{currentUser.name}</h2>
          <p className="text-xs text-zinc-400 font-mono mt-1 mb-4">{currentUser.email}</p>
          
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            currentUser.role === 'admin' 
              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30' 
              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
          }`}>
            {currentUser.role === 'admin' ? '⭐ Administrador' : 'Cliente Verificado'}
          </span>
        </div>

        {/* BENTO 2: Wallet Banner (col-8) */}
        <div 
          onClick={onNavigateToWallet}
          className="md:col-span-8 bg-gradient-to-br from-emerald-950/80 to-zinc-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex items-center justify-between cursor-pointer group shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all overflow-hidden relative"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-5 sm:gap-6 z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all">
              <Wallet className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-black uppercase tracking-wider mb-1">Billetera Virtual</p>
              <p className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight">
                ${(currentUser.walletBalanceUSD || 0).toFixed(2)} USD
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 items-center justify-center group-hover:bg-emerald-500 group-hover:text-black group-hover:translate-x-2 transition-all z-10 border border-emerald-500/30">
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </div>
        </div>

        {/* Flat Section: Personal Data & Gaming Data (col-12) */}
        <div className="md:col-span-12 border-y border-white/10 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Datos Personales */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-emerald-400" /> Datos Personales
            </h3>
            
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 font-semibold transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">Teléfono / WhatsApp</label>
              <input
                type="text"
                placeholder="Ej: 0990084680"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 font-semibold transition-all"
              />
            </div>
          </div>

          {/* Perfil Gamer */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-6">
              <Gamepad2 className="w-4 h-4 text-amber-400" /> Perfil Gamer
            </h3>
            
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">ID de Free Fire (Predeterminado)</label>
              <input
                type="text"
                placeholder="Ej: 284910293"
                value={playerIdDefault}
                onChange={(e) => setPlayerIdDefault(e.target.value)}
                className="w-full bg-black/50 border border-amber-500/30 rounded-2xl px-4 py-3.5 text-sm text-amber-300 font-mono font-bold placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">Nickname / Gamer Tag</label>
              <input
                type="text"
                placeholder="Ej: ꧁⚡PRO_GAMER⚡꧂"
                value={gamerTag}
                onChange={(e) => setGamerTag(e.target.value)}
                className="w-full bg-black/50 border border-cyan-500/30 rounded-2xl px-4 py-3.5 text-sm text-cyan-300 font-semibold placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* BENTO 5: Avatar Studio (col-12) */}
        <div className="md:col-span-12 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" /> Avatar Studio
            </h3>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {PRESET_AVATARS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setAvatar(p.url);
                }}
                className={`p-2 rounded-2xl border transition-all overflow-hidden cursor-pointer relative group/avatar ${
                  avatar === p.url
                    ? 'border-indigo-400 bg-indigo-500/10 ring-2 ring-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'border-white/5 bg-black/40 hover:border-white/20'
                }`}
              >
                <img src={p.url} alt={p.name} className="w-full aspect-square rounded-xl object-cover" />
                <span className="block text-[10px] font-bold text-center text-zinc-400 mt-2 truncate group-hover/avatar:text-zinc-200 transition-colors">
                  {p.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* BENTO 6: Finance & Account (col-8) */}
        <div className="md:col-span-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col justify-center space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-teal-400" /> Banco Frecuente
            </h3>
            <select
              value={preferredBank}
              onChange={(e) => setPreferredBank(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 font-semibold cursor-pointer transition-all"
            >
              {PREFERRED_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Seguridad de Cuenta
            </h3>
            <div className="flex items-center gap-3 bg-black/30 p-4 rounded-2xl border border-white/5">
              <Mail className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-xs text-zinc-300 font-mono">{email}</p>
                <p className="text-[10px] text-emerald-400/80 font-bold uppercase mt-0.5">Google OAuth Verificado</p>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO 7: Security & Danger Zone (col-4) */}
        <div className="md:col-span-4 bg-zinc-900/40 backdrop-blur-xl border border-rose-900/20 rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col justify-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Security / Change Password */}
          <div className="flex flex-col items-center text-center">
            <Key className="w-8 h-8 text-zinc-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">
              Seguridad
            </h3>
            <p className="text-[10px] text-zinc-400 mb-4 px-2">
              Actualiza tu contraseña para mantener tu cuenta segura.
            </p>
            <button
              type="button"
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-800/50 hover:bg-zinc-700 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white font-black text-[10px] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              Cambiar Contraseña
            </button>
          </div>

          <hr className="border-white/5" />

          {/* Danger Zone / Logout */}
          <div className="flex flex-col items-center text-center">
            <LogOut className="w-8 h-8 text-rose-500/40 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xs font-black text-rose-100 uppercase tracking-wider mb-2">
              Sesión Activa
            </h3>
            <p className="text-[10px] text-rose-200/50 mb-4 px-2">
              Si estás en un dispositivo público, recuerda cerrar sesión.
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="w-full px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-black font-black text-[10px] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* BENTO 8: Submit Area (col-12) */}
        <div className="md:col-span-12 mt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSavedSuccess}
            className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl ${
              isSavedSuccess
                ? 'bg-emerald-400 text-black shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] active:scale-95'
            }`}
          >
            {isSavedSuccess ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>¡Guardado con Éxito!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
