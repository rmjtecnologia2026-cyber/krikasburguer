'use client'

import { useState, useEffect } from 'react'
import { supabase, Banner } from '@/lib/supabase'
import BannerList from './BannerList'
import BannerForm from './BannerForm'

export default function BannersManager() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('order', { ascending: true })

            if (error) throw error
            setBanners(data || [])
        } catch (error) {
            console.error('Erro ao buscar banners:', error)
            alert('Erro ao carregar banners.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingBanner(null)
        setIsEditing(true)
    }

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner)
        setIsEditing(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este banner?')) return

        try {
            const { error } = await supabase
                .from('banners')
                .delete()
                .eq('id', id)

            if (error) throw error

            setBanners(banners.filter(b => b.id !== id))
        } catch (error) {
            console.error('Erro ao excluir:', error)
            alert('Erro ao excluir banner.')
        }
    }

    const handleSave = () => {
        setIsEditing(false)
        fetchBanners()
    }

    if (loading) return <div className="text-center py-12">Carregando...</div>

    if (isEditing) {
        return (
            <BannerForm
                banner={editingBanner}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
            />
        )
    }

    return (
        <BannerList
            banners={banners}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    )
}
