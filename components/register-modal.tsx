'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select'
import { Label } from '@ui/label'
import { Info } from 'lucide-react'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [activeTab, setActiveTab] = useState(1)
  const [formData, setFormData] = useState({
    country: 'Brasil',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  useEffect(() => {
    const existing = localStorage.getItem('betdreams_registered_user')
    if (!existing) {
      const defaultUser = {
        name: 'João Silva Santos',
        email: 'joao.silva@gmail.com',
        password: '123456',
        phone: '+55 99999-9999',
        country: 'Brasil',
      }
      localStorage.setItem('betdreams_registered_user', JSON.stringify(defaultUser))
      console.log('✅ Usuário padrão criado:', defaultUser)
    }
  }, [])

  const handleCreateAccount = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido.')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    const existingUser = localStorage.getItem('betdreams_registered_user')
    if (existingUser) {
      const parsed = JSON.parse(existingUser)
      if (parsed.email === formData.email) {
        setError('Este email já está registrado.')
        return
      }
    }

    const newUser = {
      name: 'João Silva Santos',
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      country: formData.country,
    }

    localStorage.setItem('betdreams_registered_user', JSON.stringify(newUser))
    console.log('✅ Conta criada com sucesso:', newUser)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Registre-se</DialogTitle>
        </DialogHeader>

        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab(1)}
            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 1
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            1. Dados Pessoais
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 2
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            2. Dados de Login
          </button>
        </div>

        {activeTab === 1 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-300 mb-4">
              Certifique-se de ter um documento de identificação em mãos. A
              verificação da identidade é necessária para ativar sua conta.
            </div>

            <div>
              <Label className="text-sm text-gray-300 mb-2 block">
                País de Residência
              </Label>
              <Select
                value={formData.country}
                onValueChange={(value: string) => handleInputChange('country', value)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">🇧🇷</span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="Brasil" className="text-white hover:bg-gray-600">
                    🇧🇷 Brasil
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="w-20">
                <Input
                  value="+55"
                  disabled
                  className="bg-gray-700 border-gray-600 text-white text-center"
                />
              </div>
              <div className="flex-1 relative">
                <Input
                  placeholder="Número de celular"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('phone', e.target.value)
                  }
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-8"
                />
                <Info className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="text-sm text-gray-300">
              Seu e-mail será usado para login e comunicação.
            </div>

            <Input
              placeholder="E-mail"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('email', e.target.value)
              }
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />

            <Button
              onClick={() => setActiveTab(2)}
              className="w-full bg-green-600 hover:bg-green-700 text-white mt-6"
            >
              Continuar
            </Button>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-300 mb-4">
              Crie suas credenciais com pelo menos 6 caracteres.
            </div>

            <div>
              <Label className="text-sm text-gray-300 mb-2 block">Senha</Label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('password', e.target.value)
                }
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-300 mb-2 block">
                Confirmar Senha
              </Label>
              <Input
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setActiveTab(1)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Voltar
              </Button>
              <Button
                onClick={handleCreateAccount}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Criar Conta
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
