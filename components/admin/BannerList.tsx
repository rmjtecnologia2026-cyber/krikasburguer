'use client'

import { Banner } from '@/lib/supabase'

interface Props {
    banners: Banner[]
    onCreate: () => void
    onEdit: (banner: Banner) => void
    onDelete: (id: string) => void
}

export default function BannerList({ banners, onCreate, onEdit, onDelete }: Props) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciar Banners</h2>
                <button
                    onClick={onCreate}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    + Novo Banner
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-gray-600 font-semibold">Imagem</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">Título</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">Ordem</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold">Status</th>
                            <th className="py-3 px-4 text-gray-600 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map((banner) => (
                            <tr key={banner.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <img
                                        src={banner.image_url}
                                        alt={banner.title}
                                        className="w-24 h-16 object-cover rounded-lg"
                                    />
                                </td>
                                <td className="py-3 px-4">
                                    <div className="font-medium text-gray-800">{banner.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{banner.description}</div>
                                </td>
                                <td className="py-3 px-4 font-mono">{banner.order}</td>
                                <td className="py-3 px-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${banner.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {banner.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right space-x-2">
                                    <button
                                        onClick={() => onEdit(banner)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(banner.id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {banners.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                    Nenhum banner cadastrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
