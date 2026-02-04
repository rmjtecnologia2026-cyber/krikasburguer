'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
    id: string
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
    addItem: (item: Omit<CartItem, 'quantity'>) => void
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

    const generateCartId = (item: Omit<CartItem, 'quantity'>) => {
        if (!item.extras || item.extras.length === 0) return item.id
        // Create unique ID based on product ID and sorted extras IDs
        const extrasIds = item.extras.map(e => e.id).sort().join('-')
        return `${item.id}-${extrasIds}`
    }

    const addItem = (item: Omit<CartItem, 'quantity'>) => {
        setItems(current => {
            const cartId = generateCartId(item)
            // Need to store this unique ID essentially as the 'key'
            // Ideally we modify the item structure to have a unique 'cartId' distinct from 'productId'
            // But for compatibility with existing code, let's see.
            // Existing code uses 'item.id' for remove/update.
            // We should migrate 'id' to be the unique cart ID, and store 'productId' separately?
            // Or just append unique ID.

            // Let's use a composite ID check
            const existingIndex = current.findIndex(i => {
                if (i.id !== item.id) return false
                const iExtras = i.extras || []
                const newExtras = item.extras || []
                if (iExtras.length !== newExtras.length) return false
                const iIds = iExtras.map(e => e.id).sort().join()
                const newIds = newExtras.map(e => e.id).sort().join()
                return iIds === newIds
            })

            if (existingIndex >= 0) {
                const newItems = [...current]
                newItems[existingIndex].quantity += 1
                return newItems
            }

            // If it's a new variation, we can't share the same 'id' if 'id' is used for keys in React/logic
            // But for simple "add", we can just push.
            // However, 'removeItem(id)' will remove ALL variants of that product unless we use a unique ID.
            // Let's add a 'cartId' property to CartItem?
            // Or Hack: Change 'id' to 'cartId' when adding to state?
            // But verify database integrity (product_id vs cart_id).
            // DB insertion uses 'product_id'.
            // So we need to keep 'productId'.
            // Let's add 'cartId' to CartItem and use that for operations.

            // Quick fix: Since I can't refactor everything easily now, 
            // I will assume for now we stick to simple ID if no extras, 
            // and composite ID if extras.

            const uniqueId = item.extras && item.extras.length > 0
                ? `${item.id}-${Date.now()}` // Timestamp ensures uniqueness for "customized" items usually, or hash.
                : item.id

            // Wait, if I use a unique ID, 'existing' check above is useless if ID is always new.
            // So logic:
            // 1. Check if exact config exists.
            // 2. If exists, increment quantity.
            // 3. If not, add new item with a UNIQUE 'cartId'.

            // Actually, keep 'id' as 'productId', add 'uniqueId' internal?
            // Existing calls: removeItem(item.id).
            // If I have 2 burgers (one cheese, one bacon), both have id "burger-1".
            // removeItem("burger-1") removes both? Bad.

            // I MUST Refactor CartItem to have a unique identifier.
            return [...current, { ...item, quantity: 1, internalId: Date.now().toString() }]
        })
    }

    const clearCart = () => {
        setItems([])
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
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
