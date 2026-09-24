import React, { useState } from 'react';
import { UserProfile } from '../../types';
import {
  User,
  Gamepad2,
  Phone,
  Building2,
  Save,
  Check,
  Sparkles,
  LogOut,
  Wallet,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface PWAProfileViewProps {
  currentUser: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onLogout: () => void;
  onNavigateToWallet: () => void;
}

const PRESET_AVATARS = [
  { id: '1', name: 'Gamer 1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
  { id: '2', name: 'Gamer 2', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80' },
  { id: '3', name: 'Gamer 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: '4', name: 'Gamer 4', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' },
  { id: '5', name: 'Gamer 5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: '6', name: 'Gamer 6', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
];

export const PWAProfileView: React.FC<PWAProfileViewProps> = ({
  currentUser,
  onSaveProfile,
  onLogout,
  onNavigateToWallet,
}) => {
  const [formData, setFormData] = useState<UserProfile>({
    ...currentUser,
    name: currentUser.name || '',
    playerIdDefault: currentUser.playerIdDefault || '',
    gamerTag: currentUser.gamerTag || '',
    phone: currentUser.phone || '',
    preferredBank: currentUser.preferredBank || '',
  });

  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0].url);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    const updated = {
      ...formData,
      avatar: selectedAvatar,
    };
    onSaveProfile(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#020b08] text-white pb-32 px-3.5 pt-3 select-none">
      {/* 👤 CABECERA DEL PERFIL GAMER HERO */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-[#0a261b] via-[#051610] to-[#020d09] border border-emerald-500/30 text-center relative overflow-hidden shadow-lg mb-4">
        <div className="relative inline-block mx-auto mb-2">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <img
              src={selectedAvatar}
              alt={formData.name}
              className="w-full h-full rounded-full object-cover bg-[#07090e]"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#05140f] flex items-center justify-center text-[10px] text-black font-black">
            ✓
          </span>
        </div>

        <h3 className="text-base font-black text-white tracking-tight">{formData.name || 'Gamer TunTun'}</h3>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">{formData.email}</p>

        {/* Badges de Estado y Rol */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span
            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
              currentUser.role === 'admin'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {currentUser.role === 'admin' ? '⭐ Administrador' : '🎮 Gamer Oficial'}
          </span>
          {currentUser.role === 'admin' ? (
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Administrador
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Gamer Verificado
            </span>
          )}
        </div>

        {/* Badge de Acción Rápida: Panel Admin si es Admin, o Billetera si es Cliente */}
        {currentUser.role === 'admin' ? (
          <div
            onClick={() => {
              triggerHaptic('light');
              window.location.hash = '#admin';
            }}
            className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 font-black text-xs cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Ir al Panel Administrador</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </div>
        ) : (
          <div
            onClick={() => {
              triggerHaptic('light');
              onNavigateToWallet();
            }}
            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-bold text-xs cursor-pointer active:scale-95 transition-all"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Billetera: ${(currentUser.walletBalanceUSD ?? 0).toFixed(2)} USD</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 🎨 SELECTOR DE AVATARES TÁCTIL */}
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block mb-2">
            Elige tu Avatar Gamer
          </label>
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {PRESET_AVATARS.map((av) => {
              const isSelected = selectedAvatar === av.url;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedAvatar(av.url);
                  }}
                  className={`relative w-12 h-12 rounded-full flex-shrink-0 p-0.5 transition-transform active:scale-90 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-black scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av.url} alt={av.name} className="w-full h-full rounded-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>

        {/* 👤 GRUPO 0: DATOS DE LA CUENTA */}
        <div className="p-4 rounded-2xl bg-[#061711] border border-emerald-500/20 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>Datos Personales</span>
          </h4>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
              Nombre de Usuario o Alias
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tu nombre o apodo"
              className="w-full px-3.5 py-2.5 bg-[#03130d] border border-emerald-500/30 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
              Correo Electrónico (Asociado a tu cuenta)
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3.5 py-2.5 bg-[#03130d]/50 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* 🎮 GRUPO 1: DATOS DE JUEGO */}
        <div className="p-4 rounded-2xl bg-[#061711] border border-emerald-500/20 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4" />
            <span>Datos de Free Fire</span>
          </h4>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
              ID de Jugador Free Fire (Por Defecto)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.playerIdDefault || ''}
              onChange={(e) => setFormData({ ...formData, playerIdDefault: e.target.value })}
              placeholder="Ej. 1234567890"
              className="w-full px-3.5 py-2.5 bg-[#03130d] border border-emerald-500/30 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Se autocompletará en tus compras para que no tengas que escribirlo cada vez.
            </span>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
              Gamer Tag / Apodo en el Juego
            </label>
            <input
              type="text"
              value={formData.gamerTag || ''}
              onChange={(e) => setFormData({ ...formData, gamerTag: e.target.value })}
              placeholder="Ej. ProSniper_EC"
              className="w-full px-3.5 py-2.5 bg-[#03130d] border border-emerald-500/30 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* 📱 GRUPO 2: CONTACTO Y BANCO */}
        <div className="p-4 rounded-2xl bg-[#061711] border border-emerald-500/20 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Phone className="w-4 h-4" />
            <span>Contacto y Preferencias</span>
          </h4>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
              Teléfono Celular / WhatsApp
            </label>
            <input
              type="tel"
              inputMode="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ej. 0991234567"
              className="w-full px-3.5 py-2.5 bg-[#03130d] border border-emerald-500/30 rounded-xl text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
              Banco Preferido para Transferencias
            </label>
            <select
              value={formData.preferredBank || ''}
              onChange={(e) => setFormData({ ...formData, preferredBank: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#03130d] border border-emerald-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="">Selecciona tu banco frecuente</option>
              <option value="Banco Pichincha">Banco Pichincha / DeUna</option>
              <option value="Banco Guayaquil">Banco Guayaquil</option>
              <option value="Produbanco">Produbanco</option>
              <option value="PayPhone">PayPhone (Tarjeta)</option>
            </select>
          </div>
        </div>

        {/* BOTÓN GUARDAR CAMBIOS */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>¡Cambios Guardados con Éxito!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Datos de Perfil</span>
            </>
          )}
        </button>

        {/* BOTÓN CERRAR SESIÓN CON SEPARACIÓN */}
        <div className="pt-4 mt-6 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onLogout();
            }}
            className="w-full py-3 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </form>
    </div>
  );
};
