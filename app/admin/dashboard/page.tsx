'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Order } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ProductsManager from '@/components/admin/ProductsManager'
import CategoriesManager from '@/components/admin/CategoriesManager'
import BannersManager from '@/components/admin/BannersManager'
import StoreSettings from '@/components/admin/StoreSettings'

export default function AdminDashboard() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'products' | 'categories' | 'banners' | 'settings'>('orders')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [newOrderAlert, setNewOrderAlert] = useState(false)

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

                    setTimeout(() => setNewOrderAlert(false), 5000)
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'novo': return 'bg-blue-100 text-blue-800'
            case 'em_preparo': return 'bg-yellow-100 text-yellow-800'
            case 'saiu_entrega': return 'bg-purple-100 text-purple-800'
            case 'finalizado': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'novo': return 'Novo'
            case 'em_preparo': return 'Em Preparo'
            case 'saiu_entrega': return 'Saiu para Entrega'
            case 'finalizado': return 'Finalizado'
            default: return status
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Alerta de Novo Pedido */}
            {newOrderAlert && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🔔</span>
                        <div>
                            <p className="font-bold">Novo Pedido!</p>
                            <p className="text-sm">Um novo pedido foi recebido</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl">
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
                <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'orders'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        📦 Pedidos Ativos
                        {orders.filter(o => o.status !== 'finalizado').length > 0 && (
                            <span className="ml-2 bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                {orders.filter(o => o.status !== 'finalizado').length}
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
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'products'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        🍕 Produtos
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'categories'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        📁 Categorias
                    </button>
                    <button
                        onClick={() => setActiveTab('banners')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'banners'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        🎨 Banners
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'settings'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        ⚙️ Configurações
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pedidos em Andamento</h2>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                            </div>
                        ) : orders.filter(o => o.status !== 'finalizado').length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <p className="text-gray-500 text-lg">Nenhum pedido ativo no momento</p>
                            </div>
                        ) : (
                            orders.filter(o => o.status !== 'finalizado').map(order => (
                                <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-orange-500">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{order.customer_name}</h3>
                                            <p className="text-gray-600">📱 {order.customer_phone}</p>
                                            <p className="text-gray-600">📍 {order.delivery_address}</p>
                                            {order.observations && (
                                                <p className="text-gray-500 text-sm mt-2">💬 {order.observations}</p>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-orange-600">
                                                R$ {order.total.toFixed(2)}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                {new Date(order.created_at).toLocaleString('pt-BR')}
                                            </p>
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                        <button onClick={() => updateOrderStatus(order.id, 'novo')} className={`px-4 py-2 rounded-full font-semibold transition-all ${order.status === 'novo' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Novo</button>
                                        <button onClick={() => updateOrderStatus(order.id, 'em_preparo')} className={`px-4 py-2 rounded-full font-semibold transition-all ${order.status === 'em_preparo' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Em Preparo</button>
                                        <button onClick={() => updateOrderStatus(order.id, 'saiu_entrega')} className={`px-4 py-2 rounded-full font-semibold transition-all ${order.status === 'saiu_entrega' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Saiu p/ Entrega</button>
                                        <button onClick={() => updateOrderStatus(order.id, 'finalizado')} className={`px-4 py-2 rounded-full font-semibold transition-all ${order.status === 'finalizado' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'}`}>✅ Finalizar</button>
                                    </div>
                                </div>
                            ))
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
                        ) : orders.filter(o => o.status === 'finalizado').length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <p className="text-gray-500 text-lg">Nenhum pedido finalizado ainda</p>
                            </div>
                        ) : (
                            orders.filter(o => o.status === 'finalizado').map(order => (
                                <div key={order.id} className="bg-white rounded-2xl shadow p-6 opacity-75 hover:opacity-100 transition-opacity">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-700">{order.customer_name}</h3>
                                            <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">R$ {order.total.toFixed(2)}</p>
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                Finalizado
                                            </span>
                                        </div>
                                    </div>
                                    {/* Opção para reabrir se necessário */}
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
            </div>
        </div>
    )
}
