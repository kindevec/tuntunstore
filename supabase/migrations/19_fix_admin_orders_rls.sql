-- ============================================================
-- 19_fix_admin_orders_rls.sql
-- KinDev S.A.S. - Corrección de Políticas RLS para Pedidos de Administrador
-- Proyecto: TunTunStore
-- ============================================================

-- ------------------------------------------------------------
-- 1. POLÍTICAS RLS EN TABLA orders (Permitir lectura y actualización al Administrador)
-- ------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ------------------------------------------------------------
-- 2. POLÍTICAS RLS EN TABLA order_status_history
-- ------------------------------------------------------------
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and Admins can view order status history" ON public.order_status_history;
CREATE POLICY "Users and Admins can view order status history"
    ON public.order_status_history FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admins can insert order status history" ON public.order_status_history;
CREATE POLICY "Admins can insert order status history"
    ON public.order_status_history FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        OR auth.uid() IS NOT NULL
    );

-- ------------------------------------------------------------
-- 3. PERMITIR A LOS ADMINISTRADORES LEER PERFILES PARA JOINS (Name y Email de clientes)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id 
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
