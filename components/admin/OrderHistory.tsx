'use client'

import { Order } from '@/lib/supabase'
import { useMemo, useState } from 'react'

type OrderHistoryProps = {
    orders: Order[]
}

type GroupedOrders = {
    [date: string]: {
        orders: Order[]
        total: number
        count: number
    }
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
    const [expandedDates, setExpandedDates] = useState<string[]>([])

    // Filtrar apenas pedidos finalizados e cancelados
    const completedOrders = orders.filter(o => o.status === 'finalizado' || o.status === 'cancelado')

    // Agrupar pedidos por data
    const groupedByDate = useMemo(() => {
        const grouped: GroupedOrders = {}

        completedOrders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('pt-BR')

            if (!grouped[date]) {
                grouped[date] = {
                    orders: [],
                    total: 0,
                    count: 0
                }
            }

            grouped[date].orders.push(order)
            // Só somar no total se foi finalizado (não cancelado)
            if (order.status === 'finalizado') {
                grouped[date].total += order.total
            }
            grouped[date].count++
        })

        return grouped
    }, [completedOrders])

    // Ordenar datas (mais recente primeiro)
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
        const dateA = new Date(a.split('/').reverse().join('-'))
        const dateB = new Date(b.split('/').reverse().join('-'))
        return dateB.getTime() - dateA.getTime()
    })

    const toggleDate = (date: string) => {
        if (expandedDates.includes(date)) {
            setExpandedDates(expandedDates.filter(d => d !== date))
        } else {
            setExpandedDates([...expandedDates, date])
        }
    }

    if (completedOrders.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold mb-4">Histórico de Pedidos</h3>
                <div className="text-center py-10 text-gray-400">
                    <p>Nenhum pedido finalizado ainda</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-xl mb-6">Histórico de Pedidos</h3>

            <div className="space-y-3">
                {sortedDates.map(date => {
                    const dayData = groupedByDate[date]
                    const finalizados = dayData.orders.filter(o => o.status === 'finalizado').length
                    const cancelados = dayData.orders.filter(o => o.status === 'cancelado').length
                    const isExpanded = expandedDates.includes(date)

                    return (
                        <div key={date} className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Header do acordeon - clicável */}
                            <button
                                onClick={() => toggleDate(date)}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="text-left flex items-center gap-3">
                                        <span className={`transform transition-transform text-xl ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                        <div>
                                            <h4 className="font-bold text-lg">{date}</h4>
                                            <p className="text-sm text-orange-100">
                                                {dayData.count} pedido{dayData.count !== 1 ? 's' : ''}
                                                {finalizados > 0 && ` • ${finalizados} finalizado${finalizados !== 1 ? 's' : ''}`}
                                                {cancelados > 0 && ` • ${cancelados} cancelado${cancelados !== 1 ? 's' : ''}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-orange-100">Total do dia</p>
                                        <p className="text-2xl font-bold">R$ {dayData.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </button>

                            {/* Conteúdo expansível - só mostra se isExpanded */}
                            {isExpanded && (
                                <div className="divide-y divide-gray-100 bg-white">
                                    {dayData.orders.map(order => (
                                        <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-bold text-gray-800">{order.customer_name}</p>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'finalizado'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {order.status === 'finalizado' ? '✓ Finalizado' : '✗ Cancelado'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                    {order.status === 'cancelado' && order.cancellation_reason && (
                                                        <p className="text-xs text-red-600 mt-1 italic">
                                                            Motivo: {order.cancellation_reason}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${order.status === 'finalizado'
                                                            ? 'text-green-600'
                                                            : 'text-gray-400 line-through'
                                                        }`}>
                                                        R$ {order.total.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
