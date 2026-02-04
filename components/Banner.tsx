'use client'

import { useEffect, useState } from 'react'
import { supabase, Banner as BannerType } from '@/lib/supabase-browser'
import Image from 'next/image'

export default function Banner() {
    const [banners, setBanners] = useState<BannerType[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        fetchBanners()
    }, [])

    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((current) => (current + 1) % banners.length)
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [banners.length])

    const fetchBanners = async () => {
        const { data } = await supabase
            .from('banners')
            .select('*')
            .eq('is_active', true)
            .order('order', { ascending: true })

        if (data) setBanners(data)
    }

    if (banners.length === 0) return null

    const currentBanner = banners[currentIndex]

    return (
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-3xl shadow-2xl mb-12 group">
            <Image
                src={currentBanner.image_url}
                alt={currentBanner.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <h2 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg transform translate-y-0 transition-transform duration-500">
                    {currentBanner.title}
                </h2>
                {currentBanner.description && (
                    <p className="text-lg md:text-xl text-gray-200 mb-6 drop-shadow-lg max-w-2xl line-clamp-2">
                        {currentBanner.description}
                    </p>
                )}
            </div>

            {banners.length > 1 && (
                <div className="absolute bottom-6 right-6 flex gap-2">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-orange-500 w-8'
                                : 'bg-white/50 w-2 hover:bg-white'
                                }`}
                            aria-label={`Ir para banner ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
