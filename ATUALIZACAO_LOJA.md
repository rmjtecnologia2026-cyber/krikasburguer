# 🚀 Atualização: Controle de Horários e Destaques

Para ativar todas as novas funcionalidades (Carrossel, Horários, Abrir/Fechar Loja), siga estes passos no Supabase:

## 1. Acesse o Supabase
- Vá em **SQL Editor**.

## 2. Rode os seguintes scripts (nesta ordem):

### A. Corrigir permissões gerais (Para salvar configurações e Destaques)
Copie e cole o conteúdo de:
- `fix_products_policies.sql` (Permite salvar Destaques)
- `fix_store_settings_policies.sql` (Permite Abrir/Fechar Loja)

### B. Adicionar funcionalidade de Horários
Copie e cole o conteúdo de:
- `add_opening_hours.sql` (Cria campo de Horário)

### C. (Opcional) Testar o Carrossel
Se o carrossel ainda não apareceu:
- `force_featured_products.sql` (Ativa 5 produtos como destaque)

---
Depois de rodar isso, vá no Painel Admin > Configurações e preencha o **Horário de Funcionamento**. Ele aparecerá para os clientes quando a loja estiver fechada.
