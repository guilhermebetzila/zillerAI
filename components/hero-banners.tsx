import Image from "next/image"

export function HeroBanners() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Novos Clientes Banner */}
        <div className="relative rounded-lg overflow-hidden">
          <Image
            src="/novos-clientes-banner.png"
            alt="Novos Clientes - Descubra por que o extraordinário acontece aqui"
            width={600}
            height={300}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* PSG vs Bayern Banner */}
        <div className="relative rounded-lg overflow-hidden">
          <Image
            src="/psg-bayern-banner.png"
            alt="Transmissão Ao Vivo - Aposte e Assista PSG v Bayern de Munique"
            width={600}
            height={300}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Additional Promo Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Desafio de 6 Placares Banner */}
        <div className="relative rounded-lg overflow-hidden">
          <Image
            src="/desafio-placares-banner.png"
            alt="Desafio de 6 Placares - Preveja 6 placares, ganhe até R$1.000.000"
            width={600}
            height={300}
            className="w-full h-auto object-cover"
          />
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
