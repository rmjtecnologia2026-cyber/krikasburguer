'use client'

import { useState, useEffect } from 'react'
import { supabase, Product, Category } from '@/lib/supabase'
import ProductList from './ProductList'
import ProductForm from './ProductForm'

export default function ProductsManager() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [extrasGroups, setExtrasGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Buscar categorias
            const { data: categoriesData, error: catError } = await supabase
                .from('categories')
                .select('*')
                .order('name')

            if (catError) throw catError

            // Buscar grupos de adicionais
            const { data: extrasData, error: extrasError } = await supabase
                .from('extras_groups')
                .select('*')
                .order('name')

            if (extrasError) throw extrasError

            // Buscar produtos (admin vê todos devido ao novo RLS)
            const { data: productsData, error: prodError } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .order('name')

            if (prodError) throw prodError

            setCategories(categoriesData || [])
            setExtrasGroups(extrasData || [])
            setProducts(productsData || [])
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            alert('Erro ao carregar produtos e categorias.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingProduct(null)
        setIsEditing(true)
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setIsEditing(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)

            if (error) throw error

            setProducts(products.filter(p => p.id !== id))
        } catch (error) {
            console.error('Erro ao excluir:', error)
            alert('Erro ao excluir produto.')
        }
    }

    const handleSave = async () => {
        setIsEditing(false)
        fetchData() // Recarrega tudo para garantir consistência
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditingProduct(null)
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                <p className="mt-4 text-gray-500">Carregando produtos...</p>
            </div>
        )
    }

    if (isEditing) {
        return (
            <ProductForm
                product={editingProduct}
                categories={categories}
                extrasGroups={extrasGroups}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        )
    }

    return (
        <ProductList
            products={products}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    )
}
