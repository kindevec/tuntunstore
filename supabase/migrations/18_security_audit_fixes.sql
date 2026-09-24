-- ============================================================
-- 18_security_audit_fixes.sql
-- KinDev S.A.S. - Auditoría y Blindaje de Seguridad Integral
-- Proyecto: TunTunStore
-- ============================================================

-- ------------------------------------------------------------
-- 1. BLINDAJE CONTRA MANIPULACIÓN DE PRECIO EN purchase_with_wallet_v2
-- Vulnerabilidad: La función confiaba en p_price_usd enviado por el cliente.
DROP FUNCTION IF EXISTS public.purchase_with_wallet_v2(text, text, text, text, integer, numeric);

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
    v_real_price NUMERIC;
    v_real_diamonds INTEGER;
    v_real_bonus INTEGER;
    v_is_active BOOLEAN;
    v_product_uuid UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Acceso denegado: Usuario no autenticado';
    END IF;

    -- Validar si el usuario está bloqueado
    SELECT is_blocked INTO v_is_blocked
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_is_blocked IS TRUE THEN
        RAISE EXCEPTION 'Tu cuenta ha sido inhabilitada por la administración. No puedes realizar compras.';
    END IF;

    -- Validar formato del ID de producto
    BEGIN
        v_product_uuid := p_product_id::UUID;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Identificador de producto inválido';
    END;

    -- OBTENER PRECIO REAL DE LA BASE DE DATOS (Anti-Tampering)
    SELECT price_usd, diamonds, COALESCE(bonus_diamonds, 0), active
    INTO v_real_price, v_real_diamonds, v_real_bonus, v_is_active
    FROM public.products
    WHERE id = v_product_uuid;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado en el catálogo oficial';
    END IF;

    IF v_is_active IS FALSE THEN
        RAISE EXCEPTION 'El producto seleccionado no está activo para la venta';
    END IF;

    IF v_real_price <= 0 THEN
        RAISE EXCEPTION 'Precio del producto inválido';
    END IF;

    -- Verificar saldo disponible en la billetera virtual contra el precio REAL
    v_current_balance := public.get_wallet_balance(v_user_id);

    IF v_current_balance < v_real_price THEN
        RAISE EXCEPTION 'Saldo insuficiente en la billetera virtual. Saldo disponible: $%, Precio requerido: $%', v_current_balance, v_real_price;
    END IF;

    -- 1. Intentar bloquear un código disponible para este producto
    SELECT id, code INTO v_available_code_id, v_available_code
    FROM public.redemption_codes
    WHERE product_id = v_product_uuid
      AND is_used = false
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_available_code_id IS NOT NULL THEN
        v_has_code := true;
    END IF;

    -- 2. Insertar débito en la billetera virtual utilizando el precio REAL verificado
    INSERT INTO public.wallet_transactions (user_id, amount, type, status, admin_note)
    VALUES (v_user_id, -v_real_price, 'purchase', 'Aprobado', 'Compra: ' || p_product_name_snapshot);

    -- Generar número de orden único
    v_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));

    -- 3. Insertar Pedido
    INSERT INTO public.orders (
        order_number, user_id, player_id, player_tag, product_id, product_name_snapshot, 
        diamonds_total, price_usd, status, payment_method, is_wallet_top_up, redemption_code
    ) VALUES (
        v_order_number, v_user_id, p_player_id, p_player_tag, v_product_uuid, p_product_name_snapshot,
        (v_real_diamonds + v_real_bonus), v_real_price, 
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- ------------------------------------------------------------
-- 2. BLINDAJE ESTRICTO Y ENRIQUECIMIENTO DE confirm_payphone_payment
-- Vulnerabilidad: Ejecutable por 'authenticated' permitiendo aprobar pagos falsos.
-- Solución: REVOCAR authenticated. Solo 'service_role' (Edge Function) puede ejecutarlo.
-- Retorna todos los datos de recibo (código de autorización, tipo de tarjeta, últimos dígitos).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION confirm_payphone_payment(p_client_transaction_id TEXT, p_payphone_response JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tx RECORD;
    v_wallet_tx_id UUID;
    v_amount_usd NUMERIC;
    v_auth_code TEXT;
    v_card_type TEXT;
    v_last_four TEXT;
    v_status_code INTEGER;
    v_transaction_status TEXT;
    v_err_msg TEXT;
BEGIN
    -- 1. Buscar la transacción con bloqueo de fila (FOR UPDATE)
    SELECT * INTO v_tx
    FROM payphone_transactions
    WHERE client_transaction_id = p_client_transaction_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transacción no encontrada en el sistema');
    END IF;

    -- 2. Si ya fue aprobada previamente (Idempotencia)
    IF v_tx.status = 'approved' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'already_processed', true,
            'wallet_transaction_id', v_tx.wallet_transaction_id,
            'amount_usd', (v_tx.amount_cents / 100.0),
            'authorization_code', v_tx.authorization_code,
            'card_type', v_tx.card_type,
            'last_four_digits', v_tx.last_four_digits
        );
    END IF;

    -- 3. Validar estado procesable
    IF v_tx.status NOT IN ('pending', 'prepared', 'confirmed') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Estado de transacción no apto para confirmación');
    END IF;

    -- 4. Verificar si PayPhone confirmó aprobación (statusCode = 3 o transactionStatus = 'Approved')
    v_status_code := (p_payphone_response->>'statusCode')::INTEGER;
    v_transaction_status := p_payphone_response->>'transactionStatus';
    
    IF v_status_code = 3 OR v_transaction_status = 'Approved' THEN
        v_amount_usd := v_tx.amount_cents / 100.0;
        v_auth_code := p_payphone_response->>'authorizationCode';
        v_card_type := COALESCE(p_payphone_response->>'cardType', 'Tarjeta');
        v_last_four := COALESCE(p_payphone_response->>'lastDigits', '••••');
        
        -- 5. Insertar saldo acreditado en wallet_transactions
        INSERT INTO wallet_transactions (user_id, amount, type, status, admin_note)
        VALUES (v_tx.user_id, v_amount_usd, 'top_up', 'Aprobado', 'PayPhone Auth: ' || COALESCE(v_auth_code, 'N/A'))
        RETURNING id INTO v_wallet_tx_id;
        
        -- 6. Actualizar registro en payphone_transactions
        UPDATE payphone_transactions
        SET status = 'approved',
            confirm_response = p_payphone_response,
            wallet_transaction_id = v_wallet_tx_id,
            authorization_code = v_auth_code,
            card_type = v_card_type,
            last_four_digits = v_last_four,
            updated_at = now()
        WHERE id = v_tx.id;
        
        -- 7. Retornar éxito completo para comprobante visual
        RETURN jsonb_build_object(
            'success', true, 
            'wallet_transaction_id', v_wallet_tx_id, 
            'amount_usd', v_amount_usd,
            'authorization_code', v_auth_code,
            'card_type', v_card_type,
            'last_four_digits', v_last_four
        );
    ELSE
        -- 8. Pago declinado o con error: capturar mensaje exacto del banco/pasarela
        v_err_msg := COALESCE(p_payphone_response->>'message', 'Pago no aprobado por la pasarela');
        
        UPDATE payphone_transactions
        SET status = 'failed',
            confirm_response = p_payphone_response,
            error_message = v_err_msg,
            updated_at = now()
        WHERE id = v_tx.id;
        
        RETURN jsonb_build_object(
            'success', false, 
            'error', v_err_msg, 
            'status_code', v_status_code
        );
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION confirm_payphone_payment(TEXT, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION confirm_payphone_payment(TEXT, JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION confirm_payphone_payment(TEXT, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION confirm_payphone_payment(TEXT, JSONB) TO service_role;


-- ------------------------------------------------------------
-- 3. PREVENCIÓN DE ESCALADA DE PRIVILEGIOS EN public.profiles
-- Vulnerabilidad: Un usuario podría intentar actualizar su propia columna 'role' a 'admin'.
-- Solución: Trigger BEFORE UPDATE que impide modificar 'role' e 'is_blocked' salvo por un admin.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER AS $$
DECLARE
    v_caller_role TEXT;
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_blocked IS DISTINCT FROM OLD.is_blocked THEN
        SELECT role INTO v_caller_role
        FROM public.profiles
        WHERE id = auth.uid();

        IF v_caller_role IS DISTINCT FROM 'admin' THEN
            RAISE EXCEPTION 'Acceso denegado: No tienes permisos para modificar el rol o estado de bloqueo.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();


-- ------------------------------------------------------------
-- 4. CORRECCIÓN DE POLÍTICAS RLS EN hero_slides Y BANNERS
-- Vulnerabilidad: Se usaba auth.role() = 'authenticated', permitiendo a cualquier cliente editar banners.
-- Solución: Restringir estrictamente a administradores (role = 'admin').
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage hero slides" ON public.hero_slides;
CREATE POLICY "Admins can manage hero slides"
    ON public.hero_slides FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can upload banners" ON storage.objects;
CREATE POLICY "Admins can upload banners" 
    ON storage.objects FOR INSERT 
    WITH CHECK (
        bucket_id = 'banners' 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admins can update banners" ON storage.objects;
CREATE POLICY "Admins can update banners"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'banners' 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admins can delete banners" ON storage.objects;
CREATE POLICY "Admins can delete banners"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'banners' 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ==============================================================================
-- 10. SEGURIDAD Y PREVENCIÓN DE DUPLICADOS PARA COMPROBANTES DE BILLETERA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_receipt_hash 
    ON public.wallet_transactions (receipt_hash) 
    WHERE receipt_hash IS NOT NULL;

-- Función segura para verificar si un hash ya fue utilizado en el sistema (Global)
-- Permite validar duplicados entre cuentas sin exponer datos personales ni montos
CREATE OR REPLACE FUNCTION public.check_receipt_hash_exists(p_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_hash IS NULL OR length(trim(p_hash)) = 0 THEN
        RETURN false;
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM public.wallet_transactions 
        WHERE receipt_hash = p_hash
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_receipt_hash_exists(text) TO anon, authenticated;
