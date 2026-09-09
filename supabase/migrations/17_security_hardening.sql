-- ============================================================
-- 17_security_hardening.sql
-- KinDev S.A.S. - Parche Crítico de Seguridad y Privacidad
-- Proyecto: TunTunStore
-- Aplicado en producción: 2026-09-08 20:08 UTC-5
-- ============================================================

-- ------------------------------------------------------------
-- 1. BLINDAJE DE get_all_users_with_balance()
-- Problema: Permitía a usuarios anónimos descargar la lista completa de usuarios (PII).
-- Solución: Exigir sesión activa y rol 'admin'.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_all_users_with_balance()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT,
    player_id_default TEXT,
    gamer_tag TEXT,
    phone TEXT,
    preferred_bank TEXT,
    wallet_balance_usd NUMERIC,
    is_blocked BOOLEAN
) AS $$
DECLARE
    v_caller_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Acceso denegado: Invocación no autenticada';
    END IF;

    SELECT p.role INTO v_caller_role
    FROM public.profiles p
    WHERE p.id = auth.uid();

    IF v_caller_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Acceso denegado: Se requiere rol de administrador';
    END IF;

    RETURN QUERY
    SELECT 
        p.id, 
        p.name, 
        p.email, 
        p.avatar_url, 
        p.role, 
        p.player_id_default, 
        p.gamer_tag, 
        p.phone, 
        p.preferred_bank,
        COALESCE(SUM(wt.amount), 0) AS wallet_balance_usd,
        COALESCE(p.is_blocked, false) AS is_blocked
    FROM public.profiles p
    LEFT JOIN public.wallet_transactions wt ON p.id = wt.user_id AND wt.status = 'Aprobado'
    GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.get_all_users_with_balance() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_all_users_with_balance() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_all_users_with_balance() TO authenticated, service_role;


-- ------------------------------------------------------------
-- 2. BLINDAJE DE get_admin_dashboard_stats()
-- Problema: Exponía métricas financieras a visitantes anónimos.
-- Solución: Restringir a administradores autenticados.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
    v_total_orders BIGINT;
    v_total_sales_usd NUMERIC;
    v_total_diamonds BIGINT;
    v_pending_orders BIGINT;
    v_in_progress_orders BIGINT;
    v_completed_orders BIGINT;
    v_cancelled_orders BIGINT;
    v_total_users BIGINT;
    v_total_wallet_funds NUMERIC;
    v_pending_topups BIGINT;
    v_payphone_total_usd NUMERIC;
    v_payphone_count BIGINT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Acceso denegado: Invocación no autenticada';
    END IF;

    SELECT p.role INTO v_caller_role
    FROM public.profiles p
    WHERE p.id = auth.uid();

    IF v_caller_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Acceso denegado: Se requiere rol de administrador';
    END IF;

    SELECT 
        COUNT(*),
        COALESCE(SUM(CASE WHEN status = 'Completado' THEN price_usd ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN status = 'Completado' THEN diamonds_total ELSE 0 END), 0),
        COUNT(CASE WHEN status = 'Pendiente' THEN 1 END),
        COUNT(CASE WHEN status = 'En proceso' THEN 1 END),
        COUNT(CASE WHEN status = 'Completado' THEN 1 END),
        COUNT(CASE WHEN status = 'Cancelado' THEN 1 END)
    INTO 
        v_total_orders, v_total_sales_usd, v_total_diamonds,
        v_pending_orders, v_in_progress_orders, v_completed_orders, v_cancelled_orders
    FROM orders;

    SELECT 
        COUNT(*),
        COALESCE(SUM(wallet_balance_usd), 0)
    INTO v_total_users, v_total_wallet_funds
    FROM get_all_users_with_balance();

    SELECT COUNT(*)
    INTO v_pending_topups
    FROM wallet_transactions
    WHERE type = 'top_up' AND status = 'Pendiente';

    SELECT 
        COALESCE(SUM(amount_cents) / 100.0, 0),
        COUNT(*)
    INTO v_payphone_total_usd, v_payphone_count
    FROM payphone_transactions
    WHERE status = 'approved';

    RETURN jsonb_build_object(
        'total_orders', v_total_orders,
        'total_sales_usd', v_total_sales_usd,
        'total_diamonds_delivered', v_total_diamonds,
        'pending_orders', v_pending_orders,
        'in_progress_orders', v_in_progress_orders,
        'completed_orders', v_completed_orders,
        'cancelled_orders', v_cancelled_orders,
        'total_users', v_total_users,
        'total_wallet_funds', v_total_wallet_funds,
        'pending_topups', v_pending_topups,
        'payphone_total_usd', v_payphone_total_usd,
        'payphone_count', v_payphone_count
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated, service_role;


-- ------------------------------------------------------------
-- 3. BLINDAJE DE get_wallet_balance()
-- Problema: Cualquiera podía consultar el saldo de cualquier usuario.
-- Solución: Solo el dueño o un admin puede consultar el saldo.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_wallet_balance(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_caller_role TEXT;
    total_balance NUMERIC;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Acceso denegado: Invocacion no autenticada';
    END IF;

    IF auth.uid() != p_user_id THEN
        SELECT p.role INTO v_caller_role FROM public.profiles p WHERE p.id = auth.uid();
        IF v_caller_role IS DISTINCT FROM 'admin' THEN
            RAISE EXCEPTION 'Acceso denegado: No puedes consultar el saldo de otro usuario';
        END IF;
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO total_balance
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND status = 'Aprobado';
    
    RETURN total_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.get_wallet_balance(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_wallet_balance(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_wallet_balance(UUID) TO authenticated, service_role;


-- ------------------------------------------------------------
-- 4. BLINDAJE DE confirm_payphone_payment
-- Problema: Ejecutable por anónimos.
-- Solución: Solo authenticated y service_role.
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION confirm_payphone_payment(TEXT, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION confirm_payphone_payment(TEXT, JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION confirm_payphone_payment(TEXT, JSONB) TO authenticated, service_role;


-- ------------------------------------------------------------
-- 5. BLINDAJE DE payphone_transactions (RLS)
-- Problema: Política "Service role todo" con roles={public} permitía lectura/escritura total.
-- Solución: Reemplazar con políticas específicas por rol.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Service role todo" ON public.payphone_transactions;

CREATE POLICY "Users can insert own pending payphone tx"
    ON public.payphone_transactions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND status = 'pending'
    );

CREATE POLICY "Admins can view all payphone transactions"
    ON public.payphone_transactions FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update payphone transactions"
    ON public.payphone_transactions FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );


-- ------------------------------------------------------------
-- 6. BLINDAJE DE funciones auxiliares
-- Problema: Ejecutables por anónimos por defecto de PostgreSQL.
-- Solución: Revocar acceso anónimo.
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.toggle_user_blocked_status(UUID, BOOLEAN) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.toggle_user_blocked_status(UUID, BOOLEAN) FROM anon;
GRANT EXECUTE ON FUNCTION public.toggle_user_blocked_status(UUID, BOOLEAN) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.purchase_with_wallet_v2(TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purchase_with_wallet_v2(TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC) FROM anon;
GRANT EXECUTE ON FUNCTION public.purchase_with_wallet_v2(TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC) TO authenticated, service_role;
