import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Product } from '@/lib/supabase'

type OrderItem = {
    id?: string
    product_id: string | null
    product_name: string
    product_price: number
    quantity: number
    subtotal: number
}

type OrderEditorProps = {
    orderId: string
    onClose: () => void
    onUpdate: () => void
}

export default function OrderEditor({ orderId, onClose, onUpdate }: OrderEditorProps) {
    const [items, setItems] = useState<OrderItem[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddingAndSelecting, setIsAddingAndSelecting] = useState(false)

    useEffect(() => {
        fetchOrderItems()
        fetchProducts()
    }, [])

    const fetchOrderItems = async () => {
        const { data } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)

        if (data) {
            setItems(data)
        }
        setLoading(false)
    }

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (data) setProducts(data)
    }

    const handleUpdateQuantity = (index: number, delta: number) => {
        setItems(current => {
            const newItems = [...current]
            const item = newItems[index]
            const newQty = item.quantity + delta

            if (newQty <= 0) {
                return newItems.filter((_, i) => i !== index)
            }

            item.quantity = newQty
            item.subtotal = item.product_price * newQty // Note: this assumes unit price is fixed based on initial addition
            return newItems
        })
    }

    const handleRemoveItem = (index: number) => {
        if (!confirm('Remover item?')) return
        setItems(current => current.filter((_, i) => i !== index))
    }

    const handleAddProduct = (product: Product) => {
        setItems(current => [
            ...current,
            {
                product_id: product.id,
                product_name: product.name,
                product_price: product.price,
                quantity: 1,
                subtotal: product.price
            }
        ])
        setIsAddingAndSelecting(false)
        setSearchTerm('')
    }

    const handleAddCustomInfo = (index: number, newName: string, newPrice: number) => {
        setItems(current => {
            const newItems = [...current]
            newItems[index].product_name = newName
            newItems[index].product_price = newPrice
            newItems[index].subtotal = newPrice * newItems[index].quantity
            return newItems
        })
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            // 1. Calculate new total
            const newTotal = items.reduce((sum, item) => sum + item.subtotal, 0)

            // 2. Update Order Total
            const { error: orderError } = await supabase
                .from('orders')
                .update({ total: newTotal })
                .eq('id', orderId)

            if (orderError) throw orderError

            // 3. Sync Items
            // Strategy: Delete all and re-insert? Or diff?
            // "Upsert" is tricky if no IDs on new items.
            // Simplest robust way: Delete all for this order, Insert all new.
            // But we might lose some metadata? Schema is simple though.

            await supabase.from('order_items').delete().eq('order_id', orderId)

            const itemsToInsert = items.map(item => ({
                order_id: orderId,
                product_id: item.product_id,
                product_name: item.product_name,
                product_price: item.product_price,
                quantity: item.quantity,
                subtotal: item.subtotal
            }))

            if (itemsToInsert.length > 0) {
                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(itemsToInsert)
                if (itemsError) throw itemsError
            }

            onUpdate()
            onClose()
        } catch (error) {
            console.error('Error saving order:', error)
            alert('Erro ao salvar alterações')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteOrder = async () => {
        if (!confirm('⚠️ ATENÇÃO: Deletar este pedido permanentemente? Esta ação não pode ser desfeita!')) return

        setLoading(true)
        try {
            // Deletar o pedido (os order_items serão deletados automaticamente com CASCADE)
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId)

            if (error) throw error

            alert('✅ Pedido deletado com sucesso!')
            onUpdate()
            onClose()
        } catch (error: any) {
            console.error('Error deleting order:', error)
            alert(`❌ Erro ao deletar pedido: ${error.message}\n\nVocê executou o script fix_delete_orders_v2.sql no Supabase?`)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800">Editar Pedido</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Add Product Section */}
                    {isAddingAndSelecting ? (
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-orange-800">Adicionar Produto</h3>
                                <button onClick={() => setIsAddingAndSelecting(false)} className="text-xs text-gray-500">Cancelar</button>
                            </div>
                            <input
                                autoFocus
                                className="w-full p-2 border rounded mb-2"
                                placeholder="Buscar produto..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <div className="max-h-40 overflow-y-auto bg-white rounded border">
                                {filteredProducts.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => handleAddProduct(p)}
                                        className="p-2 hover:bg-orange-100 cursor-pointer flex justify-between"
                                    >
                                        <span>{p.name}</span>
                                        <span className="font-bold text-orange-600">R$ {p.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingAndSelecting(true)}
                            className="w-full py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>+</span> Adicionar Item
                        </button>
                    )}

                    {/* Items List */}
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="flex flex-col gap-2 p-3 border border-gray-100 rounded-xl hover:shadow-md transition bg-white">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {/* Editable Name */}
                                        <input
                                            className="font-bold text-gray-800 w-full border-b border-transparent hover:border-gray-300 focus:border-orange-500 outline-none bg-transparent"
                                            value={item.product_name}
                                            onChange={e => handleAddCustomInfo(index, e.target.value, item.product_price)}
                                        />
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <span>Unit:</span>
                                            {/* Editable Price */}
                                            <div className="flex items-center">
                                                R$
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-20 ml-1 border-b border-gray-300 focus:border-orange-500 outline-none p-0 bg-transparent text-gray-700"
                                                    value={item.product_price}
                                                    onChange={e => handleAddCustomInfo(index, item.product_name, Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-orange-600">
                                            R$ {item.subtotal.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => handleUpdateQuantity(index, -1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-50 font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(index, 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-50 font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="Remover Item"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-gray-500 text-sm">Novo Total</p>
                            <p className="text-3xl font-bold text-orange-600">
                                R$ {items.reduce((s, i) => s + i.subtotal, 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
                            >
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>

                    {/* Botão Deletar Pedido */}
                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={handleDeleteOrder}
                            disabled={loading}
                            className="w-full py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-200"
                        >
                            <span>🗑️</span>
                            Deletar Pedido Permanentemente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
