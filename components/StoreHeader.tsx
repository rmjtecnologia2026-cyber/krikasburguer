'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import Image from 'next/image'

export default function StoreHeader() {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('store_settings')
            .select('*')
            .single()

        if (data) {
            setSettings(data)
        }
        setLoading(false)
    }

    if (loading || !settings) return null

    return (
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in border border-gray-100">
            <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-orange-100 shadow-md overflow-hidden bg-white">
                    {settings.logo_url ? (
                        <Image
                            src={settings.logo_url}
                            alt={settings.name || 'Logo'}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-50 text-4xl">
                            🍔
                        </div>
                    )}
                </div>

                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">
                        {settings.name || 'Krikas Burguer'}
                    </h1>
                    {settings.address && (
                        <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-1">
                            📍 {settings.address}
                        </p>
                    )}
                    {settings.phone && (
                        <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-1 mt-1">
                            📞 {settings.phone}
                        </p>
                    )}
                </div>
            </div>

            <div className={`px-6 py-2 rounded-full font-bold shadow-sm transition-transform hover:scale-105 ${settings.is_open
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${settings.is_open ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                    {settings.is_open ? 'LOJA ABERTA' : 'FECHADO AGORA'}
                </div>
            </div>
        </div>
    )
}
