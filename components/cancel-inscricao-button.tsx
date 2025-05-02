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
  const [isOpen, setIsOpen] = useState(false)
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
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        Cancelar Inscrição
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Inscrição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta inscrição? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Cancelando..." : "Sim, cancelar inscrição"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
