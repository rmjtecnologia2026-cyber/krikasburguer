'use client'

import { useState, useEffect, useRef } from 'react'
import { Category, Product } from '@/lib/supabase'
import MinimalHeader from './MinimalHeader'
import CategoryNav from './CategoryNav'
import Banner from './Banner'
import ProductCard from './ProductCard'
import Cart from './Cart'

interface StoreFrontProps {
    categories: Category[]
    featuredProducts: any[]
    productsByCategory: {
        category: Category
        products: any[]
    }[]
}

export default function StoreFront({ categories, featuredProducts, productsByCategory }: StoreFrontProps) {
    const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '')

    // Intersection Observer for Scroll Spy
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveCategory(entry.target.id.replace('category-', ''))
                    }
                })
            },
            {
                rootMargin: '-150px 0px -50% 0px', // Adjust offsets for header/nav
                threshold: 0
            }
        )

        categories.forEach((cat) => {
            const element = document.getElementById(`category-${cat.id}`)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [categories])

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 1. Topo Fixo (Anota AI Style) */}
            <MinimalHeader />

            {/* 2. Banner Promocional (Abaixo do header fixo) */}
            <div className="pt-[80px] px-4 pb-2">
                <Banner />
            </div>

            {/* 3. Navegação por Categorias (Sticky) */}
            <CategoryNav categories={categories} activeCategory={activeCategory} />

            <div className="container mx-auto px-4 py-6 space-y-10">
                {/* 4. Destaques (Se houver) */}
                {featuredProducts && featuredProducts.length > 0 && (
                    <section className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">⭐</span>
                            <h2 className="text-xl font-bold text-gray-800">Destaques</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar touch-pan-x">
                            {featuredProducts.map(product => (
                                <div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-center first:pl-0 last:pr-4">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. Lista de Produtos (Scrollspy) */}
                {productsByCategory.map(({ category, products }) => {
                    if (products.length === 0) return null

                    // Emoji especial para categorias
                    const emoji = category.slug === 'bebidas' ? '🥤' :
                        category.slug === 'pizzas' ? '🍕' :
                            category.slug === 'lanches' ? '🍔' :
                                category.slug === 'sobremesas' ? '🍰' : '🍽️'

                    return (
                        <section
                            key={category.id}
                            id={`category-${category.id}`}
                            className="scroll-mt-[140px]" // Offset for scroll
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">{emoji}</span>
                                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                                    {category.name}
                                </h2>
                            </div>

                            {/* Layout de lista vertical (Mobile friendly) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </section>
                    )
                })}

                {/* Mensagem Vazia */}
                {productsByCategory.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        Nenhum produto disponível.
                    </div>
                )}
            </div>

            {/* Carrinho Flutuante */}
            <Cart />

            {/* Footer Minimalista */}
            <footer className="py-8 text-center text-gray-400 text-xs text-center border-t border-gray-100 mt-10">
                <p>© 2026 Krikas Burguer • Delivery App</p>
            </footer>
        </div>
    )
}
