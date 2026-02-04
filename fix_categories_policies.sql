-- Arrumar permissões para tabela categories

-- 1. Habilitar RLS (caso não esteja)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 2. Limpar politicas existentes para evitar conflito
DROP POLICY IF EXISTS "Categorias visíveis para todos" ON categories;
DROP POLICY IF EXISTS "Admin pode gerenciar categorias" ON categories;
DROP POLICY IF EXISTS "Permitir select para anon" ON categories;
DROP POLICY IF EXISTS "Permitir tudo para authenticated" ON categories;

-- 3. Criar politica de leitura pública (necessário para o cardápio)
CREATE POLICY "Categorias visíveis para todos"
ON categories FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Criar politica de escrita apenas para admin/autenticado
CREATE POLICY "Admin pode gerenciar categorias"
ON categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
