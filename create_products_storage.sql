-- Criar bucket para imagens de produtos
-- Execute este script no SQL Editor do Supabase

-- 1. Criar bucket público para produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir upload de imagens (authenticated users)
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- 3. Permitir que todos vejam as imagens (público)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- 4. Permitir que authenticated users deletem imagens
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- 5. Permitir que authenticated users atualizem imagens
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');
