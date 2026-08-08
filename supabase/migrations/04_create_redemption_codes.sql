-- 04_create_redemption_codes.sql

-- Crear tabla de códigos de canje
CREATE TABLE IF NOT EXISTS public.redemption_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    code TEXT NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_by_order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
-- Los administradores pueden leer y escribir todos los códigos
CREATE POLICY "Admins can manage redemption codes"
    ON public.redemption_codes
    FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Los usuarios normales NO pueden leer la tabla de códigos directamente.
-- La asignación de códigos se hace mediante funciones seguras (SECURITY DEFINER)
-- y los códigos asignados los ven a través de la tabla `orders.redemption_code`.
