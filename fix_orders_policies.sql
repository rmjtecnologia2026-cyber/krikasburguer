-- Políticas de segurança para a tabela ORDERS
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura de pedidos para admin" ON orders;
DROP POLICY IF EXISTS "Permitir atualização de pedidos para admin" ON orders;
DROP POLICY IF EXISTS "Permitir leitura de itens para admin" ON order_items;
DROP POLICY IF EXISTS "Admin pode ler todos pedidos" ON orders;
DROP POLICY IF EXISTS "Admin pode atualizar pedidos" ON orders;
DROP POLICY IF EXISTS "Admin pode ler itens dos pedidos" ON order_items;

-- 2. Permitir que ADMIN leia todos os pedidos
CREATE POLICY "Admin pode ler todos pedidos" ON orders FOR SELECT USING (auth.role() = 'authenticated');

-- 3. Permitir que ADMIN atualize pedidos (status, etc)
CREATE POLICY "Admin pode atualizar pedidos" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Permitir que ADMIN leia todos os itens dos pedidos
CREATE POLICY "Admin pode ler itens dos pedidos" ON order_items FOR SELECT USING (auth.role() = 'authenticated');
