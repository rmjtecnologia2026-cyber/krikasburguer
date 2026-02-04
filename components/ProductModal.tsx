'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/supabase'
import { supabase } from '@/lib/supabase-browser'
import { useCart } from '@/context/CartContext'

type ProductModalProps = {
    product: Product | null
    isOpen: boolean
    onClose: () => void
}

type ExtraGroup = {
    id: string
    name: string
    required: boolean
    max_options: number
    options: ExtraOption[]
}

type ExtraOption = {
    id: string
    name: string
    price: number
    group_id: string
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const { addItem } = useCart()
    const [loading, setLoading] = useState(false)
    const [extrasGroups, setExtrasGroups] = useState<ExtraGroup[]>([])
    const [selectedExtras, setSelectedExtras] = useState<string[]>([])
    const [observation, setObservation] = useState('')

    // Reset state when product changes
    useEffect(() => {
        if (product && isOpen) {
            fetchExtras(product.id)
            setSelectedExtras([])
            setObservation('')
        }
    }, [product, isOpen])

    const fetchExtras = async (productId: string) => {
        setLoading(true)
        try {
            // 1. Buscar grupos vinculados ao produto
            const { data: productExtras, error: peError } = await supabase
                .from('product_extras')
                .select('group_id')
                .eq('product_id', productId)

            if (peError) throw peError
            if (!productExtras || productExtras.length === 0) {
                setExtrasGroups([])
                return
            }

            const groupIds = productExtras.map(pe => pe.group_id)

            // 2. Buscar detalhes dos grupos e suas opções
            const { data: groups, error: groupsError } = await supabase
                .from('extras_groups')
                .select(`
                    *,
                    options:extras_options(*)
                `)
                .in('id', groupIds)
                .order('name')

            if (groupsError) throw groupsError

            setExtrasGroups(groups || [])
        } catch (error) {
            console.error('Erro ao buscar extras:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleExtra = (group: ExtraGroup, optionId: string) => {
        setSelectedExtras(current => {
            // Verificar quantos deste grupo já estão selecionados
            const extrasInGroup = current.filter(id =>
                group.options.some(opt => opt.id === id)
            )
            const isSelected = current.includes(optionId)

            if (isSelected) {
                return current.filter(id => id !== optionId)
            } else {
                // Se max_options for 1, substitui (comportamento radio)
                if (group.max_options === 1 && extrasInGroup.length >= 1) {
                    // Remove o existente do grupo e adiciona o novo
                    const others = current.filter(id => !extrasInGroup.includes(id))
                    return [...others, optionId]
                }
                // Se atingiu o limite, não adiciona
                if (group.max_options > 1 && extrasInGroup.length >= group.max_options) {
                    return current
                }
                return [...current, optionId]
            }
        })
    }

    const calculateTotal = () => {
        if (!product) return 0
        const extrasTotal = extrasGroups.flatMap(g => g.options)
            .filter(opt => selectedExtras.includes(opt.id))
            .reduce((sum, opt) => sum + opt.price, 0)

        return product.price + extrasTotal
    }

    const handleAddToCart = () => {
        if (!product) return

        // Validar obrigatórios
        const missingRequired = extrasGroups.filter(g => g.required).find(g => {
            const selectedInGroup = selectedExtras.filter(id => g.options.some(opt => opt.id === id))
            return selectedInGroup.length === 0
        })

        if (missingRequired) {
            alert(`Por favor, selecione uma opção para: ${missingRequired.name}`)
            return
        }

        const selectedOptions = extrasGroups.flatMap(g => g.options)
            .filter(opt => selectedExtras.includes(opt.id))
            .map(opt => ({
                id: opt.id,
                name: opt.name,
                price: opt.price,
                group_name: extrasGroups.find(g => g.id === opt.group_id)?.name || ''
            }))

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url || '/placeholder-product.jpg',
            extras: selectedOptions
        })

        onClose()
    }

    if (!isOpen || !product) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-fade-in shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Image */}
                <div className="relative h-48 bg-gray-100 flex-shrink-0">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🍕</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h2 className="text-2xl font-bold text-white shadow-sm">{product.name}</h2>
                        <p className="text-white/90 text-sm line-clamp-1">{product.description}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Preço Base */}
                    <div className="flex justify-between items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <span className="font-semibold">Preço Base</span>
                        <span className="font-bold">R$ {product.price.toFixed(2)}</span>
                    </div>

                    {/* Grupos de Extras */}
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        extrasGroups.map(group => (
                            <div key={group.id} className="border border-gray-100 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{group.name}</h3>
                                        <p className="text-xs text-gray-500">
                                            {group.required ? 'Obrigatório' : 'Opcional'} •
                                            {group.max_options === 1 ? ' Escolha 1' : ` Escolha até ${group.max_options}`}
                                        </p>
                                    </div>
                                    {group.required && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">Obrigatório</span>}
                                </div>

                                <div className="space-y-2">
                                    {group.options.map(option => {
                                        const isSelected = selectedExtras.includes(option.id)
                                        return (
                                            <label
                                                key={option.id}
                                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                        ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                                                        }`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className="font-medium text-gray-700">{option.name}</span>
                                                </div>
                                                <span className="font-semibold text-orange-600">
                                                    + R$ {option.price.toFixed(2)}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={isSelected}
                                                    onChange={() => toggleExtra(group, option.id)}
                                                />
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Observação */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Observações do Item</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-xl p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
                            rows={2}
                            placeholder="Ex: Sem cebola, bem passado..."
                            value={observation}
                            onChange={e => setObservation(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-100 p-4 bg-gray-50 flex gap-4 items-center justify-between">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total do Item</p>
                        <p className="text-2xl font-bold text-orange-600">
                            R$ {calculateTotal().toFixed(2)}
                        </p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg text-lg flex-1 transform transition-transform active:scale-95"
                    >
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    )
}
