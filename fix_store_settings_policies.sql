-- Corrigir permissões da tabela STORE_SETTINGS

-- 1. Habilitar RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas
DROP POLICY IF EXISTS "Settings visíveis publicamente" ON store_settings;
DROP POLICY IF EXISTS "Admin gerencia settings" ON store_settings;

-- 3. Criar nova política de Leitura Pública
CREATE POLICY "Settings visíveis publicamente"
ON store_settings FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Criar nova política de Escrita Total para Admin (Autenticado)
CREATE POLICY "Admin gerencia settings"
ON store_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Garantir que exita pelo menos um registro com ID 1
INSERT INTO store_settings (id, is_open) VALUES (1, true)
ON CONFLICT (id) DO NOTHING;
