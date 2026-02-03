import { Category } from '@/lib/supabase'

interface CategoryListProps {
    categories: Category[]
    onCreate: () => void
    onEdit: (category: Category) => void
    onDelete: (id: string) => void
}

export default function CategoryList({ categories, onCreate, onEdit, onDelete }: CategoryListProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciar Categorias</h2>
                <button
                    onClick={onCreate}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                    <span>+</span> Nova Categoria
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-gray-600">
                            <th className="px-6 py-3 font-semibold">Ordem</th>
                            <th className="px-6 py-3 font-semibold">Nome</th>
                            <th className="px-6 py-3 font-semibold">Slug</th>
                            <th className="px-6 py-3 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3 text-gray-500 font-mono text-sm">
                                    {category.order}
                                </td>
                                <td className="px-6 py-3 font-medium text-gray-800">
                                    {category.name}
                                </td>
                                <td className="px-6 py-3 text-gray-500 text-sm">
                                    {category.slug}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(category)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => onDelete(category.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                    Nenhuma categoria cadastrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
