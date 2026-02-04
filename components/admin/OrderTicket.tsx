'use client'

import React from 'react'
import { Order } from '@/lib/supabase'

type OrderTicketProps = {
    order: Order | null
    paperSize: '58mm' | '80mm'
}

// Formatador de Moeda
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
}

export const OrderTicket = React.forwardRef<HTMLDivElement, OrderTicketProps>(({ order, paperSize }, ref) => {
    if (!order) return null

    // Largura baseada na escolha
    const widthClass = paperSize === '58mm' ? 'w-[58mm]' : 'w-[80mm]'

    // Parse order items (assumindo que items venha de algum lugar ou precise ser buscado, 
    // mas por simplicidade no Kanban, talvez precisemos passar items completos. 
    // O objeto Order base do Supabase não tem items aninhados por padrão se não fizermos join.
    // **NOTA**: O Order do hook page.tsx pode não ter items se não fizer join. 
    // Mas assumindo que vamos buscar ou que já temos. 
    // Se não tiver items, teremos que buscar. 
    // Por enquanto, vou tipar como any para os items se estiverem no objeto.

    const items = (order as any).items || []

    return (
        <div ref={ref} className={`hidden print:block font-mono text-black bg-white p-0 m-0 ${widthClass}`}>
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto; 
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    /* Esconde tudo que não for o ticket */
                    body > *:not(.print-area) {
                        display: none !important;
                    }
                    .print-area {
                        display: block !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                }
            `}</style>

            <div className={`p-2 text-xs leading-tight ${paperSize === '58mm' ? 'max-w-[58mm]' : 'max-w-[80mm]'}`}>
                {/* Cabeçalho */}
                <div className="text-center border-b-2 border-dashed border-black pb-2 mb-2">
                    <h1 className="font-bold text-lg uppercase">Krikas Burguer</h1>
                    <p className="text-[10px] mt-1">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-[10px]">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                </div>

                {/* Cliente */}
                <div className="mb-2 border-b border-dashed border-black pb-2">
                    <p className="font-bold uppercase mb-1">Cliente</p>
                    <p className="text-[11px] font-bold">{order.customer_name}</p>
                    <p>{order.customer_phone}</p>
                    <p className="mt-1">{order.delivery_address}</p>
                    {order.observations && (
                        <p className="mt-1 font-bold italic">Obs: {order.observations}</p>
                    )}
                </div>

                {/* Itens */}
                <div className="mb-2 border-b-2 border-dashed border-black pb-2">
                    <div className="flex justify-between font-bold mb-1 border-b border-black pb-1">
                        <span>Qtd Item</span>
                        <span>Valor</span>
                    </div>
                    {items && items.length > 0 ? (
                        items.map((item: any, i: number) => (
                            <div key={i} className="mb-1">
                                <div className="flex justify-between">
                                    <span>{item.quantity}x {item.product_name}</span>
                                    <span>{formatCurrency(item.subtotal)}</span>
                                </div>
                                {paperSize === '80mm' && item.notes && (
                                    <p className="text-[10px] pl-4 italic">- {item.notes}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center italic mt-2">Detalhes dos itens não carregados...</p>
                    )}
                </div>

                {/* Totais */}
                <div className="text-right">
                    <div className="flex justify-between font-bold text-sm mt-1">
                        <span>TOTAL</span>
                        <span>{formatCurrency(order.total)}</span>
                    </div>
                    <p className="text-[10px] mt-2 text-center uppercase border-t border-black pt-2">
                        {order.payment_method === 'pix' ? 'Pagamento via PIX' :
                            order.payment_method === 'card' ? 'Pagamento via Cartão' :
                                'Pagamento em Dinheiro'}
                    </p>
                </div>

                <div className="text-center mt-4 text-[10px]">
                    <p>Obrigado pela preferência!</p>
                    <p>www.krikasburguer.com.br</p>
                </div>
            </div>
        </div>
    )
})

OrderTicket.displayName = 'OrderTicket'
