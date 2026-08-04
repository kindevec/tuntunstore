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
  ArrowRight
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
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [playerIdDefault, setPlayerIdDefault] = useState(currentUser.playerIdDefault || '');
  const [gamerTag, setGamerTag] = useState(currentUser.gamerTag || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [preferredBank, setPreferredBank] = useState(currentUser.preferredBank || PREFERRED_BANKS[0]);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAvatar = useCustomUrl && customAvatarUrl.trim() ? customAvatarUrl.trim() : avatar;

    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
      avatar: finalAvatar,
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <span>Página Independiente</span>
            <span>•</span>
            <span>Cuenta Verificada</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-emerald-400" />
            Mi Perfil de Usuario
          </h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Administra tus datos personales, ID predeterminado de Free Fire y preferencias de pago.
          </p>
        </div>

        {/* Balance Card Banner */}
        <div 
          onClick={onNavigateToWallet}
          className="bg-gradient-to-r from-emerald-950/80 to-zinc-900 p-4 rounded-2xl border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between gap-4 cursor-pointer group shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Billetera USD</p>
              <p className="text-lg font-black text-emerald-300">
                ${(currentUser.walletBalanceUSD || 0).toFixed(2)} USD
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Main Profile Layout Card */}
      <div className="bg-zinc-950 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)]">
        
        {/* Profile Identity Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-cyan-950 p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={useCustomUrl && customAvatarUrl ? customAvatarUrl : avatar}
              alt={name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-500/40 shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
              }}
            />
            <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-1.5 rounded-lg text-xs font-black shadow-lg">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white">{currentUser.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                currentUser.role === 'admin' 
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {currentUser.role === 'admin' ? '⭐ Administrador' : 'Cliente Verificado'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-mono">{currentUser.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs">
              {playerIdDefault && (
                <span className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-amber-300 font-mono font-bold flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                  ID FF: {playerIdDefault}
                </span>
              )}
              {gamerTag && (
                <span className="bg-black/60 px-3 py-1 rounded-xl border border-cyan-500/30 text-cyan-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {gamerTag}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* Avatar Selector Section */}
          <div className="space-y-3 bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-white/5">
            <label className="block text-xs font-black text-zinc-200 uppercase flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              Selecciona tu Avatar de Perfil
            </label>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
              {PRESET_AVATARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setAvatar(p.url);
                    setUseCustomUrl(false);
                  }}
                  className={`p-1.5 rounded-xl border transition-all overflow-hidden cursor-pointer ${
                    !useCustomUrl && avatar === p.url
                      ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-500/50 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-14 rounded-lg object-cover" />
                  <span className="block text-[9px] font-bold text-center text-zinc-300 mt-1 truncate">
                    {p.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setUseCustomUrl(!useCustomUrl)}
                className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1"
              >
                {useCustomUrl ? '← Usar avatares predeterminados' : '+ Ingresar URL de imagen personalizada'}
              </button>

              {useCustomUrl && (
                <input
                  type="url"
                  placeholder="https://ejemplo.com/mi-foto-de-perfil.jpg"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full mt-2 bg-black border border-emerald-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
                />
              )}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-400" />
                Correo Electrónico (Google ID)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                ID de Jugador Free Fire (Predeterminado)
              </label>
              <input
                type="text"
                placeholder="Ej: 284910293"
                value={playerIdDefault}
                onChange={(e) => setPlayerIdDefault(e.target.value)}
                className="w-full bg-black border border-amber-500/40 rounded-xl px-4 py-3 text-sm text-amber-300 font-mono font-bold placeholder-zinc-600 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-zinc-500 mt-1">Este ID se ingresará automáticamente en tus pedidos de diamantes.</p>
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Nickname / Gamer Tag
              </label>
              <input
                type="text"
                placeholder="Ej: ꧁⚡PRO_GAMER⚡꧂"
                value={gamerTag}
                onChange={(e) => setGamerTag(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-cyan-300 font-semibold placeholder-zinc-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                Teléfono de Contacto / WhatsApp
              </label>
              <input
                type="text"
                placeholder="Ej: 0990084680"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-zinc-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                Banco Frecuente para Pagos
              </label>
              <select
                value={preferredBank}
                onChange={(e) => setPreferredBank(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-semibold cursor-pointer"
              >
                {PREFERRED_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Security Info & Actions */}
          <div className="p-4 bg-black/60 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-white uppercase">Estado de Seguridad de la Cuenta</p>
                <p className="text-[11px] text-zinc-400">Protegido con verificación OAuth de Google en TunTun Store 🇪🇨.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>

          {/* Submit Save Button */}
          <div className="pt-4 flex items-center justify-end border-t border-white/10">
            <button
              type="submit"
              disabled={isSavedSuccess}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                isSavedSuccess
                  ? 'bg-emerald-400 text-black shadow-[0_0_25px_rgba(52,211,153,0.5)]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95'
              }`}
            >
              {isSavedSuccess ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>¡Perfil Actualizado Exitosamente!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Guardar Cambios de Perfil</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
