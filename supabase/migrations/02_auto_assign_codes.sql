-- 02_auto_assign_codes.sql

-- Función que se ejecuta cuando se inserta un nuevo código
CREATE OR REPLACE FUNCTION public.auto_assign_code_to_pending_order()
RETURNS TRIGGER AS $$
DECLARE
    v_order_id UUID;
BEGIN
    -- Solo actuar si el código se inserta como no usado
    IF NEW.is_used = false THEN
        -- Buscar el pedido Pendiente más antiguo para este producto
        -- Usamos FOR UPDATE SKIP LOCKED para manejar concurrencia
        -- Nota: Asegúrate de que la columna 'created_at' o similar exista en 'orders'.
        -- Si la tabla 'orders' no tiene 'created_at', ordenaremos por 'date' o el id.
        -- Asumiendo que 'date' (tipo timestamp) o 'created_at' existe. Usaremos date si created_at no existe.
        
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
            
            -- Verificar si la columna used_at existe en redemption_codes. Si existe, la actualizamos
            -- (Lo omito para evitar errores si no existe, is_used es suficiente y es parte de la lógica estándar)

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

-- Crear el Trigger en la tabla redemption_codes
DROP TRIGGER IF EXISTS trg_auto_assign_code ON public.redemption_codes;

CREATE TRIGGER trg_auto_assign_code
BEFORE INSERT ON public.redemption_codes
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_code_to_pending_order();
