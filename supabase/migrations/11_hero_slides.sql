-- 1. Create table for Hero Slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    button_text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add RLS for hero_slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero slides"
    ON public.hero_slides FOR SELECT
    USING (active = true);

-- Allowing authenticated users to manage for simplicity in admin panel
CREATE POLICY "Admins can manage hero slides"
    ON public.hero_slides FOR ALL
    USING (auth.role() = 'authenticated');

-- 3. Insert default slides
INSERT INTO public.hero_slides (image_url, title, subtitle, button_text, order_index, active)
VALUES
    ('/slide1.png', 'RECUPERA TU PODER', 'Equípate para la batalla con los mejores packs de la temporada.', 'EXPLORAR PROMOCIONES', 0, true),
    ('/slide2.png', 'PROMOCIONES EN DIAMANTES', 'Multiplica tus recursos y domina la arena hoy mismo.', 'COMPRAR AHORA', 1, true);

-- 4. Create Storage Bucket for Banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can upload banners" 
    ON storage.objects FOR INSERT 
    WITH CHECK (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Admins can update banners"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Admins can delete banners"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Anyone can view banners" 
    ON storage.objects FOR SELECT 
    USING ( bucket_id = 'banners' );
