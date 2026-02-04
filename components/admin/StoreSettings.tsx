'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import Image from 'next/image'

export default function StoreSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        name: '',
        address: '',
        phone: '',
        logo_url: '',
        is_open: true,
        opening_hours: ''
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .single()

        if (data) {
            setSettings(data)
        } else if (error && error.code === 'PGRST116') {
            // Se não existir, cria o padrão
            await supabase.from('store_settings').insert([{ id: 1 }])
            fetchSettings()
            return
        }
        setLoading(false)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { error } = await supabase
                .from('store_settings')
                .update({
                    name: settings.name,
                    address: settings.address,
                    phone: settings.phone,
                    logo_url: settings.logo_url,
                    is_open: settings.is_open,
                    opening_hours: settings.opening_hours
                })
                .eq('id', 1)

            if (error) throw error
            alert('Configurações salvas com sucesso!')
        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar configurações.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Carregando configurações...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">⚙️ Configurações da Loja</h2>

            <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Toggle Aberto/Fechado */}
                <div className="flex items-center justify-between mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Status da Loja</h3>
                        <p className="text-gray-500">Controle se a loja está recebendo pedidos</p>
                    </div>

                    <button
                        onClick={() => setSettings({ ...settings, is_open: !settings.is_open })}
                        className={`relative w-20 h-10 rounded-full transition-colors duration-300 ${settings.is_open ? 'bg-green-500' : 'bg-red-500'
                            }`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-8 h-8 rounded-full shadow-md transition-transform duration-300 transform ${settings.is_open ? 'translate-x-10' : 'translate-x-0'
                            }`} />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white pointer-events-none">
                            {settings.is_open ? 'ABERTO' : 'FECHADO'}
                        </span>
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nome do Restaurante
                            </label>
                            <input
                                type="text"
                                value={settings.name}
                                onChange={e => setSettings({ ...settings, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Telefone / WhatsApp
                            </label>
                            <input
                                type="text"
                                value={settings.phone}
                                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Endereço Completo
                            </label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={e => setSettings({ ...settings, address: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                URL do Logo (Link da Imagem)
                            </label>
                            <input
                                type="text"
                                value={settings.logo_url}
                                onChange={e => setSettings({ ...settings, logo_url: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 outline-none"
                                placeholder="https://exemplo.com/logo.png"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Dica: Faça upload de uma imagem em "Produtos" e copie o link, ou use um link externo.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Horário de Funcionamento (Exibido quando a loja está fechada)
                            </label>
                            <input
                                type="text"
                                value={settings.opening_hours || ''}
                                onChange={e => setSettings({ ...settings, opening_hours: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 outline-none"
                                placeholder="Ex: Terça a Domingo das 18h às 23h"
                            />
                        </div>
                    </div>

                    {/* Preview do Banner */}
                    <div className="mt-8 border-t pt-8">
                        <h3 className="font-semibold text-gray-700 mb-4">Pré-visualização do Banner</h3>
                        <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center text-white">
                            {settings.logo_url && (
                                <Image
                                    src={settings.logo_url}
                                    alt="Bg"
                                    fill
                                    className="object-cover opacity-20 blur-sm"
                                />
                            )}
                            <div className="relative z-10 text-center">
                                {settings.logo_url && (
                                    <div className="relative w-16 h-16 mx-auto mb-2 rounded-full border-2 border-white overflow-hidden">
                                        <Image src={settings.logo_url} alt="Logo" fill className="object-cover" />
                                    </div>
                                )}
                                <h2 className="text-2xl font-bold">{settings.name || 'Nome da Loja'}</h2>
                                <p className="text-sm opacity-90">{settings.address || 'Endereço da Loja'}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    )
}
