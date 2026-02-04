-- Adicionar coluna de horário de funcionamento na tabela store_settings

ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS opening_hours TEXT DEFAULT 'Segunda a Domingo: 18:00 às 23:00';
