'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Category } from '@/lib/supabase'

interface CategoryFormProps {
    category?: Category | null
    onSave: () => void
    onCancel: () => void
}

export default function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: category?.name || '',
        slug: category?.slug || '',
        order: category?.order || 0,
    })

    // Atualizar formData quando category mudar
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                slug: category.slug,
                order: category.order,
            })
        } else {
            setFormData({
                name: '',
                slug: '',
                order: 0,
            })
        }
    }, [category])

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        setFormData(prev => ({
            ...prev,
            name,
            slug: !category ? generateSlug(name) : prev.slug
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (category?.id) {
                const { error } = await supabase
                    .from('categories')
                    .update(formData)
                    .eq('id', category.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([formData])
                if (error) throw error
            }
            onSave()
        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar categoria.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {category ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleNameChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Ex: Bebidas"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                    <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordem de Exibição</label>
                    <input
                        type="number"
                        required
                        value={formData.order}
                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    )
}
