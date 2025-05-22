"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react"

interface SenhaEditalFormProps {
  editalId: string
  senha: string
  redirectToInscritos?: boolean
}

export function SenhaEditalForm({ editalId, senha, redirectToInscritos = false }: SenhaEditalFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [senhaInput, setSenhaInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [senhaCorreta, setSenhaCorreta] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Verificar a senha localmente
      if (senhaInput === senha) {
        setSenhaCorreta(true)

        // Gerar um hash seguro da senha para usar como token
        const token = await generateSecureToken(senha)

        toast({
          title: "Acesso liberado",
          description: "Você agora tem acesso à lista de inscritos.",
        })

        // Redirecionar para a página com a lista de inscritos
        if (redirectToInscritos) {
          router.push(`/editais/${editalId}/inscritos?token=${token}`)
        }
      } else {
        toast({
          title: "Senha incorreta",
          description: "A senha informada não está correta.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar a senha.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Função para gerar um token seguro baseado na senha
  const generateSecureToken = async (password: string) => {
    // No ambiente do navegador, não temos acesso ao módulo crypto do Node.js
    // Então vamos usar uma abordagem alternativa para gerar um hash

    // Função para converter string para hash usando SHA-256
    async function sha256(message: string) {
      // Codificar a mensagem como bytes
      const msgBuffer = new TextEncoder().encode(message)
      // Hash a mensagem
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
      // Converter ArrayBuffer para Array
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      // Converter bytes para string hexadecimal
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      return hashHex
    }

    return await sha256(password)
  }

  if (senhaCorreta && !redirectToInscritos) {
    return (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="font-medium text-green-800 flex items-center gap-2">
          <Lock className="h-4 w-4" /> Acesso liberado
        </h3>
        <p className="text-green-700 text-sm mt-1">Você tem acesso à lista de inscritos deste edital.</p>
        <Button
          variant="outline"
          className="mt-2 border-green-300 text-green-700 hover:bg-green-100"
          onClick={async () => {
            const token = await generateSecureToken(senha)
            router.push(`/editais/${editalId}/inscritos?token=${token}`)
          }}
        >
          Ver lista de inscritos
        </Button>
      </div>
    )
  }

  return (
    <div className={redirectToInscritos ? "" : "bg-blue-50 p-4 rounded-lg border border-blue-200"}>
      <h3 className="font-medium text-blue-800 flex items-center gap-2">
        <Lock className="h-4 w-4" /> Acesso restrito
      </h3>
      <p className="text-blue-700 text-sm mt-1 mb-3">
        Para acessar a lista de inscritos deste edital, informe a senha de acesso.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="senha" className="text-blue-800">
            Senha do edital
          </Label>
          <div className="relative">
            <Input
              id="senha"
              type={showPassword ? "text" : "password"}
              value={senhaInput}
              onChange={(e) => setSenhaInput(e.target.value)}
              placeholder="Digite a senha do edital"
              className="pr-10 border-blue-300 focus:border-blue-500"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full text-blue-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
            </>
          ) : (
            "Acessar lista de inscritos"
          )}
        </Button>
      </form>
    </div>
  )
}
