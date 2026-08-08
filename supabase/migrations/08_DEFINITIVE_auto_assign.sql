-- ============================================================
-- 08_DEFINITIVE_auto_assign.sql
-- 
-- SCRIPT DEFINITIVO: Ejecuta este script y todo quedará 
-- configurado de una sola vez. No necesitas ejecutar los
-- scripts 02, 04, o 07 anteriores.
-- ============================================================

-- ============================================================
-- PASO 1: Asegurar que la tabla redemption_codes existe 
--         con los tipos de datos CORRECTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.redemption_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    code TEXT NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by_order_id TEXT,  -- TEXT porque orders.id es TEXT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Corregir el tipo si ya existía como UUID
ALTER TABLE public.redemption_codes 
ALTER COLUMN used_by_order_id TYPE TEXT USING used_by_order_id::TEXT;

-- RLS
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;

-- Política para que admin pueda hacer todo
DROP POLICY IF EXISTS "Admin full access on redemption_codes" ON public.redemption_codes;
CREATE POLICY "Admin full access on redemption_codes"
    ON public.redemption_codes FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Política para que clientes puedan ver sus propios códigos
DROP POLICY IF EXISTS "Users can view codes assigned to their orders" ON public.redemption_codes;
CREATE POLICY "Users can view codes assigned to their orders"
    ON public.redemption_codes FOR SELECT
    USING (
        used_by_order_id IN (
            SELECT id FROM public.orders WHERE user_id = auth.uid()
        )
    );

-- ============================================================
-- PASO 2: Habilitar Realtime con REPLICA IDENTITY FULL
--         (Necesario para que el frontend reciba user_id)
-- ============================================================
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;

-- También habilitar realtime para redemption_codes
ALTER TABLE public.redemption_codes REPLICA IDENTITY FULL;

-- ============================================================
-- PASO 3: Función del Trigger (EL CORAZÓN DEL SISTEMA)
--
-- Se ejecuta ANTES de insertar cada código nuevo.
-- Si hay una orden Pendiente para ese producto, le asigna
-- el código automáticamente y marca la orden como Completada.
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_assign_code_to_pending_order()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id TEXT;  -- TEXT porque orders.id es TEXT
BEGIN
    -- Solo actuar si el código se inserta como no usado
    IF NEW.is_used = false THEN
        -- Buscar el pedido Pendiente más antiguo para este producto
        -- FOR UPDATE SKIP LOCKED evita condiciones de carrera
        SELECT id INTO v_order_id
        FROM public.orders
        WHERE product_id = NEW.product_id
          AND status IN ('Pendiente', 'En proceso')
          AND (redemption_code IS NULL OR redemption_code = '')
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED;

        -- Si encontramos un pedido esperando un código
        IF v_order_id IS NOT NULL THEN
            -- 1. Marcar el código como usado ANTES de insertarlo
            NEW.is_used := true;
            NEW.used_by_order_id := v_order_id;
            
            -- 2. Actualizar el pedido: asignarle el código y completarlo
            UPDATE public.orders
            SET status = 'Completado',
                redemption_code = NEW.code
            WHERE id = v_order_id;

            -- 3. Registrar en el historial del pedido
            INSERT INTO public.order_status_history (order_id, status, note)
            VALUES (
                v_order_id, 
                'Completado', 
                'Código asignado automáticamente tras reposición de stock.'
            );
            
            RAISE NOTICE 'Auto-assigned code % to order %', NEW.code, v_order_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PASO 4: Crear/Reemplazar el Trigger
-- ============================================================
DROP TRIGGER IF EXISTS trg_auto_assign_code ON public.redemption_codes;

CREATE TRIGGER trg_auto_assign_code
BEFORE INSERT ON public.redemption_codes
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_code_to_pending_order();

-- ============================================================
-- PASO 5: Recrear la función de compra para que sea compatible
-- ============================================================
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
    v_new_order_id TEXT;  -- TEXT porque orders.id es TEXT
    v_available_code_id UUID;
    v_available_code TEXT;
    v_has_code BOOLEAN := false;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

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

    -- 3. Insert Order
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
            ELSE 'Pedido pagado con saldo. En espera de disponibilidad de código.' 
        END
    );

    -- 5. Actualizar el código como usado (si se encontró uno)
    IF v_has_code THEN
        UPDATE public.redemption_codes
        SET is_used = true,
            used_by_order_id = v_new_order_id
        WHERE id = v_available_code_id;
    END IF;

    RETURN json_build_object('success', true, 'order_id', v_new_order_id, 'has_code', v_has_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
