-- Corrigir permissões da tabela PRODUCTS

-- 1. Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas
DROP POLICY IF EXISTS "Produtos visíveis publicamente" ON products;
DROP POLICY IF EXISTS "Admin gerencia produtos" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

-- 3. Criar nova política de Leitura Pública
CREATE POLICY "Produtos visíveis publicamente"
ON products FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Criar nova política de Escrita Total para Admin (Autenticado)
CREATE POLICY "Admin gerencia produtos"
ON products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
