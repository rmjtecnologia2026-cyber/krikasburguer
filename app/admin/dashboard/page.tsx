'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Order } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
// ... (imports remain)
import OrderEditor from '@/components/admin/OrderEditor'

// ... imports
import AdminSidebar from '@/components/admin/AdminSidebar'
import OrderKanban from '@/components/admin/OrderKanban'

export default function AdminDashboard() {
    const router = useRouter()
    // Default to 'orders' or 'dashboard'
    const [activeTab, setActiveTab] = useState('orders')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [newOrderAlert, setNewOrderAlert] = useState(false)
    const [editingOrder, setEditingOrder] = useState<string | null>(null)
    const [cancelingOrder, setCancelingOrder] = useState<string | null>(null)
    const [cancelReason, setCancelReason] = useState('')

    useEffect(() => {
        checkAuth()
        fetchOrders()
        setupRealtimeOrders()
    }, [])

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

    // Reuse existing handleCancelOrder
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
            // Update local state
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

    // Status helpers not strictly needed for Kanban but good to keep if valid

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 1. Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
            />

            {/* 2. Main Content Area */}
            <main className="flex-1 p-4 md:p-8 h-screen overflow-hidden flex flex-col">

                {/* Modals remain mostly the same, ensuring they are above everything */}
                {editingOrder && (
                    <OrderEditor
                        orderId={editingOrder}
                        onClose={() => setEditingOrder(null)}
                        onUpdate={fetchOrders}
                    />
                )}
                {/* Cancel Modal */}
                {cancelingOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Cancelar Pedido</h2>
                            <textarea
                                className="w-full border p-3 rounded-lg mb-4"
                                placeholder="Motivo..."
                                value={cancelReason}
                                onChange={e => setCancelReason(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setCancelingOrder(null)} className="flex-1 py-2 bg-gray-100 rounded-lg">Voltar</button>
                                <button onClick={handleCancelOrder} className="flex-1 py-2 bg-red-600 text-white rounded-lg">Confirmar</button>
                            </div>
                        </div>
                    </div>
                )}
                {/* New Order Alert */}
                {newOrderAlert && orders.length > 0 && orders[0].status === 'novo' && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
                            <h2 className="text-3xl font-bold text-center mb-4">🔔 Novo Pedido!</h2>
                            <div className="flex gap-4">
                                <button onClick={() => setNewOrderAlert(false)} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold">Fechar</button>
                                <button onClick={() => { updateOrderStatus(orders[0].id, 'em_preparo'); setNewOrderAlert(false) }} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold">ACEITAR</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Switcher */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Header Title for Section */}
                    <header className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 capitalize">
                                {activeTab === 'orders' ? 'Gestor de Pedidos' : activeTab}
                            </h2>
                            <p className="text-gray-500 text-sm">Gerencie seu delivery por aqui.</p>
                        </div>
                        {/* Notification Button Test */}
                        <button
                            onClick={playNotificationSound}
                            className="bg-white p-2 rounded-full shadow-sm text-gray-400 hover:text-orange-500"
                            title="Testar Som"
                        >
                            🔊
                        </button>
                    </header>

                    {activeTab === 'orders' && (
                        <OrderKanban
                            orders={orders}
                            onStatusUpdate={updateOrderStatus}
                            onEdit={setEditingOrder}
                            onCancel={(id) => { setCancelingOrder(id); setCancelReason('') }}
                        />
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold mb-4">Histórico Completo</h3>
                            {/* Simple list for history */}
                            <div className="space-y-4">
                                {orders.filter(o => o.status === 'finalizado' || o.status === 'cancelado').map(order => (
                                    <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-bold">{order.customer_name}</p>
                                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                                            {order.status === 'cancelado' && <span className="text-xs text-red-500">Cancelado: {order.cancellation_reason}</span>}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-700">R$ {order.total.toFixed(2)}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'finalizado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && <ProductsManager />}

                    {activeTab === 'categories' && <CategoriesManager />}

                    {activeTab === 'banners' && <BannersManager />}

                    {activeTab === 'settings' && <StoreSettings />}

                    {activeTab === 'extras' && <ExtrasManager />}

                </div>
            </main>
        </div>
    )
}
