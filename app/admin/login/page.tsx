'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Tentando login...")
        setLoading(true)
        setError('')

        try {
            console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            console.log("Resposta Supabase:", { data, error })

            if (error) throw error

            if (data.session) {
                console.log("Sessão obtida, redirecionando...")
                // alert("Login bem sucedido! Redirecionando...")
                router.refresh()
                router.push('/admin/dashboard')
            } else {
                console.warn("Sem sessão na resposta de dados")
                setError("Login falhou: Sessão não criada")
            }
        } catch (err: any) {
            console.error("Erro no login:", err)
            setError(err.message || 'Erro ao fazer login')
            // alert("Erro: " + (err.message || 'Erro desconhecido'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                        🔐 Admin
                    </h1>
                    <p className="text-gray-600">Área Administrativa</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-gray-600 hover:text-orange-600 transition-colors">
                        ← Voltar para o site
                    </a>
                </div>
            </div>
        </div>
    )
}
