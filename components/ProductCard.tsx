'use client'

import { Product } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import { useState } from 'react'
import ProductModal from './ProductModal'

type ProductCardProps = {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url || '/placeholder-product.jpg'
        })
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-4xl">🍕</span>
                    </div>
                )}
                {product.is_featured && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ⭐ Destaque
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {product.name}
                </h3>

                {product.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        R$ {product.price.toFixed(2)}
                    </span>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                        Adicionar
                    </button>

                    <ProductModal
                        product={product}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                </div>
            </div>
        </div>
    )
}
