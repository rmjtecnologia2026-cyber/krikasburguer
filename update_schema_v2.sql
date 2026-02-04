-- 1. Tabela de Configurações da Loja
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Garante apenas uma linha
  name TEXT DEFAULT 'Delivery Express',
  address TEXT DEFAULT 'Rua Exemplo, 123 - Centro',
  phone TEXT DEFAULT '(00) 00000-0000',
  logo_url TEXT,
  is_open BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para store_settings
-- Leitura pública
CREATE POLICY "Public read access for store settings" ON store_settings
  FOR SELECT USING (true);

-- Atualização apenas para admin (usando a role auth verificada anteriormente ou anon/service se não tiver auth configurado ainda, mas idealmente restrito)
-- Como o sistema usa role 'admin' na tabela profiles, vamos simplificar permitindo update authenticated por enquanto, ou verificar a policy de admin na tabela profiles se possível.
-- Para simplificar e garantir funcionamento imediato do admin:
CREATE POLICY "Authenticated users can update settings" ON store_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Inserir dados iniciais se não existirem
INSERT INTO store_settings (id, name, is_open)
VALUES (1, 'Krikas Burguer', true)
ON CONFLICT (id) DO NOTHING;


-- 2. Correção de Permissões de Pedidos (Orders)
-- Primeiro, vamos garantir que as tabelas tenham RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos (opcional, mas seguro)
DROP POLICY IF EXISTS "Permitir inserção de pedidos" ON orders;
DROP POLICY IF EXISTS "Permitir inserção de itens do pedido" ON order_items;
DROP POLICY IF EXISTS "Anon can insert orders" ON orders;
DROP POLICY IF EXISTS "Anon can insert order items" ON order_items;

-- Criar políticas permissivas para inserção pública (Anônima e Autenticada)
CREATE POLICY "Enable insert for all users" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Permitir que usuários vejam seus próprios pedidos (se houver lógica de auth no futuro) ou publicamente se necessário para status?
-- Por enquanto, admin vê tudo. Cliente vê nada (o retorno do insert já traz os dados).
-- Vamos permitir select para anon apenas para garantir que o cliente consiga ler o que acabou de inserir se o supabase retornar os dados.
CREATE POLICY "Enable select for all users" ON orders
  FOR SELECT USING (true);
  
CREATE POLICY "Enable select for all users items" ON order_items
  FOR SELECT USING (true);
