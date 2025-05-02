"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditalEditForm } from "@/components/edital-edit-form"
import { FormularioForm } from "@/components/formulario-form"
import { FormularioEditForm } from "@/components/formulario-edit-form"
import { useToast } from "@/components/ui/use-toast"

interface EditalGerenciadorProps {
  editalId: string
}

export function EditalGerenciador({ editalId }: EditalGerenciadorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [edital, setEdital] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("edital")

  useEffect(() => {
    const fetchEdital = async () => {
      try {
        const response = await fetch(`/api/editais/${editalId}`)
        if (response.ok) {
          const data = await response.json()
          setEdital(data)
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do edital",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEdital()
  }, [editalId, toast])

  const handleEditalUpdated = () => {
    toast({
      title: "Edital atualizado",
      description: "As informações do edital foram atualizadas com sucesso",
    })
    router.refresh()
  }

  const handleFormularioCreated = () => {
    toast({
      title: "Formulário criado",
      description: "O formulário foi criado com sucesso",
    })
    router.refresh()
    // Recarregar os dados do edital para mostrar o formulário
    fetchEdital()
  }

  const handleFormularioUpdated = () => {
    toast({
      title: "Formulário atualizado",
      description: "O formulário foi atualizado com sucesso",
    })
    router.refresh()
  }

  const fetchEdital = async () => {
    try {
      const response = await fetch(`/api/editais/${editalId}`)
      if (response.ok) {
        const data = await response.json()
        setEdital(data)
      }
    } catch (error) {
      console.error("Erro ao recarregar edital:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!edital) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Edital não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Edital</CardTitle>
          <CardDescription>
            Edital: {edital.titulo} (ID: {edital.id})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edital">Informações do Edital</TabsTrigger>
              <TabsTrigger value="formulario">Formulário de Inscrição</TabsTrigger>
            </TabsList>
            <TabsContent value="edital" className="mt-4">
              <EditalEditForm edital={edital} onEditalUpdated={handleEditalUpdated} />
            </TabsContent>
            <TabsContent value="formulario" className="mt-4">
              {edital.formulario ? (
                <FormularioEditForm
                  formulario={edital.formulario}
                  onFormularioUpdated={handleFormularioUpdated}
                />
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Este edital ainda não possui um formulário de inscrição. Crie um formulário para permitir que
                          os usuários se inscrevam.
                        </p>
                      </div>
                    </div>
                  </div>
                  <FormularioForm 
                    editalId={edital.id} 
                    editalCodigo={edital.codigo || edital.titulo.substring(0, 10)} 
                    onFormularioCreated={handleFormularioCreated} 
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/admin/editais")}>
            Voltar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
