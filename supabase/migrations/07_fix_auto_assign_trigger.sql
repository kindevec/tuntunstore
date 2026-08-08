-- 07_fix_auto_assign_trigger.sql

-- 1. Arreglar el tipo de dato de la columna used_by_order_id (debe ser TEXT porque los orders usan IDs como 'TTS-84920')
ALTER TABLE public.redemption_codes 
ALTER COLUMN used_by_order_id TYPE TEXT USING used_by_order_id::TEXT;

-- 2. Reemplazar la función del trigger para que la variable v_order_id también sea TEXT y no lance error al asignar
CREATE OR REPLACE FUNCTION public.auto_assign_code_to_pending_order()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id TEXT;
BEGIN
    -- Solo actuar si el código se inserta como no usado
    IF NEW.is_used = false THEN
        -- Buscar el pedido Pendiente más antiguo para este producto
        SELECT id INTO v_order_id
        FROM public.orders
        WHERE product_id = NEW.product_id
          AND status IN ('Pendiente', 'En proceso')
          AND redemption_code IS NULL
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED;

        -- Si encontramos un pedido esperando un código
        IF v_order_id IS NOT NULL THEN
            -- 1. Actualizar el código para marcarlo como usado
            NEW.is_used := true;
            NEW.used_by_order_id := v_order_id;
            
            -- 2. Actualizar el pedido
            UPDATE public.orders
            SET status = 'Completado',
                redemption_code = NEW.code
            WHERE id = v_order_id;

            -- 3. Insertar en el historial del pedido
            INSERT INTO public.order_status_history (order_id, status, note)
            VALUES (
                v_order_id, 
                'Completado', 
                'Código asignado automáticamente tras reposición de stock.'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
