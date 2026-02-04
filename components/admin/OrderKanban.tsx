'use client'

import { Order } from '@/lib/supabase'

interface OrderKanbanProps {
    orders: Order[]
    onStatusUpdate: (id: string, status: string) => void
    onEdit: (id: string) => void
    onCancel: (id: string) => void
}

export default function OrderKanban({ orders, onStatusUpdate, onEdit, onCancel }: OrderKanbanProps) {
    const columns = [
        { id: 'novo', title: 'Novos', color: 'bg-blue-50 border-blue-200 text-blue-800' },
        { id: 'em_preparo', title: 'Em Preparo', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
        { id: 'saiu_entrega', title: 'Saiu p/ Entrega', color: 'bg-purple-50 border-purple-200 text-purple-800' },
    ]

    const getOrdersByStatus = (status: string) => orders.filter(o => o.status === status)

    return (
        <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] overflow-x-auto pb-4">
            {columns.map(col => (
                <div key={col.id} className="flex-1 min-w-[320px] flex flex-col bg-gray-50 rounded-2xl border border-gray-200 h-full">
                    {/* Column Header */}
                    <div className={`p-4 border-b rounded-t-2xl font-bold flex justify-between items-center ${col.color}`}>
                        <span>{col.title}</span>
                        <span className="bg-white/50 px-2 py-0.5 rounded text-sm">
                            {getOrdersByStatus(col.id).length}
                        </span>
                    </div>

                    {/* Orders List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {getOrdersByStatus(col.id).length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm italic">
                                Sem pedidos aqui
                            </div>
                        )}

                        {getOrdersByStatus(col.id).map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800">{order.customer_name}</h4>
                                    <span className="text-orange-600 font-bold text-sm">R$ {order.total.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{order.delivery_address}</p>

                                {order.observations && (
                                    <div className="bg-yellow-50 p-2 rounded text-xs text-gray-600 italic mb-2">
                                        "{order.observations}"
                                    </div>
                                )}

                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                                    {col.id === 'novo' && (
                                        <button
                                            onClick={() => onStatusUpdate(order.id, 'em_preparo')}
                                            className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-green-600"
                                        >
                                            Aceitar
                                        </button>
                                    )}
                                    {col.id === 'em_preparo' && (
                                        <button
                                            onClick={() => onStatusUpdate(order.id, 'saiu_entrega')}
                                            className="flex-1 bg-purple-500 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-purple-600"
                                        >
                                            Despachar
                                        </button>
                                    )}
                                    {col.id === 'saiu_entrega' && (
                                        <button
                                            onClick={() => onStatusUpdate(order.id, 'finalizado')}
                                            className="flex-1 bg-gray-800 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-black"
                                        >
                                            Finalizar
                                        </button>
                                    )}

                                    <button onClick={() => onEdit(order.id)} className="p-1.5 text-blue-500 bg-blue-50 rounded hover:bg-blue-100"></button>
                                    <button onClick={() => onCancel(order.id)} className="p-1.5 text-red-500 bg-red-50 rounded hover:bg-red-100">🗑</button>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-2 text-right">
                                    {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
