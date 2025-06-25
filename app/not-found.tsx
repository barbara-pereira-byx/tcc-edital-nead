"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { FileX, Home } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <FileX className="h-24 w-24 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <h2 className="text-xl font-semibold text-gray-700">Página não encontrada</h2>
            <p className="text-gray-600">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => router.push("/editais")}
          className="w-full"
        >
          <Home className="h-4 w-4 mr-2" />
          Voltar para Editais
        </Button>
      </div>
    </div>
  )
}