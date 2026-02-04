'use client'

import { useState } from 'react'

interface AdminSidebarProps {
    activeTab: string
    setActiveTab: (tab: any) => void
    onLogout: () => void
}

export default function AdminSidebar({ activeTab, setActiveTab, onLogout }: AdminSidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const menuItems = [
        { id: 'orders', label: 'Gestor de Pedidos', icon: '🛎️' },
        { id: 'history', label: 'Histórico', icon: '📜' },
        { id: 'products', label: 'Produtos', icon: '🍕' },
        { id: 'extras', label: 'Complementos', icon: '➕' },
        { id: 'categories', label: 'Categorias', icon: '📁' },
        { id: 'banners', label: 'Banners', icon: '🎨' },
        { id: 'settings', label: 'Configurações', icon: '⚙️' },
    ]

    return (
        <>
            {/* Mobile Header / Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4 shadow-sm">
                <span className="font-bold text-gray-800">Admin Panel</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded bg-gray-100"
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out
                md:translate-x-0 md:static md:h-screen
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col p-4">
                    <div className="hidden md:flex items-center gap-2 mb-8 px-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
                        <h1 className="text-xl font-bold text-gray-800">Krikas Admin</h1>
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id)
                                    setIsMobileMenuOpen(false)
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                        >
                            <span>🚪</span> Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    )
}
