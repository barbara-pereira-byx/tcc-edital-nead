"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { EditalForm } from "@/components/edital-form"
import { FormularioForm } from "@/components/formulario-form"
import Link from "next/link"

export default function NovoEditalPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("edital")
  const [editalId, setEditalId] = useState<string | null>(null)
  const [editalCodigo, setEditalCodigo] = useState<string | null>(null)

  const handleEditalCreated = (id: string, codigo: string) => {
    setEditalId(id)
    setEditalCodigo(codigo)
    toast({
      title: "Edital criado com sucesso",
      description: "Agora você pode configurar o formulário de inscrição",
    })
    setActiveTab("formulario")
  }

  const handleFormularioCreated = () => {
    toast({
      title: "Formulário criado com sucesso",
      description: "O edital está pronto para ser publicado",
    })
    router.push("/gerenciar")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-slate-50 py-8">
        <div className="container px-4">
          <Link href="/gerenciar" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Voltar para gerenciador de editais
          </Link>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Cadastro do Edital</h1>
            <p className="text-muted-foreground">Crie um novo edital e defina seu formulário de inscrição</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="edital">Dados do Edital</TabsTrigger>
              <TabsTrigger value="formulario" disabled={!editalId}>
                Formulário de Inscrição
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edital">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Edital</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditalForm onEditalCreated={handleEditalCreated} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="formulario">
              {editalId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Formulário de Inscrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormularioForm
                      editalId={editalId}
                      editalCodigo={editalCodigo || ""}
                      onFormularioCreated={handleFormularioCreated}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
