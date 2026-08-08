-- 03_fix_wallet_purchase.sql

-- 4b. Purchase with Wallet transaction atomically (Actualizado con asignación automática de código)
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
    v_current_balance NUMERIC;
    v_new_order_id UUID;
    v_available_code_id UUID;
    v_available_code TEXT;
    v_has_code BOOLEAN := false;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Lock the user's transactions implicitly by calculating balance inside a transaction
    v_current_balance := public.get_wallet_balance(v_user_id);

    IF v_current_balance < p_price_usd THEN
        RAISE EXCEPTION 'Saldo insuficiente en la billetera virtual.';
    END IF;

    -- 1. Intentar bloquear un código disponible para este producto
    SELECT id, code INTO v_available_code_id, v_available_code
    FROM public.redemption_codes
    WHERE product_id = p_product_id
      AND is_used = false
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_available_code_id IS NOT NULL THEN
        v_has_code := true;
    END IF;

    -- 2. Insert Wallet Debit Transaction
    INSERT INTO public.wallet_transactions (user_id, amount, type, status)
    VALUES (v_user_id, -p_price_usd, 'purchase', 'Aprobado');

    -- 3. Insert Order (Estado depende de si encontramos código o no)
    INSERT INTO public.orders (
        user_id, player_id, player_tag, product_id, product_name_snapshot, 
        diamonds_total, price_usd, status, payment_method, is_wallet_top_up, redemption_code
    ) VALUES (
        v_user_id, p_player_id, p_player_tag, p_product_id, p_product_name_snapshot,
        p_diamonds_total, p_price_usd, 
        CASE WHEN v_has_code THEN 'Completado' ELSE 'Pendiente' END, 
        'wallet_balance', false, 
        CASE WHEN v_has_code THEN v_available_code ELSE NULL END
    ) RETURNING id INTO v_new_order_id;

    -- 4. Insert Order History
    INSERT INTO public.order_status_history (order_id, status, note)
    VALUES (
        v_new_order_id, 
        CASE WHEN v_has_code THEN 'Completado' ELSE 'Pendiente' END, 
        CASE 
            WHEN v_has_code THEN 'Pedido pagado con saldo y código asignado inmediatamente desde el inventario.' 
            ELSE 'Pedido pagado exitosamente con saldo de Billetera Virtual. En espera de disponibilidad de código.' 
        END
    );

    -- 5. Actualizar el código para marcarlo como usado (Si se encontró uno)
    IF v_has_code THEN
        UPDATE public.redemption_codes
        SET is_used = true,
            used_by_order_id = v_new_order_id
        WHERE id = v_available_code_id;
    END IF;

    RETURN json_build_object('success', true, 'order_id', v_new_order_id, 'has_code', v_has_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
