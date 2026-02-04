# 🛠️ Correção: Erro ao Criar Categoria

Se você está recebendo um erro ao tentar criar ou editar categorias no painel administrativo, é provável que seja um problema de permissão no banco de dados.

## ✅ Como Resolver

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Copie o conteúdo do arquivo `fix_categories_policies.sql` (disponível na raiz do projeto)
4. Cole no editor e clique em **Run**

## 📝 O que isso faz?
Este script configura as permissões de segurança (RLS - Row Level Security) para garantir que:
- Qualquer pessoa possa **ver** as categorias (no cardápio).
- Apenas usuários autenticados (você/admin) possam **criar, editar ou excluir** categorias.
