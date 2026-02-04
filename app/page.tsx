// ... (imports remain up to Footer, removing unused ones if necessary)
import { supabase } from '@/lib/supabase'
import StoreFront from '@/components/StoreFront'

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
    <main>
      <StoreFront
        categories={categories || []}
        featuredProducts={featuredProducts || []}
        productsByCategory={productsByCategory}
      />
    </main>
  )
}
