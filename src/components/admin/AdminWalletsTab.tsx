import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Wallet, Clock, ShieldCheck, CheckCircle2, Eye, XCircle, History, User, Phone, Mail, Gamepad2, CreditCard, X, Edit3, Zap, Search } from 'lucide-react';
import { UserProfile } from '../../types';
import { AdminConfirmModal } from './AdminConfirmModal';

export interface AdminWalletsTabProps {
  registeredUsers: UserProfile[];
  pendingTopUps: any[];
  onUpdateTopUpStatus?: (id: string, status: string) => void;
  onUpdateTopUpAmount?: (id: string, newAmount: number) => void;
  setSelectedReceiptUrl: (url: string) => void;
  handleViewUserHistory: (uid: string, name: string) => void;
}

export const AdminWalletsTab: React.FC<AdminWalletsTabProps> = ({
  registeredUsers,
  pendingTopUps,
  onUpdateTopUpStatus,
  onUpdateTopUpAmount,
  setSelectedReceiptUrl,
  handleViewUserHistory
}) => {
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);
  const [showAutoApproveConfirm, setShowAutoApproveConfirm] = useState(false);
  const [editingTopUp, setEditingTopUp] = useState<{ id: string; amount: number; userEmail?: string } | null>(null);
  const [newTopUpAmountInput, setNewTopUpAmountInput] = useState('');

  const [localUsers, setLocalUsers] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const USERS_PER_PAGE = 20;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const [editingBalanceUser, setEditingBalanceUser] = useState<UserProfile | null>(null);
  const [editBalanceAmount, setEditBalanceAmount] = useState('');
  const [editBalanceNote, setEditBalanceNote] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchPaginatedUsers(page, debouncedSearchQuery);
  }, [page, debouncedSearchQuery]);

  const fetchPaginatedUsers = async (pageNum: number, search: string) => {
    setLoadingUsers(true);
    const from = (pageNum - 1) * USERS_PER_PAGE;
    const to = from + USERS_PER_PAGE - 1;

    let query = supabase
      .rpc('get_all_users_with_balance', {}, { count: 'exact' });

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`name.ilike.${term},email.ilike.${term},player_id_default.ilike.${term}`);
    }

    const { data, count, error } = await query
      .order('wallet_balance_usd', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setLocalUsers(data.map((p: any) => ({
        uid: p.id,
        name: p.name || 'Usuario',
        email: p.email,
        avatar: p.avatar_url,
        role: p.role as any,
        walletBalanceUSD: Number(p.wallet_balance_usd || 0),
        playerIdDefault: p.player_id_default,
        gamerTag: p.gamer_tag,
        phone: p.phone,
        preferredBank: p.preferred_bank,
      })));
      if (count !== null) setTotalUsers(count);
    }
    setLoadingUsers(false);
  };

  const verifiedTopUps = pendingTopUps.filter(t => t.auto_verified);

  const handleConfirmAutoApprove = () => {
    setShowAutoApproveConfirm(false);
    verifiedTopUps.forEach(t => onUpdateTopUpStatus && onUpdateTopUpStatus(t.id, 'Aprobado'));
  };

  const handleAdminBalanceAdjustment = async () => {
    if (!editingBalanceUser) return;
    
    const amount = parseFloat(editBalanceAmount);
    if (isNaN(amount) || amount === 0) {
      alert('Ingresa un monto válido distinto de 0.');
      return;
    }

    try {
      const { error } = await supabase.from('wallet_transactions').insert({
        user_id: editingBalanceUser.uid,
        amount: amount,
        type: 'admin_adjustment',
        status: 'Aprobado',
        admin_note: editBalanceNote.trim() || 'Ajuste manual desde panel admin'
      });

      if (error) throw error;
      
      fetchPaginatedUsers(page, debouncedSearchQuery);
      setEditingBalanceUser(null);
      setEditBalanceAmount('');
      setEditBalanceNote('');
      alert('Saldo actualizado correctamente.');
    } catch (err: any) {
      console.error(err);
      alert('Error al actualizar el saldo: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-amber-500/5 p-4 sm:p-6 rounded-2xl border border-amber-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              CONTROL CENTRAL DE DINERO
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">Billeteras Virtuales de Clientes ($ USD)</h2>
            <p className="text-xs text-zinc-400">
              Como Administrador puedes aprobar recargas por transferencia bancaria, o ajustar saldos manualmente.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-black/60 p-3 rounded-xl border border-amber-500/30 w-full md:w-auto">
            <div className="p-2.5 rounded-lg bg-amber-400/20 text-amber-400">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase">Fondo Total en Billeteras</p>
              <p className="text-lg sm:text-xl font-black text-amber-400">
                ${registeredUsers.reduce((sum, u) => sum + (u.walletBalanceUSD || 0), 0).toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Top Ups Section */}
      <div className="bg-zinc-800 rounded-2xl border border-amber-500/50 overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.1)]">
        <div className="p-4 border-b border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/5">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-black text-sm text-amber-400 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4" /> Solicitudes de Recarga Pendientes
            </h3>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">{pendingTopUps.length} Pendientes</span>
          </div>
          {pendingTopUps.some(t => t.auto_verified) && (
            <button
              onClick={() => setShowAutoApproveConfirm(true)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black rounded-xl uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              title="Aprueba de golpe todos los comprobantes que pasaron el filtro de seguridad OCR"
            >
              <ShieldCheck className="w-4 h-4" /> Aprobar Todos los Verificados ({verifiedTopUps.length})
            </button>
          )}
        </div>
        
        <div className="p-4">
          {pendingTopUps.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 font-bold uppercase text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20 text-emerald-400" />
              <p>No hay solicitudes de recarga pendientes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTopUps.map(topUp => {
                const user = registeredUsers.find(u => u.uid === topUp.user_id);
                return (
                  <div key={topUp.id} className="bg-zinc-900 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-lg">
                    <div className="flex items-start sm:items-center gap-4 w-full md:w-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0 overflow-hidden">
                        {topUp.receipt_url ? (
                          <img 
                            src={`${import.meta.env.VITE_SUPABASE_URL || 'https://tkfpmmjnyzmulxkmtesf.supabase.co'}/storage/v1/object/public/receipts/${topUp.receipt_url}`} 
                            alt="Baucher miniatura" 
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tkfpmmjnyzmulxkmtesf.supabase.co';
                              setSelectedReceiptUrl(`${baseUrl}/storage/v1/object/public/receipts/${topUp.receipt_url}`);
                            }}
                            title="Clic para ampliar"
                          />
                        ) : (
                          <Wallet className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white text-sm sm:text-base truncate">Recarga de ${topUp.amount.toFixed(2)} USD</p>
                        <div className="text-[11px] sm:text-xs text-zinc-400 flex flex-col gap-0.5 mt-1">
                          <span className="truncate"><strong className="text-zinc-300">Cliente:</strong> {user?.name || 'Desconocido'} ({user?.email || 'N/A'})</span>
                          <span><strong className="text-zinc-300">Fecha:</strong> {new Date(topUp.created_at).toLocaleString()}</span>
                        </div>
                        
                        <div className="mt-2 flex flex-col gap-1 items-start">
                          {topUp.auto_verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded break-words max-w-full">
                              <ShieldCheck className="w-3 h-3 shrink-0" /> Verificado por Sistema (OCR)
                            </span>
                          ) : topUp.verification_warnings && topUp.verification_warnings.length > 0 ? (
                            <div className="space-y-1.5 w-full">
                              {topUp.verification_warnings.map((warn: string, idx: number) => {
                                const isAmountWarn = warn.includes('Diferencia de Monto');
                                const match = warn.match(/(?:muestra|detectó|cifras como) \$([0-9\.]+)/i);
                                const detectedVal = match && match[1] ? parseFloat(match[1]) : null;

                                return (
                                  <div key={idx} className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded break-words max-w-full">
                                      {warn}
                                    </span>
                                    {isAmountWarn && detectedVal && onUpdateTopUpAmount && (
                                      <button
                                        onClick={() => onUpdateTopUpAmount(topUp.id, detectedVal)}
                                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black rounded-lg uppercase flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                                        title={`Aplicar corrección automática de $${topUp.amount.toFixed(2)} USD a $${detectedVal.toFixed(2)} USD`}
                                      >
                                        <Zap className="w-3.5 h-3.5 fill-black shrink-0" /> Corrección Automática (${detectedVal.toFixed(2)})
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                              Sin revisión OCR
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                      {topUp.receipt_url && (
                        <button
                          onClick={() => {
                            const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tkfpmmjnyzmulxkmtesf.supabase.co';
                            setSelectedReceiptUrl(`${baseUrl}/storage/v1/object/public/receipts/${topUp.receipt_url}`);
                          }}
                          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-black rounded-xl uppercase flex items-center justify-center gap-2 border border-blue-500/30 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" /> Ver Baucher
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingTopUp({ id: topUp.id, amount: topUp.amount, userEmail: user?.email });
                          setNewTopUpAmountInput(topUp.amount.toString());
                        }}
                        className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-black rounded-xl uppercase flex items-center justify-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
                        title="Editar el valor de esta recarga"
                      >
                        <Edit3 className="w-4 h-4" /> Editar
                      </button>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => onUpdateTopUpStatus && onUpdateTopUpStatus(topUp.id, 'Aprobado')}
                          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl uppercase flex items-center justify-center gap-1 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Aprobar
                        </button>
                        <button
                          onClick={() => onUpdateTopUpStatus && onUpdateTopUpStatus(topUp.id, 'Rechazado')}
                          className="flex-1 sm:flex-none px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black rounded-xl uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" /> Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-800 rounded-2xl border border-zinc-700/50 overflow-hidden">
        <div className="p-4 border-b border-zinc-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <h3 className="font-black text-sm text-white uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Directorio de Clientes
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-bold focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <span className="text-xs sm:text-sm font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-2 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.2)] whitespace-nowrap w-full sm:w-auto text-center">
              Total: {totalUsers} Usuarios
            </span>
          </div>
        </div>

        {/* Mobile Wallet Cards */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <span className="text-zinc-500 font-bold text-xs uppercase animate-pulse">Cargando usuarios...</span>
            </div>
          ) : localUsers.map((u) => (
            <div key={u.uid} className="bg-zinc-900/80 rounded-2xl border border-zinc-700/50 p-4 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-zinc-700/50 pb-3 gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-amber-500/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm sm:text-base truncate">{u.name}</p>
                    <span className="text-[10px] text-zinc-400 font-mono block truncate">{u.email}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                    u.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                  {u.role}
                </span>
              </div>

              <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-700/50">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block truncate">ID FF:</span>
                  <span className="font-mono font-bold text-zinc-300 text-xs sm:text-sm truncate block">{u.playerIdDefault || 'N/A'}</span>
                </div>
                <div className="text-right flex flex-col items-end shrink-0">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Saldo Actual:</span>
                  <span className="text-base sm:text-lg font-black text-amber-400">
                    ${(u.walletBalanceUSD || 0).toFixed(2)}
                  </span>
                  <div className="flex gap-1.5 mt-2 w-full">
                    <button
                       onClick={() => setEditingBalanceUser(u)}
                       className="flex-1 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-black rounded-lg uppercase border border-amber-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                       title="Editar saldo de billetera"
                    >
                      <Wallet className="w-3 h-3 shrink-0" /> Editar Saldo
                    </button>
                    <button
                       onClick={() => setSelectedProfileUser(u)}
                       className="flex-1 py-1.5 px-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-[10px] font-black rounded-lg uppercase border border-violet-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <User className="w-3 h-3 shrink-0" /> Perfil
                    </button>
                    <button
                       onClick={() => handleViewUserHistory(u.uid, u.name)}
                       className="flex-1 py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg uppercase border border-blue-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <History className="w-3 h-3 shrink-0" /> Historial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Wallets Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-400 font-black uppercase tracking-wider text-[10px] border-b border-zinc-700">
                <th className="p-4">Usuario</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rol</th>
                <th className="p-4">ID Free Fire</th>
                <th className="p-4">Saldo Actual USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {loadingUsers ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 font-bold text-xs uppercase animate-pulse">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : localUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-zinc-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-500/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{u.name}</p>
                        <span className="text-[10px] text-zinc-400 truncate block">{u.gamerTag || 'Sin Tag'}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-zinc-300 font-mono text-xs">{u.email}</td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="p-4 font-mono font-bold text-zinc-300">
                    {u.playerIdDefault || '284910293'}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/30 inline-block">
                        ${(u.walletBalanceUSD || 0).toFixed(2)} USD
                      </span>
                      <button
                         onClick={() => setEditingBalanceUser(u)}
                         className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-black rounded-lg uppercase border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                         title="Editar saldo de billetera"
                      >
                        <Wallet className="w-3 h-3" /> Editar Saldo
                      </button>
                      <button
                         onClick={() => setSelectedProfileUser(u)}
                         className="px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-[10px] font-black rounded-lg uppercase border border-violet-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <User className="w-3 h-3" /> Perfil
                      </button>
                      <button
                         onClick={() => handleViewUserHistory(u.uid, u.name)}
                         className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg uppercase border border-blue-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3 h-3" /> Ver Historial
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-zinc-700/50 flex items-center justify-between bg-zinc-900/50">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loadingUsers}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 text-xs font-black rounded-xl uppercase transition-colors cursor-pointer"
          >
            Anterior
          </button>
          <span className="text-xs text-zinc-400 font-bold">
            Página {page} de {Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE))}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(totalUsers / USERS_PER_PAGE) || loadingUsers}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 text-xs font-black rounded-xl uppercase transition-colors cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {selectedProfileUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedProfileUser(null)}>
          <div 
            className="bg-zinc-900 border border-zinc-700/50 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-violet-600/30 via-zinc-900 to-amber-500/20 p-6 pb-10 border-b border-zinc-700/50">
              <button
                onClick={() => setSelectedProfileUser(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <img
                  src={selectedProfileUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={selectedProfileUser.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-violet-500/40 shadow-lg"
                />
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-white truncate">{selectedProfileUser.name}</h3>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedProfileUser.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {selectedProfileUser.role === 'admin' ? '👑 Administrador' : '🎮 Cliente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3 bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/40">
                <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Email</p>
                  <p className="text-sm text-white font-bold truncate">{selectedProfileUser.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/40">
                <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Teléfono</p>
                  <p className="text-sm text-white font-bold">{selectedProfileUser.phone || 'No registrado'}</p>
                </div>
              </div>

              {/* Player ID & Gamer Tag */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/40">
                  <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                    <Gamepad2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">ID Free Fire</p>
                    <p className="text-sm text-white font-bold font-mono truncate">{selectedProfileUser.playerIdDefault || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/40">
                  <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0">
                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Gamer Tag</p>
                    <p className="text-sm text-white font-bold truncate">{selectedProfileUser.gamerTag || 'Sin Tag'}</p>
                  </div>
                </div>
              </div>

              {/* Preferred Bank */}
              <div className="flex items-center gap-3 bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/40">
                <div className="p-2 bg-violet-500/10 rounded-lg shrink-0">
                  <CreditCard className="w-4 h-4 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Banco Preferido</p>
                  <p className="text-sm text-white font-bold">{selectedProfileUser.preferredBank || 'No registrado'}</p>
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-zinc-800/60 p-4 rounded-xl border border-amber-500/30">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">Saldo en Billetera</p>
                  <p className="text-2xl font-black text-amber-400">${(selectedProfileUser.walletBalanceUSD || 0).toFixed(2)}</p>
                </div>
                <div className="p-3 bg-amber-400/10 rounded-xl">
                  <Wallet className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 pt-0 flex gap-2">
              <button
                onClick={() => { handleViewUserHistory(selectedProfileUser.uid, selectedProfileUser.name); setSelectedProfileUser(null); }}
                className="flex-1 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-black rounded-xl uppercase border border-blue-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <History className="w-4 h-4" /> Ver Historial
              </button>
              <button
                onClick={() => setSelectedProfileUser(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-black rounded-xl uppercase border border-zinc-700 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmModal
        isOpen={showAutoApproveConfirm}
        title="¿Aprobar Recargas Verificadas?"
        message={`¿Estás seguro de aprobar automáticamente las ${verifiedTopUps.length} recargas verificadas por el sistema de seguridad OCR? El saldo será acreditado al instante.`}
        confirmText="Sí, Aprobar Todas"
        cancelText="Cancelar"
        variant="success"
        onConfirm={handleConfirmAutoApprove}
        onCancel={() => setShowAutoApproveConfirm(false)}
      />

      {/* MODAL: EDITAR MONTO DE RECARGA */}
      {editingTopUp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-amber-500/40 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-black text-white uppercase text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" /> Editar Monto de Recarga
              </h3>
              <button
                onClick={() => setEditingTopUp(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Modifica el monto a acreditar para el cliente <strong className="text-amber-400">{editingTopUp.userEmail || 'Cliente'}</strong> si la cifra del comprobante es diferente a la solicitada.
            </p>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Nuevo Monto ($ USD)</label>
              <div className="relative mb-3">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-amber-400 text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newTopUpAmountInput}
                  onChange={(e) => setNewTopUpAmountInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-amber-500 rounded-xl pl-8 pr-4 py-3 text-white font-black text-lg focus:outline-none"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {(() => {
                const topUpObj = pendingTopUps.find(t => t.id === editingTopUp.id);
                const warn = topUpObj?.verification_warnings?.find((w: string) => w.includes('Diferencia de Monto'));
                const match = warn?.match(/(?:muestra|detectó|cifras como) \$([0-9\.]+)/i);
                const ocrVal = match && match[1] ? parseFloat(match[1]) : null;

                if (ocrVal) {
                  return (
                    <button
                      type="button"
                      onClick={() => setNewTopUpAmountInput(ocrVal.toFixed(2))}
                      className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> Usar valor detectado por OCR (${ocrVal.toFixed(2)})
                    </button>
                  );
                }
                return null;
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingTopUp(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const val = parseFloat(newTopUpAmountInput);
                  if (isNaN(val) || val <= 0) {
                    alert('Por favor ingresa un monto válido mayor a 0');
                    return;
                  }
                  if (onUpdateTopUpAmount) {
                    onUpdateTopUpAmount(editingTopUp.id, val);
                  }
                  setEditingTopUp(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                Guardar Nuevo Monto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR SALDO MANUALMENTE */}
      {editingBalanceUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-amber-500/40 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-black text-white uppercase text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" /> Ajuste Manual de Saldo
              </h3>
              <button
                onClick={() => setEditingBalanceUser(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-black">Cliente</p>
                <p className="text-white text-sm font-bold truncate">{editingBalanceUser.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono">{editingBalanceUser.email}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-400 uppercase font-black">Saldo Actual</p>
                <p className="text-amber-400 font-black text-lg">${(editingBalanceUser.walletBalanceUSD || 0).toFixed(2)}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Monto a Ajustar ($ USD)</label>
              <div className="relative mb-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-amber-400 text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={editBalanceAmount}
                  onChange={(e) => setEditBalanceAmount(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-amber-500 rounded-xl pl-8 pr-4 py-3 text-white font-black text-lg focus:outline-none"
                  placeholder="Ej: 5.00 o -2.50"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Usa números positivos para sumar saldo, o negativos (ej: -5) para restar.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Nota Administrativa (Opcional)</label>
              <input
                type="text"
                value={editBalanceNote}
                onChange={(e) => setEditBalanceNote(e.target.value)}
                className="w-full bg-black/60 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2 text-white font-bold text-xs focus:outline-none"
                placeholder="Ej: Reembolso, premio, ajuste..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingBalanceUser(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdminBalanceAdjustment}
                disabled={!editBalanceAmount || parseFloat(editBalanceAmount) === 0}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-xs uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer transition-colors"
              >
                Confirmar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
