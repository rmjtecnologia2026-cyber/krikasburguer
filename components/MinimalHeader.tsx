'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import Image from 'next/image'

export default function MinimalHeader() {
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

        if (data) setSettings(data)
        setLoading(false)
    }

    if (loading) return <div className="h-[70px] bg-white animate-pulse" />

    const isOpen = settings?.is_open ?? false

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-[70px] bg-white shadow-sm px-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                    {settings?.logo_url ? (
                        <Image
                            src={settings.logo_url}
                            alt="Logo"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-orange-100 flex items-center justify-center text-lg">🍔</div>
                    )}
                </div>
                <div>
                    <h1 className="font-bold text-gray-800 text-sm leading-tight">
                        {settings?.name || 'Krikas Burguer'}
                    </h1>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-xs font-medium ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                            {isOpen ? 'Aberto' : 'Fechado'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Simple Search or Info Icon could go here */}
            <div className="text-xs text-gray-400">
                🕒 40-50 min
            </div>
        </div>
    )
}
