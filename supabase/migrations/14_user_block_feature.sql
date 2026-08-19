-- ============================================================
-- 14_user_block_feature.sql
-- Sistema de Bloqueo / Desbloqueo de Usuarios por el Administrador
-- ============================================================

-- 1. Agregar la columna is_blocked en public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;

-- 2. Función RPC para que el Administrador Bloquee/Desbloquee usuarios de forma segura
CREATE OR REPLACE FUNCTION public.toggle_user_blocked_status(
    p_target_user_id UUID,
    p_is_blocked BOOLEAN
) RETURNS JSON AS $$
DECLARE
    v_caller_role TEXT;
    v_target_role TEXT;
BEGIN
    -- Verificar que el usuario autenticado sea administrador
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    IF v_caller_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Acceso denegado: Solo administradores pueden bloquear o desbloquear usuarios.';
    END IF;

    -- Evitar que el administrador se auto-bloquee
    IF p_target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Operación no permitida: No puedes bloquear tu propia cuenta de administrador.';
    END IF;

    -- Evitar que se bloquee a otro administrador
    SELECT role INTO v_target_role
    FROM public.profiles
    WHERE id = p_target_user_id;

    IF v_target_role = 'admin' THEN
        RAISE EXCEPTION 'Operación no permitida: No se puede bloquear a una cuenta con rol de Administrador.';
    END IF;

    -- Actualizar el estado de bloqueo
    UPDATE public.profiles
    SET is_blocked = p_is_blocked
    WHERE id = p_target_user_id;

    RETURN json_build_object(
        'success', true, 
        'user_id', p_target_user_id, 
        'is_blocked', p_is_blocked
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Actualizar la función get_all_users_with_balance para incluir is_blocked
DROP FUNCTION IF EXISTS public.get_all_users_with_balance();

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
BEGIN
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

-- 4. SEGURIDAD & COMPRA: Función de compras blindada y con tipado seguro
CREATE OR REPLACE FUNCTION public.purchase_with_wallet_v2(
    p_player_id TEXT,
    p_player_tag TEXT,
    p_product_id TEXT,
    p_product_name_snapshot TEXT,
    p_diamonds_total INTEGER,
    p_price_usd NUMERIC
) RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_is_blocked BOOLEAN;
    v_current_balance NUMERIC;
    v_new_order_id UUID;
    v_available_code_id UUID;
    v_available_code TEXT;
    v_has_code BOOLEAN := false;
    v_order_number TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validar si el usuario está bloqueado
    SELECT is_blocked INTO v_is_blocked
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_is_blocked IS TRUE THEN
        RAISE EXCEPTION 'Tu cuenta ha sido inhabilitada por administración. No puedes realizar compras.';
    END IF;

    -- Verificar saldo disponible en la billetera
    v_current_balance := public.get_wallet_balance(v_user_id);

    IF v_current_balance < p_price_usd THEN
        RAISE EXCEPTION 'Saldo insuficiente en la billetera virtual.';
    END IF;

    -- 1. Intentar bloquear un código disponible para este producto
    SELECT id, code INTO v_available_code_id, v_available_code
    FROM public.redemption_codes
    WHERE product_id::TEXT = p_product_id::TEXT
      AND is_used = false
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_available_code_id IS NOT NULL THEN
        v_has_code := true;
    END IF;

    -- 2. Insertar débito en la billetera virtual
    INSERT INTO public.wallet_transactions (user_id, amount, type, status)
    VALUES (v_user_id, -p_price_usd, 'purchase', 'Aprobado');

    -- Generar número de orden único
    v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));

    -- 3. Insertar Pedido
    INSERT INTO public.orders (
        order_number, user_id, player_id, player_tag, product_id, product_name_snapshot, 
        diamonds_total, price_usd, status, payment_method, is_wallet_top_up, redemption_code
    ) VALUES (
        v_order_number, v_user_id, p_player_id, p_player_tag, p_product_id::UUID, p_product_name_snapshot,
        p_diamonds_total, p_price_usd, 
        CASE WHEN v_has_code THEN 'Completado' ELSE 'Pendiente' END, 
        'wallet_balance', false, 
        CASE WHEN v_has_code THEN v_available_code ELSE NULL END
    ) RETURNING id INTO v_new_order_id;

    -- 4. Insertar Historial del Pedido
    INSERT INTO public.order_status_history (order_id, status, note)
    VALUES (
        v_new_order_id, 
        CASE WHEN v_has_code THEN 'Completado' ELSE 'Pendiente' END, 
        CASE 
            WHEN v_has_code THEN 'Pedido pagado con saldo y código asignado inmediatamente desde el inventario.' 
            ELSE 'Pedido pagado exitosamente con saldo de Billetera Virtual. En espera de disponibilidad de código.' 
        END
    );

    -- 5. Actualizar código como usado si se asignó
    IF v_has_code THEN
        UPDATE public.redemption_codes
        SET is_used = true,
            order_id = v_new_order_id,
            used_at = NOW()
        WHERE id = v_available_code_id;
    END IF;

    RETURN json_build_object('success', true, 'order_id', v_new_order_id, 'has_code', v_has_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. SEGURIDAD: Blindar la inserción de recargas en wallet_transactions
CREATE OR REPLACE FUNCTION public.check_user_not_blocked_on_topup()
RETURNS TRIGGER AS $$
DECLARE
    v_is_blocked BOOLEAN;
BEGIN
    IF NEW.type = 'top_up' THEN
        SELECT is_blocked INTO v_is_blocked
        FROM public.profiles
        WHERE id = NEW.user_id;

        IF v_is_blocked IS TRUE THEN
            RAISE EXCEPTION 'Tu cuenta ha sido inhabilitada por administración para realizar recargas de saldo.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_check_blocked_topup ON public.wallet_transactions;
CREATE TRIGGER trg_check_blocked_topup
BEFORE INSERT ON public.wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION public.check_user_not_blocked_on_topup();

-- 6. Trigger para autoasignación de códigos en reposición de stock
CREATE OR REPLACE FUNCTION public.auto_assign_code_to_pending_order()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id UUID;
BEGIN
    IF NEW.is_used = false THEN
        SELECT id INTO v_order_id
        FROM public.orders
        WHERE product_id::TEXT = NEW.product_id::TEXT
          AND status IN ('Pendiente', 'En proceso')
          AND (redemption_code IS NULL OR redemption_code = '')
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED;

        IF v_order_id IS NOT NULL THEN
            UPDATE public.orders
            SET status = 'Completado',
                redemption_code = NEW.code
            WHERE id = v_order_id;

            INSERT INTO public.order_status_history (order_id, status, note)
            VALUES (
                v_order_id, 
                'Completado', 
                'Código asignado automáticamente tras reposición de stock.'
            );

            UPDATE public.redemption_codes
            SET is_used = true,
                order_id = v_order_id,
                used_at = NOW()
            WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_auto_assign_code ON public.redemption_codes;
CREATE TRIGGER trg_auto_assign_code
AFTER INSERT ON public.redemption_codes
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_code_to_pending_order();

-- 7. OTORGAR PERMISOS A TODOS LOS ROLES
GRANT EXECUTE ON FUNCTION public.purchase_with_wallet_v2(TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_wallet_balance(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_all_users_with_balance() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.toggle_user_blocked_status(UUID, BOOLEAN) TO authenticated, anon, service_role;

-- 8. Actualizar políticas RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert pending top_ups" ON public.wallet_transactions;
CREATE POLICY "Users can insert pending top_ups"
    ON public.wallet_transactions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND type = 'top_up' 
        AND status = 'Pendiente'
        AND amount > 0
        AND NOT (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_blocked IS TRUE))
    );

ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view codes assigned to their orders" ON public.redemption_codes;
CREATE POLICY "Users can view codes assigned to their orders"
    ON public.redemption_codes FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM public.orders WHERE user_id = auth.uid()
        )
    );

-- 9. Notificar recarga de esquema a PostgREST
NOTIFY pgrst, 'reload schema';
