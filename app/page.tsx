import { supabase } from '@/lib/supabase'
import Banner from '@/components/Banner'
import ProductCard from '@/components/ProductCard'
import Cart from '@/components/Cart'

export const revalidate = 0 // Disable cache for real-time updates

export default async function Home() {
  // Buscar categorias
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true })

  // Buscar produtos em destaque
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(6)

  // Buscar todos os produtos ativos
  const { data: allProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Agrupar produtos por categoria
  const productsByCategory = categories?.map(category => ({
    category,
    products: allProducts?.filter(p => p.category_id === category.id) || []
  })) || []

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            🍕 Delivery Express
          </h1>
          <p className="text-center text-orange-100 mt-2">
            Peça agora e receba em casa!
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Banner Promocional */}
        <Banner />

        {/* Produtos em Destaque */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-4xl">⭐</span>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Produtos em Destaque
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Produtos por Categoria */}
        {productsByCategory.map(({ category, products }) => {
          if (products.length === 0) return null

          // Emoji especial para bebidas
          const emoji = category.slug === 'bebidas' ? '🥤' :
            category.slug === 'pizzas' ? '🍕' :
              category.slug === 'lanches' ? '🍔' :
                category.slug === 'sobremesas' ? '🍰' : '🍽️'

          return (
            <section key={category.id} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl">{emoji}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                  {category.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )
        })}

        {/* Mensagem se não houver produtos */}
        {(!allProducts || allProducts.length === 0) && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">
              Nenhum produto disponível no momento.
            </p>
            <p className="text-gray-400 mt-2">
              Volte em breve para conferir nosso cardápio!
            </p>
          </div>
        )}
      </div>

      {/* Carrinho flutuante */}
      <Cart />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 Delivery Express - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </main>
  )
}
