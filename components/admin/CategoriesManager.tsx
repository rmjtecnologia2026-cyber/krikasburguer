'use client'

import { useState, useEffect } from 'react'
import { supabase, Category } from '@/lib/supabase'
import CategoryList from './CategoryList'
import CategoryForm from './CategoryForm'

export default function CategoriesManager() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('order', { ascending: true })

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error('Erro ao buscar categorias:', error)
            alert('Erro ao carregar categorias.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingCategory(null)
        setIsEditing(true)
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setIsEditing(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza? Isso pode afetar produtos vinculados.')) return

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error

            setCategories(categories.filter(c => c.id !== id))
        } catch (error) {
            console.error('Erro ao excluir:', error)
            alert('Erro ao excluir categoria.')
        }
    }

    const handleSave = () => {
        setIsEditing(false)
        fetchCategories()
    }

    if (loading) return <div className="text-center py-12">Carregando...</div>

    if (isEditing) {
        return (
            <CategoryForm
                category={editingCategory}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
            />
        )
    }

    return (
        <CategoryList
            categories={categories}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    )
}
