'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
    id: string
    cartId: string
    name: string
    price: number
    quantity: number
    image_url: string
    extras?: {
        id: string
        name: string
        price: number
        group_name: string
    }[]
}

type CartContextType = {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity' | 'cartId'>) => void
    removeItem: (cartId: string) => void
    updateQuantity: (cartId: string, quantity: number) => void
    clearCart: () => void
    total: number
    itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Carregar carrinho do localStorage
    useEffect(() => {
        const saved = localStorage.getItem('cart')
        if (saved) {
            setItems(JSON.parse(saved))
        }
    }, [])

    // Salvar carrinho no localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addItem = (item: Omit<CartItem, 'quantity' | 'cartId'>) => {
        setItems(current => {
            // Gerar cartId único baseado na combinação produto + extras
            const extrasId = item.extras && item.extras.length > 0
                ? item.extras.map(e => e.id).sort().join('-')
                : ''

            // Se tiver extras, o ID do produto não basta.
            // Se não tiver extras, podemos usar o ID do produto? 
            // Melhor ter um cartId sempre consistente.
            const cartId = extrasId ? `${item.id}-${extrasId}` : item.id

            const existing = current.find(i => i.cartId === cartId)

            if (existing) {
                return current.map(i =>
                    i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
                )
            }

            return [...current, { ...item, quantity: 1, cartId }]
        })
    }

    const removeItem = (cartId: string) => {
        setItems(current => current.filter(i => i.cartId !== cartId))
    }

    const updateQuantity = (cartId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(cartId)
            return
        }
        setItems(current =>
            current.map(i => (i.cartId === cartId ? { ...i, quantity } : i))
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const total = items.reduce((sum, item) => {
        const extrasTotal = item.extras ? item.extras.reduce((acc, ex) => acc + ex.price, 0) : 0
        return sum + (item.price + extrasTotal) * item.quantity
    }, 0)

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within CartProvider')
    }
    return context
}
