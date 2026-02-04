'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import Image from 'next/image'

export default function Banner() {
    const [storeSettings, setStoreSettings] = useState<any>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('store_settings')
            .select('*')
            .single()

        if (data) setStoreSettings(data)
    }

    if (!storeSettings) return null

    return (
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-3xl shadow-2xl mb-12">
            {/* Background Image (pode ser o logo desfocado ou uma imagem padrão) */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600">
                {storeSettings.logo_url && (
                    <Image
                        src={storeSettings.logo_url}
                        alt="Background"
                        fill
                        className="object-cover opacity-20 blur-sm"
                    />
                )}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">

                {/* Logo Principal */}
                {storeSettings.logo_url ? (
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4">
                        <Image
                            src={storeSettings.logo_url}
                            alt={storeSettings.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center mb-4 text-orange-600 font-bold text-4xl shadow-xl">
                        {storeSettings.name?.charAt(0) || 'K'}
                    </div>
                )}

                <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-md">
                    {storeSettings.name}
                </h1>

                <p className="text-lg md:text-xl opacity-90 mb-4 max-w-lg">
                    📍 {storeSettings.address}
                </p>

                {/* Status Aberto/Fechado */}
                <div className={`px-6 py-2 rounded-full font-bold text-lg shadow-lg flex items-center gap-2 ${storeSettings.is_open
                    ? 'bg-green-500 text-white animate-pulse'
                    : 'bg-red-500 text-white'
                    }`}>
                    <div className={`w-3 h-3 rounded-full bg-white ${storeSettings.is_open ? 'animate-ping' : ''}`} />
                    {storeSettings.is_open ? 'ESTAMOS ABERTOS' : 'FECHADO AGORA'}
                </div>
            </div>
        </div>
    )
}
