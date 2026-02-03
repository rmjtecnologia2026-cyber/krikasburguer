# Sistema de Delivery

Sistema completo de delivery web para restaurantes, moderno, rápido e responsivo.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **Supabase** - Banco de dados PostgreSQL + Realtime + Auth
- **Vercel** - Deploy e hospedagem

## ✨ Funcionalidades

### Área do Cliente
- ✅ Banner promocional com carrossel automático
- ✅ Produtos em destaque
- ✅ Listagem por categorias (Pizzas, Lanches, Bebidas, Sobremesas)
- ✅ Carrinho de compras com atualização em tempo real
- ✅ Finalização de pedido com formulário completo
- ✅ Design responsivo mobile-first
- ✅ Animações e transições suaves

### Área Administrativa
- ✅ Login seguro com Supabase Auth
- ✅ Dashboard com visualização de pedidos
- ✅ Pedidos em tempo real (Realtime)
- ✅ Notificação sonora para novos pedidos
- ✅ Alerta visual de novos pedidos
- ✅ Alteração de status (Novo → Em Preparo → Saiu para Entrega → Finalizado)
- ✅ Ordenação automática (mais recente primeiro)
- 🔄 CRUD de Produtos (em desenvolvimento)
- 🔄 CRUD de Categorias (em desenvolvimento)
- 🔄 CRUD de Banners (em desenvolvimento)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Copie .env.local.example para .env.local e preencha

# Executar localmente
npm run dev
```

## 🗄️ Configuração

Consulte o arquivo [SETUP.md](./SETUP.md) para instruções detalhadas de:
- Configuração do Supabase
- Criação do banco de dados
- Criação de usuário admin
- Deploy na Vercel

## 📁 Estrutura do Projeto

```
krikas/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx          # Login admin
│   │   └── dashboard/
│   │       └── page.tsx          # Dashboard admin
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Página inicial (cliente)
├── components/
│   ├── Banner.tsx                # Carrossel de banners
│   ├── ProductCard.tsx           # Card de produto
│   └── Cart.tsx                  # Carrinho de compras
├── context/
│   └── CartContext.tsx           # Context do carrinho
├── lib/
│   └── supabase.ts               # Cliente Supabase
├── public/
│   └── sounds/
│       └── notification.mp3      # Som de notificação
├── middleware.ts                 # Proteção de rotas
├── supabase-schema.sql           # Schema do banco
└── SETUP.md                      # Guia de configuração
```

## 🎯 Próximos Passos

- [ ] Implementar CRUD completo de produtos no admin
- [ ] Implementar CRUD de categorias
- [ ] Implementar CRUD de banners
- [ ] Upload de imagens direto no admin
- [ ] Relatórios e estatísticas
- [ ] Integração com WhatsApp
- [ ] Sistema de cupons de desconto

## 📝 Licença

Este projeto foi desenvolvido para uso comercial.

## 🤝 Suporte

Para dúvidas ou suporte, consulte a documentação em [SETUP.md](./SETUP.md)
