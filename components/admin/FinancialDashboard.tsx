'use client'

import { Order } from '@/lib/supabase'
import { useMemo } from 'react'

type FinancialDashboardProps = {
    orders: Order[]
}

export default function FinancialDashboard({ orders }: FinancialDashboardProps) {
    const finalizados = orders.filter(o => o.status === 'finalizado')

    // Calcular estatísticas
    const stats = useMemo(() => {
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        const estaSemana = new Date()
        estaSemana.setDate(estaSemana.getDate() - 7)
        estaSemana.setHours(0, 0, 0, 0)

        const esteMes = new Date()
        esteMes.setDate(1)
        esteMes.setHours(0, 0, 0, 0)

        let totalHoje = 0
        let pedidosHoje = 0
        let totalSemana = 0
        let pedidosSemana = 0
        let totalMes = 0
        let pedidosMes = 0
        let totalGeral = 0

        finalizados.forEach(order => {
            const orderDate = new Date(order.created_at)
            totalGeral += order.total

            if (orderDate >= hoje) {
                totalHoje += order.total
                pedidosHoje++
            }

            if (orderDate >= estaSemana) {
                totalSemana += order.total
                pedidosSemana++
            }

            if (orderDate >= esteMes) {
                totalMes += order.total
                pedidosMes++
            }
        })

        return {
            hoje: { total: totalHoje, pedidos: pedidosHoje },
            semana: { total: totalSemana, pedidos: pedidosSemana },
            mes: { total: totalMes, pedidos: pedidosMes },
            geral: { total: totalGeral, pedidos: finalizados.length }
        }
    }, [finalizados])

    // Calcular ticket médio
    const ticketMedio = stats.geral.pedidos > 0 ? stats.geral.total / stats.geral.pedidos : 0

    return (
        <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Hoje */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">Hoje</h3>
                        <span className="text-2xl">📅</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">R$ {stats.hoje.total.toFixed(2)}</p>
                    <p className="text-sm opacity-80">{stats.hoje.pedidos} pedido{stats.hoje.pedidos !== 1 ? 's' : ''}</p>
                </div>

                {/* Esta Semana */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">Esta Semana</h3>
                        <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">R$ {stats.semana.total.toFixed(2)}</p>
                    <p className="text-sm opacity-80">{stats.semana.pedidos} pedido{stats.semana.pedidos !== 1 ? 's' : ''}</p>
                </div>

                {/* Este Mês */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">Este Mês</h3>
                        <span className="text-2xl">📈</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">R$ {stats.mes.total.toFixed(2)}</p>
                    <p className="text-sm opacity-80">{stats.mes.pedidos} pedido{stats.mes.pedidos !== 1 ? 's' : ''}</p>
                </div>

                {/* Total Geral */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">Total Geral</h3>
                        <span className="text-2xl">💰</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">R$ {stats.geral.total.toFixed(2)}</p>
                    <p className="text-sm opacity-80">{stats.geral.pedidos} pedido{stats.geral.pedidos !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ticket Médio */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl">
                            🎯
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Ticket Médio</h3>
                            <p className="text-sm text-gray-500">Valor médio por pedido</p>
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-gray-800">R$ {ticketMedio.toFixed(2)}</p>
                </div>

                {/* Status dos Pedidos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
                            📦
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Status dos Pedidos</h3>
                            <p className="text-sm text-gray-500">Distribuição atual</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Novos</span>
                            <span className="font-bold text-blue-600">{orders.filter(o => o.status === 'novo').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Em Preparo</span>
                            <span className="font-bold text-yellow-600">{orders.filter(o => o.status === 'em_preparo').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Saiu p/ Entrega</span>
                            <span className="font-bold text-orange-600">{orders.filter(o => o.status === 'saiu_entrega').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Finalizados</span>
                            <span className="font-bold text-green-600">{orders.filter(o => o.status === 'finalizado').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Cancelados</span>
                            <span className="font-bold text-red-600">{orders.filter(o => o.status === 'cancelado').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Últimos Pedidos Finalizados */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-xl mb-4">Últimos Pedidos Finalizados</h3>
                <div className="space-y-3">
                    {finalizados.slice(0, 10).map(order => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div>
                                <p className="font-semibold text-gray-800">{order.customer_name}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleString('pt-BR')}
                                </p>
                            </div>
                            <p className="font-bold text-green-600">R$ {order.total.toFixed(2)}</p>
                        </div>
                    ))}
                    {finalizados.length === 0 && (
                        <p className="text-center text-gray-400 py-8">Nenhum pedido finalizado ainda</p>
                    )}
                </div>
            </div>
        </div>
    )
}
