'use client'

import { useState, useEffect } from 'react'

type PrinterConfigProps = {
    isOpen: boolean
    onClose: () => void
    config: {
        paperSize: '58mm' | '80mm'
        autoPrint: boolean
    }
    onSave: (config: { paperSize: '58mm' | '80mm', autoPrint: boolean }) => void
}

export default function PrinterConfig({ isOpen, onClose, config, onSave }: PrinterConfigProps) {
    const [localConfig, setLocalConfig] = useState(config)

    useEffect(() => {
        setLocalConfig(config)
    }, [config])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span>🖨️</span> Impressora
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="space-y-6">
                    {/* Tamanho do Papel */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Tamanho do Papel</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setLocalConfig({ ...localConfig, paperSize: '58mm' })}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${localConfig.paperSize === '58mm'
                                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="w-8 h-12 bg-gray-200 rounded border border-gray-300"></div>
                                <span className="font-bold text-sm">58mm</span>
                            </button>

                            <button
                                onClick={() => setLocalConfig({ ...localConfig, paperSize: '80mm' })}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${localConfig.paperSize === '80mm'
                                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="w-12 h-12 bg-gray-200 rounded border border-gray-300"></div>
                                <span className="font-bold text-sm">80mm</span>
                            </button>
                        </div>
                    </div>

                    {/* Impressão Automática */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <span className="block font-bold text-gray-800">Impressão Automática</span>
                                <span className="text-xs text-gray-500">Imprimir ao aceitar pedido</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={localConfig.autoPrint}
                                    onChange={e => setLocalConfig({ ...localConfig, autoPrint: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </div>
                        </label>
                    </div>

                    <button
                        onClick={() => {
                            onSave(localConfig)
                            onClose()
                        }}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    )
}
