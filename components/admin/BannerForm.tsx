'use client'

import { useState } from 'react'
import { supabase, Banner } from '@/lib/supabase'

interface Props {
    banner: Banner | null
    onSave: () => void
    onCancel: () => void
}

export default function BannerForm({ banner, onSave, onCancel }: Props) {
    const [title, setTitle] = useState(banner?.title || '')
    const [description, setDescription] = useState(banner?.description || '')
    const [imageUrl, setImageUrl] = useState(banner?.image_url || '')
    const [order, setOrder] = useState(banner?.order || 0)
    const [isActive, setIsActive] = useState(banner?.is_active ?? true)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const dataToSave = {
                title,
                description,
                image_url: imageUrl,
                order,
                is_active: isActive
            }

            if (banner?.id) {
                // Update
                const { error } = await supabase
                    .from('banners')
                    .update(dataToSave)
                    .eq('id', banner.id)
                if (error) throw error
            } else {
                // Create
                const { error } = await supabase
                    .from('banners')
                    .insert([dataToSave])
                if (error) throw error
            }

            onSave()
        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar o banner.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {banner ? 'Editar Banner' : 'Novo Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                        placeholder="https://..."
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                    />
                    {imageUrl && (
                        <div className="mt-2 text-sm text-gray-500">
                            Preview:
                            <img src={imageUrl} alt="Preview" className="mt-1 h-32 object-cover rounded-lg" />
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                        <input
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                        />
                    </div>
                    <div className="w-1/2 flex items-end">
                        <label className="flex items-center space-x-3 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-700 font-medium">Ativo</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    )
}
