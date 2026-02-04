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

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            >
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

                        <div className="text-orange-500 text-sm font-semibold flex items-center gap-1">
                            Ver detalhes
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <ProductModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
