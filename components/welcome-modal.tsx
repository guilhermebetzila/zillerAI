"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@ui/dialog"
import { Button } from "@ui/button"
import { Gift, Star, CreditCard, Shield } from "lucide-react"
import Image from "next/image"

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onActivateBonus: () => void
}

export function WelcomeModal({ isOpen, onClose, onActivateBonus }: WelcomeModalProps) {
  const [showPixModal, setShowPixModal] = useState(false)

  const handleActivateBonus = () => {
    setShowPixModal(true)
  }

  const handlePixActivation = () => {
    setShowPixModal(false)
    onActivateBonus()
    onClose()
  }

  return (
    <>
      {/* Welcome Modal */}
      <Dialog open={isOpen && !showPixModal} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-green-800 to-green-600 border-green-500 text-white max-w-lg w-full p-0 overflow-hidden">
          <div className="relative">
            {/* Header with stars */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-yellow-400/20 to-transparent">
              <div className="flex justify-center items-center h-full">
                <Star className="h-6 w-6 text-yellow-400 animate-pulse" />
                <Star className="h-8 w-8 text-yellow-300 mx-4 animate-pulse" />
                <Star className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
            </div>

            <div className="p-8 pt-16 text-center">
              {/* Logo */}
              <div className="mb-6">
                <Image
                  src="/betdreams-logo.png"
                  alt="BetDreams"
                  width={150}
                  height={50}
                  className="mx-auto h-12 w-auto"
                  unoptimized
                />
              </div>

              {/* Welcome Message */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 text-yellow-300">🎉 PARABÉNS!</h1>
                <h2 className="text-xl font-semibold mb-3">Seja bem-vindo à BetDreams</h2>
                <p className="text-lg italic text-green-100 mb-4">"Onde seus sonhos se tornam realidade"</p>
                <div className="flex items-center justify-center gap-2 text-sm text-green-200">
                  <Shield className="h-4 w-4" />
                  <span>Jogue com responsabilidade</span>
                </div>
              </div>

              {/* Bonus Offer */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 mb-6 text-black">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Gift className="h-6 w-6" />
                  <h3 className="text-xl font-bold">BÔNUS DE INAUGURAÇÃO</h3>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-lg font-semibold">💰 Depósito Mínimo: R$ 30</p>
                  <p className="text-2xl font-bold text-green-700">🎁 RECEBA EM DOBRO!</p>
                  <p className="text-sm">Deposite R$ 30 e jogue com R$ 60</p>
                </div>

                <div className="bg-white/20 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium">⚡ Ativação instantânea via PIX</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleActivateBonus}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 text-lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  ATIVAR BÔNUS VIA PIX
                </Button>

                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  Continuar sem bônus
                </Button>
              </div>

              {/* Terms */}
              <p className="text-xs text-green-200 mt-4 opacity-80">
                *Termos e condições aplicáveis. Bônus válido para novos usuários.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIX Activation Modal */}
      <Dialog open={showPixModal} onOpenChange={() => setShowPixModal(false)}>
        <DialogContent className="bg-white text-gray-800 max-w-md w-full">
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Ativação do Bônus</h2>
              <p className="text-gray-600">Realize seu primeiro depósito via PIX</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Depósito mínimo:</span>
                  <span className="font-bold text-green-600">R$ 30,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bônus:</span>
                  <span className="font-bold text-green-600">+ R$ 30,00</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total para jogar:</span>
                  <span className="font-bold text-green-600">R$ 60,00</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handlePixActivation}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              >
                Realizar Depósito PIX
              </Button>

              <Button
                onClick={() => setShowPixModal(false)}
                variant="outline"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Voltar
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">🔒 Transação 100% segura e instantânea</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
