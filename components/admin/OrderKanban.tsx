'use client'

import { Order } from '@/lib/supabase'
import OrderTimer from './OrderTimer'

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
        { id: 'finalizado', title: 'Finalizados', color: 'bg-green-50 border-green-200 text-green-800' },
    ]

    const getOrdersByStatus = (status: string) => orders.filter(o => o.status === status)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)] overflow-y-auto pb-4">
            {columns.map(col => (
                <div key={col.id} className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 h-fit max-h-[calc(100vh-160px)]">
                    {/* Column Header */}
                    <div className={`p-3 border-b rounded-t-xl font-bold flex justify-between items-center ${col.color}`}>
                        <span className="text-sm">{col.title}</span>
                        <span className="bg-white/50 px-2 py-0.5 rounded text-xs">
                            {getOrdersByStatus(col.id).length}
                        </span>
                    </div>

                    {/* Orders List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {getOrdersByStatus(col.id).length === 0 && (
                            <div className="text-center py-6 text-gray-400 text-xs italic">
                                Sem pedidos
                            </div>
                        )}

                        {getOrdersByStatus(col.id).map(order => (
                            <div key={order.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-1.5">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                #{order.order_number || '?'}
                                            </span>
                                            <h4 className="font-bold text-gray-800 text-sm truncate">{order.customer_name}</h4>
                                        </div>
                                        <OrderTimer order={order} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-orange-600 font-bold text-xs">R$ {order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 mb-1.5 line-clamp-1">{order.delivery_address}</p>

                                {order.observations && (
                                    <div className="bg-yellow-50 p-1.5 rounded text-[10px] text-gray-600 italic mb-1.5 line-clamp-2">
                                        "{order.observations}"
                                    </div>
                                )}

                                <div className="flex gap-1.5 mt-2 pt-2 border-t border-gray-50">
                                    {col.id === 'novo' && (
                                        <button
                                            onClick={() => onStatusUpdate(order.id, 'em_preparo')}
                                            className="flex-1 bg-green-500 text-white py-1 rounded text-[11px] font-bold hover:bg-green-600"
                                        >
                                            Aceitar
                                        </button>
                                    )}
                                    {col.id === 'em_preparo' && (
                                        <button
                                            onClick={() => onStatusUpdate(order.id, 'saiu_entrega')}
                                            className="flex-1 bg-purple-500 text-white py-1 rounded text-[11px] font-bold hover:bg-purple-600"
                                        >
                                            Despachar
                                        </button>
                                    )}
                                    {col.id === 'saiu_entrega' && (
                                        <button
                                            onClick={() => onStatusUpdate(order.id, 'finalizado')}
                                            className="flex-1 bg-gray-800 text-white py-1 rounded text-[11px] font-bold hover:bg-black"
                                        >
                                            Finalizar
                                        </button>
                                    )}

                                    <button onClick={() => onEdit(order.id)} className="p-1 text-blue-500 bg-blue-50 rounded hover:bg-blue-100 text-xs">✏️</button>
                                    <button onClick={() => onCancel(order.id)} className="p-1 text-red-500 bg-red-50 rounded hover:bg-red-100 text-xs">🗑</button>
                                </div>
                                <div className="text-[9px] text-gray-400 mt-1.5 text-right">
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
