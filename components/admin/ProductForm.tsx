'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Product, Category } from '@/lib/supabase'

interface ProductFormProps {
    product?: Product | null
    categories: Category[]
    extrasGroups?: any[] // New prop
    onSave: () => void
    onCancel: () => void
}

export default function ProductForm({ product, categories, extrasGroups = [], onSave, onCancel }: ProductFormProps) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [selectedExtras, setSelectedExtras] = useState<string[]>([])
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category_id: product?.category_id || '',
        image_url: product?.image_url || '',
        is_featured: product?.is_featured || false,
        is_active: product?.is_active ?? true,
    })

    // Carregar extras do produto se estiver editando
    useState(() => {
        if (product?.id) {
            checkProductExtras()
        }
    })

    async function checkProductExtras() {
        if (!product?.id) return
        const { data } = await supabase
            .from('product_extras')
            .select('group_id')
            .eq('product_id', product.id)

        if (data) {
            setSelectedExtras(data.map(d => d.group_id))
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem')
            return
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB')
            return
        }

        setUploading(true)

        try {
            // Gerar nome único para o arquivo
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`

            // Upload para o Supabase Storage
            const { data, error } = await supabase.storage
                .from('products')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) throw error

            // Obter URL pública da imagem
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            setFormData({ ...formData, image_url: publicUrl })
        } catch (error) {
            console.error('Erro ao fazer upload:', error)
            alert('Erro ao fazer upload da imagem. Tente novamente.')
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveImage = async () => {
        if (!formData.image_url) return

        // Se a imagem está no Supabase Storage, deletar
        if (formData.image_url.includes('supabase')) {
            try {
                const urlParts = formData.image_url.split('/')
                const fileName = urlParts[urlParts.length - 1]

                await supabase.storage
                    .from('products')
                    .remove([fileName])
            } catch (error) {
                console.error('Erro ao deletar imagem:', error)
            }
        }

        setFormData({ ...formData, image_url: '' })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                category_id: formData.category_id || null,
                image_url: formData.image_url,
                is_featured: formData.is_featured,
                is_active: formData.is_active,
            }

            let productId = product?.id

            if (productId) {
                // Atualizar
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', productId)
                if (error) throw error
            } else {
                // Criar
                const { data, error } = await supabase
                    .from('products')
                    .insert([productData])
                    .select()
                    .single()

                if (error) throw error
                productId = data.id
            }

            // Atualizar Extras (Remove tudo e adiciona os selecionados)
            if (productId) {
                await supabase.from('product_extras').delete().eq('product_id', productId)

                if (selectedExtras.length > 0) {
                    const extrasToInsert = selectedExtras.map(groupId => ({
                        product_id: productId,
                        group_id: groupId
                    }))
                    await supabase.from('product_extras').insert(extrasToInsert)
                }
            }

            onSave()
        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar o produto.')
        } finally {
            setLoading(false)
        }
    }

    const toggleExtra = (groupId: string) => {
        if (selectedExtras.includes(groupId)) {
            setSelectedExtras(selectedExtras.filter(id => id !== groupId))
        } else {
            setSelectedExtras([...selectedExtras, groupId])
        }
    }

    const handleSmartDescription = () => {
        const title = formData.name.trim()
        const rawDescription = formData.description.trim()

        if (!title) {
            alert('Por favor, preencha o nome do produto primeiro.')
            return
        }

        // Se a descrição estiver vazia, usar um placeholder genérico
        const ingredients = rawDescription || 'ingredientes selecionados, molho especial e muito sabor'

        // Templates focados em SEO e conversão
        const templates = [
            `Experimente o nosso delicioso ${title}! 🍔 Feito com ${ingredients}, é a escolha perfeita para matar sua fome. Sabor artesanal e qualidade que você só encontra aqui no Krikas Burguer. Peça já o seu delivery! 🚀`,
            `${title}: O sabor que você estava procurando! 😋 Preparado com ${ingredients}. Uma combinação irresistível para quem ama lanches de verdade. Entregamos quentinho na sua casa. Aproveite! 🔥`,
            `Conheça o ${title}, nosso lanche especial feito com ${ingredients}. Ingredientes frescos e suculentos para uma experiência única. 🍔✨ Ideal para o seu jantar hoje. Peça agora pelo app!`,
            `Matador de fome: ${title}! 💥 Recheado com ${ingredients}. Um dos mais pedidos da casa. Sabor, qualidade e preço justo. Não fique na vontade, peça já! 🛵💨`
        ]

        // Escolher template aleatório
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)]

        // Remover pontos duplicados ou espaços extras que podem ter surgido
        const cleanDescription = randomTemplate
            .replace(/\.\./g, '.')
            .replace(/\s+/g, ' ')
            .trim()

        setFormData(prev => ({ ...prev, description: cleanDescription }))
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="Ex: X-Bacon Especial"
                        />
                    </div>

                    <div className="col-span-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Descrição</label>
                            <button
                                type="button"
                                onClick={handleSmartDescription}
                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold hover:bg-purple-200 transition-colors flex items-center gap-1"
                                title="Gera uma descrição vendedora baseada nos ingredientes digitados"
                            >
                                ✨ Melhorar com IA
                            </button>
                        </div>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="Digite os ingredientes básicos (ex: carne, salada, cheddar) e clique em Melhorar com IA..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                        <select
                            value={formData.category_id}
                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                        >
                            <option value="">Selecione uma categoria...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Seleção de Grupos de Adicionais */}
                    {extrasGroups.length > 0 && (
                        <div className="col-span-2 bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <h3 className="font-bold text-gray-800 mb-3 block">Grupos de Adicionais</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {extrasGroups.map(group => (
                                    <label key={group.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition">
                                        <input
                                            type="checkbox"
                                            checked={selectedExtras.includes(group.id)}
                                            onChange={() => toggleExtra(group.id)}
                                            className="rounded text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-gray-700">{group.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
                        <div className="space-y-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                            {uploading && (
                                <div className="text-sm text-orange-600 flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Fazendo upload...
                                </div>
                            )}
                            {formData.image_url && (
                                <div className="relative">
                                    <div className="mt-2 text-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <span className="text-xs text-gray-500 mb-2 block">Pré-visualização:</span>
                                        <img
                                            src={formData.image_url}
                                            alt="Preview"
                                            className="h-40 mx-auto object-contain rounded-lg shadow-sm"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                        title="Remover imagem"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2 flex gap-6 p-4 bg-gray-50 rounded-xl">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            />
                            <span className="text-gray-700 font-medium">Produto Ativo</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_featured}
                                onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <span className="text-gray-700 font-medium">Destaque</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-6 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Salvando...' : 'Salvar Produto'}
                    </button>
                </div>
            </form>
        </div>
    )
}
