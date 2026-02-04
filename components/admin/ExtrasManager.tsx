'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { ExtrasGroup, ExtrasOption } from '@/lib/supabase'

export default function ExtrasManager() {
    const [groups, setGroups] = useState<ExtrasGroup[]>([])
    const [selectedGroup, setSelectedGroup] = useState<ExtrasGroup | null>(null)
    const [options, setOptions] = useState<ExtrasOption[]>([])
    const [loading, setLoading] = useState(true)
    const [editingGroup, setEditingGroup] = useState<Partial<ExtrasGroup> | null>(null)
    const [editingOption, setEditingOption] = useState<Partial<ExtrasOption> | null>(null)

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        const { data } = await supabase
            .from('extras_groups')
            .select('*')
            .order('name')
        if (data) setGroups(data)
        setLoading(false)
    }

    const fetchOptions = async (groupId: string) => {
        const { data } = await supabase
            .from('extras_options')
            .select('*')
            .eq('group_id', groupId)
            .order('name')
        if (data) setOptions(data)
    }

    const handleSelectGroup = async (group: ExtrasGroup) => {
        setSelectedGroup(group)
        await fetchOptions(group.id)
    }

    const handleSaveGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingGroup) return

        if (editingGroup.id) {
            await supabase.from('extras_groups').update(editingGroup).eq('id', editingGroup.id)
        } else {
            await supabase.from('extras_groups').insert(editingGroup)
        }
        setEditingGroup(null)
        fetchGroups()
    }

    const handleDeleteGroup = async (id: string) => {
        if (!confirm('Tem certeza? Isso apagará todas as opções deste grupo.')) return
        await supabase.from('extras_groups').delete().eq('id', id)
        fetchGroups()
        if (selectedGroup?.id === id) setSelectedGroup(null)
    }

    const handleSaveOption = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingOption || !selectedGroup) return

        const optionData = { ...editingOption, group_id: selectedGroup.id }

        if (editingOption.id) {
            await supabase.from('extras_options').update(optionData).eq('id', editingOption.id)
        } else {
            await supabase.from('extras_options').insert(optionData)
        }
        setEditingOption(null)
        fetchOptions(selectedGroup.id)
    }

    const handleDeleteOption = async (id: string) => {
        if (!confirm('Tem certeza?')) return
        await supabase.from('extras_options').delete().eq('id', id)
        if (selectedGroup) fetchOptions(selectedGroup.id)
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Lista de Grupos */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Grupos de Adicionais</h2>
                    <button
                        onClick={() => setEditingGroup({ name: '', min_options: 0, max_options: 1, is_required: false })}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition"
                    >
                        + Novo Grupo
                    </button>
                </div>

                {/* Form Grupo */}
                {editingGroup && (
                    <form onSubmit={handleSaveGroup} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
                        <input
                            className="w-full mb-3 p-2 rounded border"
                            placeholder="Nome (ex: Adicionais)"
                            value={editingGroup.name || ''}
                            onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })}
                            required
                        />
                        <div className="flex gap-4 mb-3">
                            <div>
                                <label className="text-xs text-gray-500">Mínimo</label>
                                <input
                                    type="number" className="w-full p-2 rounded border"
                                    value={editingGroup.min_options || 0}
                                    onChange={e => setEditingGroup({ ...editingGroup, min_options: +e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Máximo</label>
                                <input
                                    type="number" className="w-full p-2 rounded border"
                                    value={editingGroup.max_options || 1}
                                    onChange={e => setEditingGroup({ ...editingGroup, max_options: +e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                checked={editingGroup.is_required || false}
                                onChange={e => setEditingGroup({ ...editingGroup, is_required: e.target.checked })}
                            />
                            <label className="text-sm">Obrigatório?</label>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Salvar</button>
                            <button type="button" onClick={() => setEditingGroup(null)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancelar</button>
                        </div>
                    </form>
                )}

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {groups.map(group => (
                        <div
                            key={group.id}
                            onClick={() => handleSelectGroup(group)}
                            className={`p-4 rounded-xl border cursor-pointer hover:bg-orange-50 transition-colors flex justify-between items-center ${selectedGroup?.id === group.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100'
                                }`}
                        >
                            <div>
                                <h3 className="font-bold text-gray-800">{group.name}</h3>
                                <p className="text-xs text-gray-500">
                                    Min: {group.min_options} | Max: {group.max_options} | {group.is_required ? 'Obrigatório' : 'Opcional'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setEditingGroup(group) }} className="text-blue-500">✎</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id) }} className="text-red-500">🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Opções do Grupo Selecionado */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {selectedGroup ? `Opções de "${selectedGroup.name}"` : 'Selecione um grupo'}
                    </h2>
                    {selectedGroup && (
                        <button
                            onClick={() => setEditingOption({ name: '', price: 0, is_available: true })}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition"
                        >
                            + Nova Opção
                        </button>
                    )}
                </div>

                {!selectedGroup ? (
                    <div className="text-gray-400 text-center py-12">
                        Selecione um grupo para gerenciar as opções
                    </div>
                ) : (
                    <>
                        {editingOption && (
                            <form onSubmit={handleSaveOption} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
                                <input
                                    className="w-full mb-3 p-2 rounded border"
                                    placeholder="Nome (ex: Bacon)"
                                    value={editingOption.name || ''}
                                    onChange={e => setEditingOption({ ...editingOption, name: e.target.value })}
                                    required
                                />
                                <div className="flex gap-4 mb-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">Preço (R$)</label>
                                        <input
                                            type="number" step="0.01" className="w-full p-2 rounded border"
                                            value={editingOption.price || 0}
                                            onChange={e => setEditingOption({ ...editingOption, price: +e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center pt-5">
                                        <input
                                            type="checkbox"
                                            checked={editingOption.is_available ?? true}
                                            onChange={e => setEditingOption({ ...editingOption, is_available: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <label className="text-sm">Disponível</label>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Salvar</button>
                                    <button type="button" onClick={() => setEditingOption(null)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancelar</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-2">
                            {options.map(option => (
                                <div key={option.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                    <div>
                                        <p className="font-semibold text-gray-800">{option.name}</p>
                                        <p className="text-sm text-green-600 font-bold">+ R$ {option.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!option.is_available && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Indisponível</span>}
                                        <button onClick={() => setEditingOption(option)} className="text-blue-500">✎</button>
                                        <button onClick={() => handleDeleteOption(option.id)} className="text-red-500">🗑</button>
                                    </div>
                                </div>
                            ))}
                            {options.length === 0 && <p className="text-center text-gray-500 py-4">Nenhuma opção cadastrada</p>}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
