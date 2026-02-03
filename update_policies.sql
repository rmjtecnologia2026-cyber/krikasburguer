-- Arquivo para atualizar as políticas de segurança (RLS)
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas antigas para evitar conflitos
-- (O comando DROP POLICY IF EXISTS não gera erro se a política não existir)

DROP POLICY IF EXISTS "Permitir leitura pública de produtos ativos" ON products;
DROP POLICY IF EXISTS "Permitir leitura pública de banners ativos" ON banners;
DROP POLICY IF EXISTS "Permitir leitura pública de categorias" ON categories;
DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON products;
DROP POLICY IF EXISTS "Permitir leitura pública de banners" ON banners;

-- 2. Políticas para CATEGORIAS
-- Qualquer um pode ler (para o site funcionar)
CREATE POLICY "Leitura pública de categorias" ON categories FOR SELECT USING (true);
-- Apenas usuários autenticados (Admin) podem modificar
CREATE POLICY "Admin gerenciar categorias" ON categories USING (auth.role() = 'authenticated');

-- 3. Políticas para PRODUTOS
-- Público geral: vê apenas produtos ATIVOS
CREATE POLICY "Leitura pública de produtos ativos" ON products FOR SELECT USING (is_active = true);
-- Admin: vê TUDO (ativos e inativos)
CREATE POLICY "Admin ver todos produtos" ON products FOR SELECT USING (auth.role() = 'authenticated');
-- Admin: pode Inserir, Atualizar e Deletar
CREATE POLICY "Admin inserir produtos" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin atualizar produtos" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin deletar produtos" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Políticas para BANNERS
-- Público geral: vê apenas ativos
CREATE POLICY "Leitura pública de banners ativos" ON banners FOR SELECT USING (is_active = true);
-- Admin: gerencia tudo
CREATE POLICY "Admin gerenciar banners" ON banners USING (auth.role() = 'authenticated');
