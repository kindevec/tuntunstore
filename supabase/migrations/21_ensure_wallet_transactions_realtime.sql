-- ============================================================
-- 21_ensure_wallet_transactions_realtime.sql
-- KinDev S.A.S. - Asegurar Realtime y RLS para wallet_transactions
-- Proyecto: TunTunStore
-- ============================================================

-- 1. REPLICA IDENTITY FULL para que los eventos de UPDATE y DELETE contengan la fila completa
ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;

-- 2. Asegurar que wallet_transactions esté agregada a la publicación supabase_realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'wallet_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
  END IF;
END $$;

-- 3. POLÍTICAS RLS ROBUSTAS PARA wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Lectura: los usuarios ven sus propias transacciones Y los administradores ven TODAS las transacciones
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Admins can view all wallet transactions" ON public.wallet_transactions;

CREATE POLICY "Users can view own wallet transactions"
    ON public.wallet_transactions FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Actualización: administradores pueden actualizar cualquier transacción (aprobar, rechazar, corregir monto)
DROP POLICY IF EXISTS "Admins can update wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can update wallet transactions"
    ON public.wallet_transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Inserción: usuarios pueden insertar solicitudes de recarga pendientes no bloqueados y administradores
DROP POLICY IF EXISTS "Users can insert pending top_ups" ON public.wallet_transactions;
CREATE POLICY "Users can insert pending top_ups"
    ON public.wallet_transactions FOR INSERT
    WITH CHECK (
        (
            auth.uid() = user_id 
            AND type = 'top_up' 
            AND status = 'Pendiente'
            AND amount > 0
            AND NOT (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_blocked IS TRUE))
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
