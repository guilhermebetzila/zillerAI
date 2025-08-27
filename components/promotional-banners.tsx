import Image from "next/image"

export function PromotionalBanners() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Novos Clientes */}
        <div className="relative rounded-lg overflow-hidden">
          <Image
            src="/novos-clientes-banner.png"
            alt="Novos Clientes - Descubra por que o extraordinário acontece aqui"
            width={400}
            height={200}
            className="w-full h-auto object-cover"
            priority
            unoptimized
          />
        </div>

        {/* Transmissão Ao Vivo */}
        <div className="relative rounded-lg overflow-hidden">
          <Image
            src="/psg-bayern-banner.png"
            alt="Transmissão Ao Vivo - Aposte e Assista PSG v Bayern de Munique"
            width={400}
            height={200}
            className="w-full h-auto object-cover"
            priority
            unoptimized
          />
        </div>

        {/* Desafio de 6 Placares */}
        <div className="relative rounded-lg overflow-hidden">
          <Image
            src="/desafio-placares-banner.png"
            alt="Desafio de 6 Placares - Preveja 6 placares, ganhe até R$1.000.000"
            width={400}
            height={200}
            className="w-full h-auto object-cover"
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}
