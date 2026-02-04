'use client'

import { useEffect, useState } from 'react'

type OrderTimerProps = {
    acceptedAt: string | null | undefined
    status: string
}

export default function OrderTimer({ acceptedAt, status }: OrderTimerProps) {
    const [elapsedTime, setElapsedTime] = useState<string>('00:00')

    useEffect(() => {
        if (!acceptedAt || status === 'novo' || status === 'finalizado' || status === 'cancelado') {
            setElapsedTime('00:00')
            return
        }

        const updateTimer = () => {
            const start = new Date(acceptedAt).getTime()
            const now = Date.now()
            const diff = Math.floor((now - start) / 1000) // diferença em segundos

            const minutes = Math.floor(diff / 60)
            const seconds = diff % 60

            setElapsedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
        }

        // Atualizar imediatamente
        updateTimer()

        // Atualizar a cada segundo
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [acceptedAt, status])

    if (!acceptedAt || status === 'novo') {
        return null
    }

    // Cores baseadas no tempo
    const getColorClass = () => {
        const [minutes] = elapsedTime.split(':').map(Number)

        if (minutes < 15) return 'text-green-600 bg-green-50'
        if (minutes < 30) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    return (
        <div className={`text-xs font-bold px-2 py-1 rounded ${getColorClass()} flex items-center gap-1`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {elapsedTime}
        </div>
    )
}
