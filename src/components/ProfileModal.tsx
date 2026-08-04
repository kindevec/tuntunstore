import React, { useState } from 'react';
import { X, User, Gamepad2, Phone, Building2, Save, Check, Sparkles, Image, ShieldCheck, Mail } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updatedProfile: UserProfile) => void;
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

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSaveProfile,
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

  if (!isOpen) return null;

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
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-cyan-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                Mi Perfil Personal
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </h2>
              <p className="text-[11px] text-zinc-400 font-semibold uppercase">
                Personaliza tus datos para tus pedidos en TunTun Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-black text-zinc-300 uppercase mb-2 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-emerald-400" />
              Foto de Perfil / Avatar
            </label>
            
            <div className="flex items-center gap-4 mb-3">
              <img
                src={useCustomUrl && customAvatarUrl ? customAvatarUrl : avatar}
                alt="Avatar preview"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/50 shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                }}
              />
              <div className="text-xs text-zinc-400">
                <p className="font-bold text-white">Vista Previa</p>
                <p className="text-[10px]">Selecciona un avatar predefinido o ingresa tu propia URL.</p>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {PRESET_AVATARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setAvatar(p.url);
                    setUseCustomUrl(false);
                  }}
                  className={`p-1 rounded-xl border transition-all overflow-hidden cursor-pointer ${
                    !useCustomUrl && avatar === p.url
                      ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-500/40 scale-105'
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-10 rounded-lg object-cover" />
                </button>
              ))}
            </div>

            {/* Toggle custom URL */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setUseCustomUrl(!useCustomUrl)}
                className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1"
              >
                {useCustomUrl ? '← Usar avatares sugeridos' : '+ Usar URL de imagen personalizada'}
              </button>

              {useCustomUrl && (
                <input
                  type="url"
                  placeholder="https://ejemplo.com/mi-avatar.jpg"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full bg-black border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
                />
              )}
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400 font-semibold"
              />
            </div>
          </div>

          {/* Player ID Default & Gamer Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1 flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                ID de Jugador Free Fire
              </label>
              <input
                type="text"
                placeholder="Ej: 284910293"
                value={playerIdDefault}
                onChange={(e) => setPlayerIdDefault(e.target.value)}
                className="w-full bg-black border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold placeholder-zinc-600 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Se autocompletará en tus compras.</p>
            </div>

            <div>
              <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Nickname / Gamer Tag
              </label>
              <input
                type="text"
                placeholder="Ej: ꧁⚡PRO_GAMER⚡꧂"
                value={gamerTag}
                onChange={(e) => setGamerTag(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-semibold placeholder-zinc-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* WhatsApp & Preferred Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                placeholder="Ej: 0987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-zinc-300 uppercase mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Banco Frecuente
              </label>
              <select
                value={preferredBank}
                onChange={(e) => setPreferredBank(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-semibold cursor-pointer"
              >
                {PREFERRED_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role indication */}
          <div className="p-3 bg-black/60 rounded-xl border border-white/5 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Rol de cuenta: <strong className="text-white">{currentUser.role === 'admin' ? 'Administrador' : 'Cliente Verificado'}</strong>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">ID: {currentUser.uid}</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSavedSuccess}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                isSavedSuccess
                  ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isSavedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Perfil Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
