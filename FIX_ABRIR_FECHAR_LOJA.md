# 🚨 Correção: Abrir/Fechar Loja não funciona

Se você clica no botão para fechar a loja, mas os clientes ainda conseguem pedir (ou a configuração não salva), é um problema de permissão no banco de dados.

## ✅ Solução Rápida

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Copie o conteúdo do arquivo `fix_store_settings_policies.sql`
4. Cole e clique em **Run**

Após isso, tente fechar a loja novamente no painel. O carrinho será bloqueado para os clientes.
