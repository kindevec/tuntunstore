import React from 'react';
import { Mail, Send, Bell } from 'lucide-react';

export interface EmailConfig {
  adminEmail: string;
  notifyOnNewOrder: boolean;
  notifyOnStatusChange: boolean;
}

export interface AdminEmailTabProps {
  emailConfig: EmailConfig;
  onUpdateEmailConfig: (config: EmailConfig) => void;
  triggerTestEmailAlert: () => void;
  testEmailSentSuccess: boolean;
}

export const AdminEmailTab: React.FC<AdminEmailTabProps> = ({
  emailConfig,
  onUpdateEmailConfig,
  triggerTestEmailAlert,
  testEmailSentSuccess,
}) => {
  return (
    <div className="bg-zinc-800 p-4 sm:p-6 rounded-2xl border border-zinc-700/50 space-y-6 text-white w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight flex items-center gap-2 text-white">
            <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Configuración de Notificaciones por Correo</span>
          </h2>
          <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold uppercase mt-2">
            Envío automático de correo a administración cada vez que un cliente realiza un nuevo pedido o adjunta su baucher.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Settings Form Card */}
        <div className="space-y-4 sm:space-y-5 bg-zinc-900/50 p-4 sm:p-5 rounded-xl border border-zinc-700/50 text-xs flex flex-col">
          <h3 className="font-black text-emerald-400 uppercase tracking-wider text-sm">Parámetros del Servidor</h3>

          <div className="flex flex-col gap-1.5">
            <label className="block text-zinc-400 font-black uppercase">Correo Administrador</label>
            <input
              type="email"
              value={emailConfig.adminEmail}
              onChange={(e) => onUpdateEmailConfig({ ...emailConfig, adminEmail: e.target.value })}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-black focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="admin@tuntunstore.com"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start sm:items-center gap-3 cursor-pointer font-bold uppercase text-zinc-300 group">
              <div className="relative flex items-center justify-center mt-0.5 sm:mt-0">
                <input
                  type="checkbox"
                  checked={emailConfig.notifyOnNewOrder}
                  onChange={(e) => onUpdateEmailConfig({ ...emailConfig, notifyOnNewOrder: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer"
                />
              </div>
              <span className="leading-tight group-hover:text-white transition-colors">
                Notificar inmediatamente al recibir NUEVO PEDIDO
              </span>
            </label>

            <label className="flex items-start sm:items-center gap-3 cursor-pointer font-bold uppercase text-zinc-300 group">
              <div className="relative flex items-center justify-center mt-0.5 sm:mt-0">
                <input
                  type="checkbox"
                  checked={emailConfig.notifyOnStatusChange}
                  onChange={(e) => onUpdateEmailConfig({ ...emailConfig, notifyOnStatusChange: e.target.checked })}
                  className="w-5 h-5 rounded text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer"
                />
              </div>
              <span className="leading-tight group-hover:text-white transition-colors">
                Enviar actualización por correo al cliente cuando cambia el estado
              </span>
            </label>
          </div>

          <div className="pt-4 mt-auto">
            <button
              type="button"
              onClick={triggerTestEmailAlert}
              className="w-full py-3 sm:py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition-transform active:scale-[0.98]"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>Probar Alerta de Correo</span>
            </button>
          </div>

          {testEmailSentSuccess && (
            <div className="p-3 sm:p-4 bg-emerald-500/20 text-emerald-300 font-black uppercase rounded-xl text-center border border-emerald-500/40 animate-in fade-in zoom-in-95 duration-200">
              ✅ ¡Correo de prueba enviado a {emailConfig.adminEmail || 'el administrador'}!
            </div>
          )}
        </div>

        {/* Email Preview Card */}
        <div className="bg-zinc-900/50 text-white p-4 sm:p-5 rounded-xl border border-zinc-700/50 space-y-4 text-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-700/50 pb-3 gap-3">
            <span className="font-black text-amber-400 flex items-center gap-2 uppercase tracking-wider text-sm">
              <Bell className="w-5 h-5" /> Vista Previa
            </span>
            <span className="text-[10px] text-zinc-500 font-mono bg-zinc-900 px-2.5 py-1 rounded-md self-start sm:self-auto border border-zinc-800">
              SMTP Firebase
            </span>
          </div>

          <div className="bg-zinc-900 p-3 sm:p-4 rounded-lg border border-zinc-800 font-mono text-[11px] sm:text-xs space-y-2 break-all shadow-inner">
            <p className="flex flex-col sm:flex-row sm:gap-2">
              <strong className="text-zinc-500 sm:w-14 shrink-0">De:</strong> 
              <span className="text-zinc-300">notificaciones@tuntunstore.com</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:gap-2">
              <strong className="text-zinc-500 sm:w-14 shrink-0">Para:</strong> 
              <span className="text-zinc-300">{emailConfig.adminEmail || 'admin@correo.com'}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:gap-2">
              <strong className="text-zinc-500 sm:w-14 shrink-0">Asunto:</strong> 
              <span className="text-amber-400 font-semibold">🚨 ¡NUEVA RECARGA REGISTRADA! Pedido #TTS-84920</span>
            </p>
          </div>

          <div className="bg-zinc-900 p-4 sm:p-5 rounded-lg border border-zinc-800 space-y-3 text-zinc-300 flex-1 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none" />
            
            <p className="font-bold text-white uppercase text-sm sm:text-base">¡Hola Administrador!</p>
            <p className="text-sm">El cliente <strong className="text-white bg-zinc-800 px-1 py-0.5 rounded">Mateo Cárdenas</strong> ha registrado un nuevo pedido:</p>
            
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 font-semibold mt-3 bg-zinc-800/50 p-3 rounded-lg">
              <li><strong className="text-zinc-300">ID Jugador:</strong> <span className="font-mono text-emerald-400">284910293</span></li>
              <li><strong className="text-zinc-300">Producto:</strong> 572 Diamantes ($5.80 USD)</li>
              <li><strong className="text-zinc-300">Banco:</strong> Banco Pichincha</li>
            </ul>
            
            <div className="pt-4 mt-4 border-t border-zinc-800">
              <p className="text-emerald-400 font-black uppercase text-center sm:text-left text-[11px] sm:text-xs">
                Por favor ingresa al Panel de TunTun Store para verificar la transferencia.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
