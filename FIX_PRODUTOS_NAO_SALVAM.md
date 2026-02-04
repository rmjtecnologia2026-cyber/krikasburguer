# 🚨 Correção: Produtos não salvam (Destaque/Edição)

Se você marca um produto como "Destaque", clica em salvar, e ele não salva (ou volta ao normal depois de recarregar), é um bloqueio de segurança no banco de dados.

## ✅ Solução Rápida

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Copie o conteúdo do arquivo `fix_products_policies.sql`
4. Cole e clique em **Run**

Após isso, tente editar os produtos novamente. O botão de estrela (Destaque) funcionará corretamente.
