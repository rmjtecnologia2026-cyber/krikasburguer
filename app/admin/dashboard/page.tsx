'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Order } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
// ... (imports remain)
import OrderEditor from '@/components/admin/OrderEditor'

export default function AdminDashboard() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'products' | 'categories' | 'banners' | 'settings' | 'extras'>('orders')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [newOrderAlert, setNewOrderAlert] = useState(false)
    const [editingOrder, setEditingOrder] = useState<string | null>(null)
    const [cancelingOrder, setCancelingOrder] = useState<string | null>(null)
    const [cancelReason, setCancelReason] = useState('')

    // ... (useEffect and basic functions remain)

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push('/admin/login')
        }
    }

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) {
            setOrders(data)
            setLoading(false)
        }
    }

    const setupRealtimeOrders = () => {
        // ... (existing code)
        // Ensure to keep this logic correct as shown in 'view_file' output
        const channel = supabase
            .channel('orders-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    setOrders(current => [payload.new as Order, ...current])
                    setNewOrderAlert(true)
                    playNotificationSound()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    const playNotificationSound = () => {
        const audio = new Audio('/sounds/notification.mp3')
        audio.play().catch(e => console.log('Could not play sound:', e))
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (!error) {
            setOrders(current =>
                current.map(order =>
                    order.id === orderId ? { ...order, status: newStatus as any } : order
                )
            )
        }
    }

    const handleCancelOrder = async () => {
        if (!cancelingOrder || !cancelReason.trim()) return

        const { error } = await supabase
            .from('orders')
            .update({
                status: 'cancelado',
                cancellation_reason: cancelReason
            })
            .eq('id', cancelingOrder)

        if (!error) {
            setOrders(current =>
                current.map(order =>
                    order.id === cancelingOrder ? { ...order, status: 'cancelado' as any, cancellation_reason: cancelReason } : order
                )
            )
            setCancelingOrder(null)
            setCancelReason('')
        } else {
            alert('Erro ao cancelar pedido')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'novo': return 'bg-blue-100 text-blue-800'
            case 'em_preparo': return 'bg-yellow-100 text-yellow-800'
            case 'saiu_entrega': return 'bg-purple-100 text-purple-800'
            case 'finalizado': return 'bg-green-100 text-green-800'
            case 'cancelado': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'novo': return 'Novo'
            case 'em_preparo': return 'Em Preparo'
            case 'saiu_entrega': return 'Saiu para Entrega'
            case 'finalizado': return 'Finalizado'
            case 'cancelado': return 'Cancelado'
            default: return status
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Modal Editor de Pedido */}
            {editingOrder && (
                <OrderEditor
                    orderId={editingOrder}
                    onClose={() => setEditingOrder(null)}
                    onUpdate={fetchOrders}
                />
            )}

            {/* Modal de Cancelamento */}
            {cancelingOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Cancelar Pedido</h2>
                        <p className="text-gray-600 mb-4">Por favor, informe o motivo do cancelamento:</p>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                            rows={3}
                            placeholder="Ex: Falta de ingredientes, cliente desistiu..."
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancelingOrder(null)}
                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                            >
                                Confirmar Cancelamento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Novo Pedido (Popup Automático) */}
            {newOrderAlert && orders.length > 0 && orders[0].status === 'novo' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    {/* ... (existing content for new order alert) ... */}
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 transform animate-bounce-short relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-600" />

                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <span className="text-4xl">🔔</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Novo Pedido Chegou!</h2>
                            <p className="text-gray-500 mt-2">Um cliente acabou de realizar um pedido.</p>
                        </div>

                        {/* Detalhes do Pedido Recente */}
                        <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg">{orders[0].customer_name}</h3>
                                <span className="text-orange-600 font-bold text-xl">R$ {orders[0].total.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">📍 {orders[0].delivery_address}</p>
                            <div className="mt-3 text-sm bg-white p-2 rounded border border-gray-200">
                                <p><strong>Pagamento:</strong> {orders[0].payment_method === 'card' ? 'Cartão' : orders[0].payment_method === 'pix' ? 'Pix' : 'Dinheiro'}</p>
                                {orders[0].change_for && <p className="text-orange-600">Troco para: {orders[0].change_for}</p>}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setNewOrderAlert(false)}
                                className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => {
                                    updateOrderStatus(orders[0].id, 'em_preparo')
                                    setNewOrderAlert(false)
                                }}
                                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition transform"
                            >
                                ACEITAR PEDIDO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl">
                {/* ... (existing header) ... */}
                <div className="container mx-auto px-4 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">🔐 Admin Dashboard</h1>
                        <p className="text-orange-100">Gerenciamento do Sistema</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={playNotificationSound}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                            title="Testar Som de Notificação"
                        >
                            🔊
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full font-semibold transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex flex-wrap gap-2">
                    {/* ... (existing tabs logic) ... */}
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'orders'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        📦 Pedidos Ativos
                        {orders.filter(o => o.status !== 'finalizado' && o.status !== 'cancelado').length > 0 && (
                            <span className="ml-2 bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                {orders.filter(o => o.status !== 'finalizado' && o.status !== 'cancelado').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'history'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        📜 Histórico
                    </button>
                    <button onClick={() => setActiveTab('products')} className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>🍕 Produtos</button>
                    <button onClick={() => setActiveTab('extras')} className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'extras' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>➕ Adicionais</button>
                    <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'categories' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>📁 Categorias</button>
                    <button onClick={() => setActiveTab('banners')} className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'banners' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>🎨 Banners</button>
                    <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>⚙️ Configurações</button>
                </div>

                {/* Content */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pedidos em Andamento</h2>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                            </div>
                        ) : orders.filter(o => o.status !== 'finalizado' && o.status !== 'cancelado').length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <p className="text-gray-500 text-lg">Nenhum pedido ativo no momento</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {orders.filter(o => o.status !== 'finalizado' && o.status !== 'cancelado').map(order => (
                                    <div key={order.id} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow border-l-4 border-orange-500 relative flex flex-col justify-between min-h-[300px]">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={order.customer_name}>{order.customer_name}</h3>
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons: Edit and Cancel */}
                                            <div className="flex justify-end gap-2 mb-3">
                                                <button
                                                    onClick={() => setEditingOrder(order.id)}
                                                    className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                                    title="Alterar Pedido"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCancelingOrder(order.id)
                                                        setCancelReason('')
                                                    }}
                                                    className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                                    title="Cancelar/Excluir Pedido"
                                                >
                                                    🗑
                                                </button>
                                            </div>

                                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                                                <p>📱 {order.customer_phone}</p>
                                                <p className="line-clamp-2" title={order.delivery_address}>📍 {order.delivery_address}</p>
                                                <div className="bg-gray-50 p-2 rounded text-xs">
                                                    <p>💰 Pagamento: <strong>{order.payment_method === 'card' ? 'Cartão' : order.payment_method === 'pix' ? 'Pix' : 'Dinheiro'}</strong></p>
                                                    {order.change_for && <p className="text-orange-600">💵 Troco para: {order.change_for}</p>}
                                                </div>
                                                {order.observations && (
                                                    <p className="text-gray-500 text-xs italic mt-1 bg-yellow-50 p-1 rounded">
                                                        " {order.observations} "
                                                    </p>
                                                )}
                                            </div>

                                            <p className="text-2xl font-bold text-orange-600 mb-2">
                                                R$ {order.total.toFixed(2)}
                                            </p>
                                            <p className="text-gray-400 text-xs mb-4">
                                                {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} •
                                                {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mt-auto">
                                            <button onClick={() => updateOrderStatus(order.id, 'novo')} className={`flex-1 py-1 rounded-md text-xs font-semibold ${order.status === 'novo' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>Novo</button>
                                            <button onClick={() => updateOrderStatus(order.id, 'em_preparo')} className={`flex-1 py-1 rounded-md text-xs font-semibold ${order.status === 'em_preparo' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}>Preparo</button>
                                            <button onClick={() => updateOrderStatus(order.id, 'saiu_entrega')} className={`flex-1 py-1 rounded-md text-xs font-semibold ${order.status === 'saiu_entrega' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>Entrega</button>
                                            <button onClick={() => updateOrderStatus(order.id, 'finalizado')} className="w-full mt-1 py-2 rounded-md font-bold text-sm bg-green-100 text-green-700 hover:bg-green-500 hover:text-white transition-colors">✔ Finalizar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Pedidos</h2>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                            </div>
                        ) : orders.filter(o => o.status === 'finalizado' || o.status === 'cancelado').length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <p className="text-gray-500 text-lg">Nenhum pedido no histórico</p>
                            </div>
                        ) : (
                            orders.filter(o => o.status === 'finalizado' || o.status === 'cancelado').map(order => (
                                <div key={order.id} className="bg-white rounded-2xl shadow p-6 opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-700">{order.customer_name}</h3>
                                            <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                                            {/* Show cancellation reason if exists */}
                                            {order.status === 'cancelado' && order.cancellation_reason && (
                                                <div className="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                                                    <strong>Motivo do Cancelamento:</strong> {order.cancellation_reason}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-600">R$ {order.total.toFixed(2)}</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'novo')}
                                            className="text-sm text-gray-400 hover:text-orange-500 underline"
                                        >
                                            Reabrir Pedido
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Rest of the tabs... */}
                {activeTab === 'products' && (
                    <ProductsManager />
                )}

                {activeTab === 'categories' && (
                    <CategoriesManager />
                )}

                {activeTab === 'banners' && (
                    <BannersManager />
                )}

                {activeTab === 'settings' && (
                    <StoreSettings />
                )}

                {activeTab === 'extras' && (
                    <ExtrasManager />
                )}
            </div>
        </div>
    )
}

{
    activeTab === 'products' && (
        <ProductsManager />
    )
}

{
    activeTab === 'categories' && (
        <CategoriesManager />
    )
}

{
    activeTab === 'banners' && (
        <BannersManager />
    )
}

{
    activeTab === 'settings' && (
        <StoreSettings />
    )
}

{
    activeTab === 'extras' && (
        <ExtrasManager />
    )
}
            </div >
        </div >
    )
}
