import { Product } from '@/lib/supabase'

interface ProductListProps {
    products: Product[]
    onCreate: () => void
    onEdit: (product: Product) => void
    onDelete: (id: string) => void
}

export default function ProductList({ products, onCreate, onEdit, onDelete }: ProductListProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h2>
                <button
                    onClick={onCreate}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                    <span>+</span> Novo Produto
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 text-left text-gray-600">
                            <th className="px-4 py-3 rounded-l-lg">Produto</th>
                            <th className="px-4 py-3">Categoria</th>
                            <th className="px-4 py-3">Preço</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right rounded-r-lg">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {product.image_url && (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-lg object-cover bg-gray-200"
                                            />
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-800">{product.name}</p>
                                            {product.is_featured && (
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                                    Destaque
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {product.category?.name || '-'}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    R$ {product.price.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${product.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {product.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => onDelete(product.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    Nenhum produto cadastrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
