-- 1. Tabela de Grupos de Adicionais (Ex: "Turbine seu Lanche", "Bebidas")
CREATE TABLE IF NOT EXISTS extras_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  min_options INTEGER DEFAULT 0,
  max_options INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Opções de Adicionais (Ex: "Bacon", "Ovo", "Coca-Cola")
CREATE TABLE IF NOT EXISTS extras_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES extras_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Relacionamento Produto <-> Grupos (Quais produtos têm quais adicionais)
CREATE TABLE IF NOT EXISTS product_extras (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  group_id UUID REFERENCES extras_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, group_id)
);

-- RLS (Permissões)
ALTER TABLE extras_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_extras ENABLE ROW LEVEL SECURITY;

-- Leitura pública (para o cardápio)
CREATE POLICY "Public read extras_groups" ON extras_groups FOR SELECT USING (true);
CREATE POLICY "Public read extras_options" ON extras_options FOR SELECT USING (true);
CREATE POLICY "Public read product_extras" ON product_extras FOR SELECT USING (true);

-- Escrita (Admin/Autenticado)
CREATE POLICY "Admin write extras_groups" ON extras_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin write extras_options" ON extras_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin write product_extras" ON product_extras FOR ALL USING (true) WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_extras_options_group ON extras_options(group_id);
CREATE INDEX IF NOT EXISTS idx_product_extras_product ON product_extras(product_id);
