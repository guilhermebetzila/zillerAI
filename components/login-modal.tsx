'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@ui/dialog"
import { Button } from "@ui/button"
import { Input } from "@ui/input"
import { Checkbox } from "@ui/checkbox"
import { Label } from "@ui/label"
import { WelcomeModal } from "@components/welcome-modal"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenRegister: () => void
  onLoginSuccess?: (userData: { name: string; email: string }) => void
}

export function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
  onLoginSuccess,
}: LoginModalProps) {
  const router = useRouter()

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [rememberMe, setRememberMe] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const saveLoginData = (userData: { name: string; email: string }) => {
    if (rememberMe) {
      localStorage.setItem(
        "betdreams_login",
        JSON.stringify({
          isLoggedIn: true,
          userData,
          timestamp: Date.now(),
          rememberMe: true,
        })
      )
    }
  }

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Por favor, preencha todos os campos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulação de delay da API
      await new Promise((res) => setTimeout(res, 1000))

      const storedUser = localStorage.getItem("betdreams_registered_user")
      if (!storedUser) {
        setError("Usuário não encontrado. Cadastre-se.")
        setIsLoading(false)
        return
      }

      const parsedUser = JSON.parse(storedUser)

      if (formData.email !== parsedUser.email || formData.password !== parsedUser.password) {
        setError("Email ou senha incorretos")
        setIsLoading(false)
        return
      }

      const userData = { name: parsedUser.name, email: parsedUser.email }

      saveLoginData(userData)
      onLoginSuccess?.(userData)
      setShowWelcomeModal(true)

      router.push("/perfil")
    } catch {
      setError("Ocorreu um erro no login.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWelcomeClose = () => setShowWelcomeModal(false)
  const handleActivateBonus = () => {
    console.log("🎁 Bônus ativado!")
    setShowWelcomeModal(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-100 border-gray-300 text-gray-800 max-w-sm w-full p-6">
          <DialogHeader className="sr-only">
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold">Fazer Login</h2>
              <p className="text-sm text-gray-600">Acesse sua conta BetDreams</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <Input
              placeholder="Email"
              type="text"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-white border-gray-300 text-gray-800 placeholder-gray-500 h-12"
              disabled={isLoading}
            />

            <Input
              placeholder="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="bg-white border-gray-300 text-gray-800 placeholder-gray-500 h-12"
              disabled={isLoading}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
                className="border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <Label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                Manter logado <span className="text-xs text-gray-500">(7 dias)</span>
              </Label>
            </div>

            {rememberMe && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                <div className="flex gap-2">
                  <span className="text-lg">🔒</span>
                  <div>
                    <p className="font-medium">Dispositivo confiável</p>
                    <p>Seus dados ficarão salvos por 7 dias. Use apenas em dispositivos pessoais.</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 font-medium"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="flex justify-between pt-2 text-sm">
              <button
                onClick={() => {
                  onClose()
                  onOpenRegister()
                }}
                className="text-green-600 hover:text-green-700 font-medium"
                disabled={isLoading}
              >
                Criar conta
              </button>
              <button className="text-gray-600 hover:text-gray-700" disabled={isLoading}>
                Esqueci a senha
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeClose}
        onActivateBonus={handleActivateBonus}
      />
    </>
  )
}
