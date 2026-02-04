-- Adicionar métodos de pagamento na tabela orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'money', -- 'money', 'card', 'pix'
ADD COLUMN IF NOT EXISTS change_for TEXT DEFAULT NULL;

-- Atualizar RLS para garantir que esses novos campos possam ser inseridos/vistos
DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public select orders" ON orders;
CREATE POLICY "Public select orders" ON orders FOR SELECT USING (true);
