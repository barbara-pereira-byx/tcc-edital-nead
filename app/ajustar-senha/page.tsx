"use client"
export const dynamic = "force-dynamic"
export const runtime = "edge" 

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function AjustarSenhaPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const nome = searchParams.get("nome") || "Usuário" // Nome opcional na URL
  const { toast } = useToast()
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (novaSenha !== confirmarSenha) {
      toast({
        title: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/ajustar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, novaSenha }),
      })

      if (res.ok) {
        toast({ title: "Senha atualizada com sucesso" })

        // Chamada para envio de e-mail de confirmação
        await fetch("/api/ajustar-senha/confirmacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, nome }),
        })
      } else {
        const { message } = await res.json()
        toast({
          title: message || "Erro ao enviar e-mail de confirmação",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-center">Ajustar Senha</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="senha">Nova senha</Label>
            <Input
              type="password"
              id="senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
            <Input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...
              </>
            ) : (
              "Salvar nova senha"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
