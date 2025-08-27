import { Button } from "@/components/ui/button"

export function PromoBanners() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Banner 1 - Novos Clientes */}
        <div className="relative bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-4 text-white overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs font-semibold mb-2">Novos Clientes</div>
            <h3 className="text-lg font-bold mb-2">DESCUBRA POR QUE O EXTRAORDINÁRIO ACONTECE AQUI</h3>
            <Button size="sm" className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold">
              Registre-se
            </Button>
            <div className="text-xs mt-2 opacity-90">
              Jogos com responsabilidade. 18+. Autorizada a operar no Brasil.
            </div>
          </div>
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-green-400 to-transparent opacity-50"></div>
        </div>

        {/* Banner 2 - Fidelidade */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-4 text-white overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs font-semibold mb-2">Fidelidade betDreams</div>
            <h3 className="text-lg font-bold mb-2">FAÇA PARTE DO CLUBE365</h3>
            <Button size="sm" className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold">
              Registre-se
            </Button>
            <div className="text-xs mt-2 opacity-90">Aplicam-se T&Cs</div>
          </div>
        </div>

        {/* Banner 3 - Transmissão */}
        <div className="relative bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-4 text-white overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs font-semibold mb-2">Transmissão Ao Vivo</div>
            <h3 className="text-lg font-bold mb-2">APOSTE E ASSISTA - PSG V BAYERN DE MUNIQUE</h3>
            <div className="text-xs mt-2 opacity-90">Aplicam-se T&Cs</div>
          </div>
        </div>

        {/* Banner 4 - Desafio */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-500 rounded-lg p-4 text-white overflow-hidden">
          <div className="relative z-10">
            <div className="text-xs font-semibold mb-2">Desafio da Previsão</div>
            <h3 className="text-lg font-bold mb-2">PREVEJA E GANHE PLACARES ATÉ R$ 1 MILHÃO</h3>
            <div className="text-xs mt-2 opacity-90">Aplicam-se T&Cs</div>
          </div>
        </div>
      </div>
    </div>
  )
}
