'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Order } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import OrderEditor from '@/components/admin/OrderEditor'
import AdminSidebar from '@/components/admin/AdminSidebar'
import OrderKanban from '@/components/admin/OrderKanban'
import OrderHistory from '@/components/admin/OrderHistory'
import FinancialDashboard from '@/components/admin/FinancialDashboard'
import ProductsManager from '@/components/admin/ProductsManager'
import CategoriesManager from '@/components/admin/CategoriesManager'
import BannersManager from '@/components/admin/BannersManager'
import StoreSettings from '@/components/admin/StoreSettings'
import ExtrasManager from '@/components/admin/ExtrasManager'

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
    const [adminPassword, setAdminPassword] = useState('')
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null)

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
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    setOrders(current =>
                        current.map(order =>
                            order.id === payload.new.id ? payload.new as Order : order
                        )
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    const playNotificationSound = () => {
        try {
            // Parar áudio anterior se existir
            if (notificationAudioRef.current) {
                notificationAudioRef.current.pause()
                notificationAudioRef.current.currentTime = 0
            }

            // Criar e tocar o áudio em LOOP
            const audio = new Audio('/sounds/notification.mp3')
            audio.volume = 1.0
            audio.loop = true // LOOP INFINITO até parar manualmente
            notificationAudioRef.current = audio

            // Tentar tocar imediatamente
            const playPromise = audio.play()

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('🔊 Som tocando em loop')
                    })
                    .catch(e => {
                        console.log('⚠️ Erro ao tocar som:', e)
                        // Se falhar, tentar novamente após qualquer interação
                        const tryAgain = () => {
                            audio.play().catch(() => { })
                            document.removeEventListener('click', tryAgain)
                            document.removeEventListener('keydown', tryAgain)
                        }
                        document.addEventListener('click', tryAgain, { once: true })
                        document.addEventListener('keydown', tryAgain, { once: true })
                    })
            }

            // Tentar mostrar notificação do navegador (funciona mesmo com aba minimizada)
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🔔 Novo Pedido!', {
                    body: 'Um novo pedido chegou!',
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'new-order',
                    requireInteraction: true
                })
            } else if ('Notification' in window && Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('🔔 Novo Pedido!', {
                            body: 'Um novo pedido chegou!',
                            icon: '/favicon.ico'
                        })
                    }
                })
            }
        } catch (error) {
            console.error('❌ Erro ao criar áudio:', error)
        }
    }

    const stopNotificationSound = () => {
        if (notificationAudioRef.current) {
            notificationAudioRef.current.pause()
            notificationAudioRef.current.currentTime = 0
            notificationAudioRef.current = null
            console.log('🔇 Som parado')
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        console.log('🔄 Atualizando pedido:', orderId, 'para status:', newStatus)

        // Preparar dados para atualização
        const updateData: any = { status: newStatus }

        // Se está aceitando o pedido (mudando para em_preparo), salvar o timestamp
        if (newStatus === 'em_preparo') {
            updateData.accepted_at = new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()

        if (error) {
            console.error('❌ Erro ao atualizar status:', error)
            alert('Erro ao atualizar status: ' + error.message)
        } else {
            console.log('✅ Status atualizado com sucesso:', data)
            setOrders(current =>
                current.map(order =>
                    order.id === orderId ? { ...order, ...updateData } : order
                )
            )
        }
    }

    // Reuse existing handleCancelOrder
    const handleCancelOrder = async () => {
        if (!cancelingOrder || !cancelReason.trim()) {
            alert('⚠️ Por favor, informe o motivo do cancelamento')
            return
        }

        // Validar senha de administrador
        if (adminPassword !== '123456') {
            alert('❌ Senha de administrador incorreta!')
            return
        }

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
            setAdminPassword('')
            alert('✅ Pedido cancelado com sucesso!')
        } else {
            alert('Erro ao cancelar pedido')
        }
    }

    const handleDeleteOrder = async () => {
        if (!cancelingOrder) return

        // Validar senha de administrador
        if (adminPassword !== '123456') {
            alert('❌ Senha de administrador incorreta!')
            return
        }

        if (!confirm('⚠️ ATENÇÃO: Deletar este pedido PERMANENTEMENTE? Esta ação NÃO pode ser desfeita!')) return

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', cancelingOrder)

            if (error) throw error

            // Remove from local state
            setOrders(current => current.filter(order => order.id !== cancelingOrder))
            setCancelingOrder(null)
            setCancelReason('')
            setAdminPassword('')
            alert('✅ Pedido deletado com sucesso!')
        } catch (error: any) {
            console.error('Error deleting order:', error)
            alert(`❌ Erro ao deletar: ${error.message}\n\nVocê executou o script fix_delete_orders_v2.sql no Supabase?`)
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
                {/* Cancel/Delete Modal */}
                {cancelingOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">🔒 Cancelar ou Deletar Pedido</h2>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do Cancelamento</label>
                                    <textarea
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="Descreva o motivo..."
                                        value={cancelReason}
                                        onChange={e => setCancelReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-red-700 mb-1">🔐 Senha de Administrador *</label>
                                    <input
                                        type="password"
                                        className="w-full border border-red-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                        placeholder="Digite a senha de administrador"
                                        value={adminPassword}
                                        onChange={e => setAdminPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 mt-1">* Obrigatório para cancelar ou deletar</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        setCancelingOrder(null)
                                        setCancelReason('')
                                        setAdminPassword('')
                                    }}
                                    className="w-full py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold"
                                >
                                    ⚠️ Cancelar (mantém no histórico)
                                </button>
                                <button
                                    onClick={handleDeleteOrder}
                                    className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                                >
                                    🗑️ Deletar Permanentemente
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* New Order Alert */}
                {newOrderAlert && orders.length > 0 && orders[0].status === 'novo' && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">🔔</div>
                                <h2 className="text-3xl font-bold text-orange-600 mb-2">Novo Pedido!</h2>
                            </div>

                            {/* Detalhes do Pedido */}
                            <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
                                <div className="mb-3">
                                    <p className="text-sm text-gray-500">Cliente</p>
                                    <p className="text-xl font-bold text-gray-800">{orders[0].customer_name}</p>
                                </div>
                                <div className="mb-3">
                                    <p className="text-sm text-gray-500">Telefone</p>
                                    <p className="text-lg font-semibold text-gray-700">{orders[0].customer_phone}</p>
                                </div>
                                <div className="mb-3">
                                    <p className="text-sm text-gray-500">Endereço</p>
                                    <p className="text-base text-gray-700">{orders[0].delivery_address}</p>
                                </div>
                                {orders[0].observations && (
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-500">Observações</p>
                                        <p className="text-base text-gray-700 italic">"{orders[0].observations}"</p>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold text-orange-600">R$ {orders[0].total.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => { stopNotificationSound(); setNewOrderAlert(false) }}
                                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-colors"
                                >
                                    Ver Depois
                                </button>
                                <button
                                    onClick={() => { stopNotificationSound(); updateOrderStatus(orders[0].id, 'em_preparo'); setNewOrderAlert(false) }}
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
                                >
                                    ✅ ACEITAR
                                </button>
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
                            className="bg-white p-2 rounded-full shadow-sm text-gray-400 hover:text-blue-500"
                            title="Testar Som"
                        >
                            🔊
                        </button>
                    </header>


                    {activeTab === 'orders' && (
                        <>
                            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    📅 <strong>Exibindo apenas pedidos de hoje</strong> • Pedidos anteriores estão no Histórico
                                </p>
                            </div>
                            <OrderKanban
                                orders={orders.filter(order => {
                                    const orderDate = new Date(order.created_at)
                                    const today = new Date()
                                    return orderDate.toDateString() === today.toDateString()
                                })}
                                onStatusUpdate={updateOrderStatus}
                                onEdit={setEditingOrder}
                                onCancel={(id) => { setCancelingOrder(id); setCancelReason('') }}
                            />
                        </>
                    )}

                    {activeTab === 'history' && (
                        <OrderHistory orders={orders} />
                    )}

                    {activeTab === 'financeiro' && (
                        <FinancialDashboard orders={orders} />
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
