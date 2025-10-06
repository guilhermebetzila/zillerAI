'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Star, ShoppingCart, Search, Award, DollarSign, TrendingUp } from 'lucide-react'
import LayoutWrapper from '@components/LayoutWrapper'

export default function ZillerStorePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [produtos, setProdutos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // 🔹 Simulação de dados vindos do backend
    setTimeout(() => {
      setProdutos([
        {
          id: 1,
          nome: 'Mentoria Avançada em Criptomoedas',
          autor: 'Carlos Trader',
          preco: 250,
          avaliacao: 4.9,
          seloIA: true,
          tipo: 'Curso',
          imagem: '/img/curso1.png'
        },
        {
          id: 2,
          nome: 'Bot de Copy Trading ZLR v2',
          autor: 'Ziller Labs',
          preco: 120,
          avaliacao: 4.8,
          seloIA: true,
          tipo: 'Bot',
          imagem: '/img/bot.png'
        },
        {
          id: 3,
          nome: 'Relatório Premium – Análise Bitcoin',
          autor: 'Analista Pro',
          preco: 45,
          avaliacao: 4.7,
          seloIA: false,
          tipo: 'Relatório',
          imagem: '/img/report.png'
        },
      ])
      setCarregando(false)
    }, 800)
  }, [])

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        {/* HEADER */}
        <header className="sticky top-0 bg-gray-950 px-5 py-4 shadow-md flex justify-between items-center z-20">
          <h1 className="text-lg font-bold">🛍️ Ziller Store</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-sm"
          >
            Voltar
          </button>
        </header>

        {/* SEARCH */}
        <div className="p-4">
          <div className="flex items-center bg-gray-800 rounded-xl px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cursos, bots, relatórios..."
              className="flex-1 bg-transparent outline-none px-2 text-sm"
            />
          </div>
        </div>

        {/* CONTEÚDO */}
        <main className="flex-1 p-4 space-y-6">
          <h2 className="text-md font-semibold">Produtos em destaque</h2>

          {carregando ? (
            <p className="text-center text-gray-400">Carregando produtos...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {produtosFiltrados.map(produto => (
                <div
                  key={produto.id}
                  className="bg-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/20 transition cursor-pointer"
                  onClick={() => router.push(`/games/ziller-store/${produto.id}`)}
                >
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="rounded-xl h-36 w-full object-cover mb-3"
                  />
                  <h3 className="font-semibold">{produto.nome}</h3>
                  <p className="text-xs text-gray-400">{produto.autor}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4" /> {produto.avaliacao}
                    </div>
                    {produto.seloIA && (
                      <span className="bg-green-700 text-xs px-2 py-1 rounded-lg">
                        ✅ Selo IA Curadora
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="text-green-400 font-bold">
                      ${produto.preco.toFixed(2)}
                    </span>
                    <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-xl text-sm">
                      <ShoppingCart className="w-4 h-4" /> Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* DIFERENCIAIS */}
        <section className="bg-gray-950 p-6 space-y-4 text-sm">
          <h2 className="text-md font-bold text-center mb-4">🚀 Diferenciais Ziller Store</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Award className="w-5 h-5 text-green-400 mt-1" />
              <p><strong>Curadoria IA:</strong> Todos os produtos passam por auditoria automática com Selo de Qualidade.</p>
            </li>
            <li className="flex items-start gap-2">
              <DollarSign className="w-5 h-5 text-green-400 mt-1" />
              <p><strong>Split Automático:</strong> 85% para o criador, 15% para a Ziller — tudo em segundos.</p>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-green-400 mt-1" />
              <p><strong>Copy & Earn:</strong> Copie estratégias vencedoras e ganhe junto com os traders.</p>
            </li>
          </ul>
        </section>

        <footer className="bg-gray-950 py-3 text-center text-xs text-gray-400">
          © 2025 Ziller Store — Conhecimento é poder.
        </footer>
      </div>
    </LayoutWrapper>
  )
}
