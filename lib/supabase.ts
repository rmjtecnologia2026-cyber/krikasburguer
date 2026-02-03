import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types para o banco de dados
export type Category = {
  id: string
  name: string
  slug: string
  order: number
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category_id: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  category?: Category
}

export type Banner = {
  id: string
  title: string
  description: string
  image_url: string
  is_active: boolean
  order: number
  created_at: string
}

export type OrderStatus = 'novo' | 'em_preparo' | 'saiu_entrega' | 'finalizado'

export type Order = {
  id: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  observations: string | null
  total: number
  status: OrderStatus
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}
