'use client'

import { useCart } from '@/context/CartContext'
import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-browser'

export default function Cart() {
    const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCart()
    const [isOpen, setIsOpen] = useState(false)
    const [isCheckout, setIsCheckout] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        observations: ''
    })

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            console.log('Iniciando envio do pedido...', { formData, items })

            // Criar pedido
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    delivery_address: formData.address,
                    observations: formData.observations,
                    total: total,
                    status: 'novo'
                })
                .select()
                .single()

            if (orderError) {
                console.error('Erro Supabase (Order):', orderError)
                throw new Error(`Erro ao criar pedido: ${orderError.message}`)
            }

            console.log('Pedido criado:', order)

            // Criar itens do pedido
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                product_price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) {
                console.error('Erro Supabase (Items):', itemsError)
                throw new Error(`Erro ao adicionar itens: ${itemsError.message}`)
            }

            // Sucesso
            alert('Pedido realizado com sucesso! Aguarde a confirmação.')
            clearCart()
            setIsCheckout(false)
            setIsOpen(false)
            setFormData({ name: '', phone: '', address: '', observations: '' })
        } catch (error: any) {
            console.error('Erro detalhado ao criar pedido:', error)
            alert(error.message || 'Erro ao realizar pedido. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Botão do carrinho */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50 group"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm animate-pulse">
                        {itemCount}
                    </span>
                )}
            </button>

            {/* Modal do carrinho */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">
                                {isCheckout ? 'Finalizar Pedido' : 'Seu Carrinho'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    setIsCheckout(false)
                                }}
                                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {!isCheckout ? (
                                <>
                                    {items.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {items.map(item => (
                                                <div key={item.id} className="flex gap-4 bg-gray-50 rounded-xl p-4">
                                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                        <p className="text-orange-600 font-bold">R$ {item.price.toFixed(2)}</p>

                                                        <div className="flex items-center gap-3 mt-2">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <form onSubmit={handleSubmitOrder} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                            placeholder="Seu nome"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Endereço de Entrega *
                                        </label>
                                        <textarea
                                            required
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                                            rows={3}
                                            placeholder="Rua, número, bairro, cidade"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Observações
                                        </label>
                                        <textarea
                                            value={formData.observations}
                                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                                            rows={2}
                                            placeholder="Alguma observação sobre o pedido?"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Enviando...' : 'Confirmar Pedido'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Footer */}
                        {!isCheckout && items.length > 0 && (
                            <div className="border-t border-gray-200 p-6 bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold text-gray-700">Total:</span>
                                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                        R$ {total.toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsCheckout(true)}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Finalizar Pedido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
