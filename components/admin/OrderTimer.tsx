'use client'

import { useState, useEffect } from 'react'
import { Order } from '@/lib/supabase'

export default function OrderTimer({ order }: { order: Order }) {
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        // Se ordem ou accepted_at não existem, não faz nada
        if (!order || !order.accepted_at) {
            setElapsed(0)
            return
        }

        const startTime = new Date(order.accepted_at).getTime()

        // Se já foi finalizado, calcular tempo total fixo e parar
        if (order.status === 'finalizado') {
            // Usando updated_at como data de finalização (aproximação)
            // Se updated_at não existir, usa Date.now() como fallback
            const endTime = order.updated_at ? new Date(order.updated_at).getTime() : new Date().getTime()
            const totalDuration = Math.max(0, Math.floor((endTime - startTime) / 1000))
            setElapsed(totalDuration)
            return // Não inicia intervalo
        }

        // Se está em andamento, atualiza a cada segundo
        const updateTimer = () => {
            const now = new Date().getTime()
            const diffInSeconds = Math.floor((now - startTime) / 1000)
            setElapsed(Math.max(0, diffInSeconds))
        }

        updateTimer() // Update imediato
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [order?.accepted_at, order?.status, order?.updated_at])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // Cores baseadas no tempo (urgência) - Só aplica se não estiver finalizado
    let colorClass = 'bg-gray-100 text-gray-600'
    if (order.status !== 'finalizado') {
        if (elapsed > 3600) colorClass = 'bg-red-100 text-red-700 animate-pulse' // > 1 hora
        else if (elapsed > 1800) colorClass = 'bg-orange-100 text-orange-700' // > 30 min
        else colorClass = 'bg-green-100 text-green-700'
    } else {
        colorClass = 'bg-blue-50 text-blue-700 border border-blue-100' // Finalizado
    }

    if (!order || !order.accepted_at) return null

    return (
        <div className={`text-xs font-mono py-1 px-2 rounded flex items-center gap-1 ${colorClass}`}>
            <span>⏱</span>
            <span className="font-bold">
                {formatTime(elapsed)}
            </span>
            {order.status === 'finalizado' && <span className="text-[10px] ml-1">(Total)</span>}
        </div>
    )
}
