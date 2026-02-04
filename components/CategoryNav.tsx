'use client'

import { useEffect, useState, useRef } from 'react'
import { Category } from '@/lib/supabase'

interface CategoryNavProps {
    categories: Category[]
    activeCategory: string
}

export default function CategoryNav({ categories, activeCategory }: CategoryNavProps) {
    const navRef = useRef<HTMLDivElement>(null)

    const scrollToCategory = (categoryId: string) => {
        const element = document.getElementById(`category-${categoryId}`)
        if (element) {
            const headerOffset = 140 // Adjust based on header + nav height
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
        }
    }

    // Auto scroll the nav to keep active item in view
    useEffect(() => {
        if (navRef.current) {
            const activeEl = navRef.current.querySelector<HTMLElement>(`[data-active="true"]`)
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }
        }
    }, [activeCategory])

    return (
        <div className="sticky top-[70px] z-40 bg-white border-b border-gray-100 shadow-sm transition-all">
            <div
                ref={navRef}
                className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-3 w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map(category => (
                    <button
                        key={category.id}
                        data-active={activeCategory === category.id}
                        onClick={() => scrollToCategory(category.id)}
                        className={`
                            whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0
                            ${activeCategory === category.id
                                ? 'bg-orange-600 text-white shadow-md scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                        `}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    )
}
