"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CancelInscricaoButtonProps {
  inscricaoId: string
}

export function CancelInscricaoButton({ inscricaoId }: CancelInscricaoButtonProps) {
  const [firstOpen, setFirstOpen] = useState(false)
  const [secondOpen, setSecondOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/inscricoes/${inscricaoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Inscrição cancelada",
          description: "Sua inscrição foi cancelada com sucesso",
        })
        router.push("/inscricoes")
      } else {
        const error = await response.json()
        toast({
          title: "Erro ao cancelar inscrição",
          description: error.message || "Ocorreu um erro ao tentar cancelar a inscrição",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao cancelar inscrição",
        description: "Ocorreu um erro ao tentar cancelar a inscrição",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setSecondOpen(false)
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setFirstOpen(true)}>
        Cancelar Inscrição
      </Button>

      {/* Primeiro modal */}
      <AlertDialog open={firstOpen} onOpenChange={setFirstOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você deseja cancelar sua inscrição? Essa ação será confirmada novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setFirstOpen(false)
                setSecondOpen(true)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Segundo modal */}
      <AlertDialog open={secondOpen} onOpenChange={setSecondOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Essa é a última confirmação. Deseja realmente cancelar sua inscrição? Essa ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Cancelando..." : "Sim, cancelar inscrição"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
