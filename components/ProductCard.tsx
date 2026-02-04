'use client'

import { Product } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import { useState } from 'react'
import ProductModal from './ProductModal'

type ProductCardProps = {
    product: Product
    variant?: 'responsive' | 'vertical' // responsive = horizontal mobile / vertical desktop
}

export default function ProductCard({ product, variant = 'responsive' }: ProductCardProps) {
    const { addItem } = useCart()
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Classes dinâmicas baseadas na variante
    // Se for 'responsive': flex-row no mobile, flex-col no desktop.
    // Se for 'vertical' (destaques): sempre flex-col.
    const containerClasses = variant === 'responsive'
        ? "flex flex-row md:flex-col"
        : "flex flex-col"

    // Imagem
    const imageContainerClasses = variant === 'responsive'
        ? "relative w-32 min-w-[128px] h-32 md:w-full md:h-56 overflow-hidden bg-gray-100 md:bg-gradient-to-br md:from-orange-100 md:to-red-100"
        : "relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-orange-100 to-red-100"

    // Padding
    const contentClasses = variant === 'responsive'
        ? "p-3 flex-1 flex flex-col justify-between md:p-5"
        : "p-4 sm:p-5 flex-1 flex flex-col justify-between"

    // Preço e Botão
    const footerClasses = variant === 'responsive'
        ? "flex items-end justify-between mt-2 md:items-center md:mt-4"
        : "flex items-center justify-between mt-4"

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className={`bg-white rounded-xl md:rounded-2xl shadow-sm md:shadow-lg overflow-hidden hover:shadow-md md:hover:shadow-xl transition-all duration-300 md:hover:-translate-y-1 group cursor-pointer border border-gray-100 md:border-transparent h-full ${containerClasses}`}
            >
                {/* Imagem */}
                <div className={imageContainerClasses}>
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="(max-width: 768px) 128px, 100vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-3xl md:text-4xl">🍔</span>
                        </div>
                    )}
                    {product.is_featured && (
                        <div className={`absolute shadow-md bg-yellow-400 text-white font-bold rounded-full z-10 
                            ${variant === 'responsive' ? 'top-1 left-1 text-[8px] px-2 py-0.5 md:top-3 md:right-3 md:left-auto md:text-xs md:px-3 md:py-1' : 'top-3 right-3 text-xs px-3 py-1'}
                        `}>
                            ⭐
                        </div>
                    )}
                </div>

                {/* Conteúdo */}
                <div className={contentClasses}>
                    <div>
                        <h3 className={`font-bold text-gray-800 leading-tight mb-1 ${variant === 'responsive' ? 'text-sm md:text-xl line-clamp-2 md:line-clamp-1' : 'text-lg line-clamp-1'}`}>
                            {product.name}
                        </h3>

                        {product.description && (
                            <p className="text-gray-500 text-xs md:text-sm line-clamp-2 text-ellipsis overflow-hidden">
                                {product.description}
                            </p>
                        )}
                    </div>

                    <div className={footerClasses}>
                        <div className="flex flex-col">
                            {/* Se tiver preço promocional poderia vir aqui */}
                            <span className="text-sm md:text-xl font-bold text-gray-800">
                                R$ {product.price.toFixed(2)}
                            </span>
                        </div>

                        <div className="text-orange-600 bg-orange-50 p-1.5 rounded-lg md:bg-transparent md:p-0">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
