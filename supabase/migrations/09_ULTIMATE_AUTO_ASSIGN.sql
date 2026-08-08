-- ============================================================
-- 09_ULTIMATE_AUTO_ASSIGN.sql
-- ============================================================

-- 1. Agregar las tablas al canal de Realtime (súper importante para que el cliente se actualice)
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.redemption_codes;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;

-- 2. Asegurar que las columnas son TEXT para evitar errores de cast
ALTER TABLE public.redemption_codes 
ALTER COLUMN used_by_order_id TYPE TEXT USING used_by_order_id::TEXT;

-- 3. Cambiamos la estrategia: Usar AFTER INSERT en lugar de BEFORE INSERT
--    para evitar cualquier problema de bloqueos durante la inserción.
CREATE OR REPLACE FUNCTION public.auto_assign_code_to_pending_order()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id TEXT;
BEGIN
    -- Solo actuar si el código se inserta como no usado
    IF NEW.is_used = false THEN
        -- Buscar el pedido Pendiente más antiguo para este producto
        SELECT id::TEXT INTO v_order_id
        FROM public.orders
        WHERE product_id::TEXT = NEW.product_id::TEXT
          AND status IN ('Pendiente', 'En proceso')
          AND (redemption_code IS NULL OR redemption_code = '')
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED;

        -- Si encontramos un pedido esperando un código
        IF v_order_id IS NOT NULL THEN
            -- 1. Actualizar el pedido ANTES de actualizar el código
            UPDATE public.orders
            SET status = 'Completado',
                redemption_code = NEW.code
            WHERE id::TEXT = v_order_id;

            -- 2. Insertar en el historial del pedido
            INSERT INTO public.order_status_history (order_id, status, note)
            VALUES (
                v_order_id, -- Nota: Si esto es UUID, Postgres lo intentará castear. Si falla, el error saldrá aquí.
                'Completado', 
                'Código asignado automáticamente tras reposición de stock.'
            );

            -- 3. Actualizar el código para marcarlo como usado
            -- (Como estamos en AFTER INSERT, debemos usar UPDATE en lugar de NEW.is_used = true)
            UPDATE public.redemption_codes
            SET is_used = true,
                used_by_order_id = v_order_id
            WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recrear el Trigger como AFTER INSERT
DROP TRIGGER IF EXISTS trg_auto_assign_code ON public.redemption_codes;

CREATE TRIGGER trg_auto_assign_code
AFTER INSERT ON public.redemption_codes
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_code_to_pending_order();


-- ============================================================
-- 5. FUNCIÓN DE RESCATE (BOTOÓN DE EMERGENCIA)
-- Por si hay pedidos que se quedaron pegados, el admin puede
-- ejecutar esto para forzar la asignación a todos los pendientes.
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_force_auto_assign()
RETURNS JSON AS $$
DECLARE
    v_order RECORD;
    v_code RECORD;
    v_assigned_count INT := 0;
BEGIN
    -- Para cada pedido pendiente
    FOR v_order IN 
        SELECT id, product_id 
        FROM public.orders 
        WHERE status IN ('Pendiente', 'En proceso') 
          AND (redemption_code IS NULL OR redemption_code = '')
        ORDER BY created_at ASC
    LOOP
        -- Buscar código disponible
        SELECT id, code INTO v_code
        FROM public.redemption_codes
        WHERE product_id::TEXT = v_order.product_id::TEXT
          AND is_used = false
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED;

        IF v_code.id IS NOT NULL THEN
            -- Actualizar pedido
            UPDATE public.orders
            SET status = 'Completado',
                redemption_code = v_code.code
            WHERE id = v_order.id;

            -- Actualizar historial
            INSERT INTO public.order_status_history (order_id, status, note)
            VALUES (v_order.id, 'Completado', 'Código asignado manualmente mediante Forzar Asignación.');

            -- Actualizar código
            UPDATE public.redemption_codes
            SET is_used = true, used_by_order_id = v_order.id::TEXT
            WHERE id = v_code.id;

            v_assigned_count := v_assigned_count + 1;
        END IF;
    END LOOP;

    RETURN json_build_object('success', true, 'assigned_count', v_assigned_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
