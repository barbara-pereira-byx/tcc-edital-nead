"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"

interface EditalFilterProps {
  currentStatus?: string
  currentDataInicio?: string
  currentDataFim?: string
  currentSearch?: string
}

export function EditalFilter({
  currentStatus = "",
  currentDataInicio = "",
  currentDataFim = "",
  currentSearch = "",
}: EditalFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(currentStatus)
  const [dataInicio, setDataInicio] = useState(currentDataInicio)
  const [dataFim, setDataFim] = useState(currentDataFim)

  // Aplicar filtros
  const aplicarFiltros = () => {
    const params = new URLSearchParams()

    // Manter a busca atual se existir
    if (currentSearch) {
      params.set("search", currentSearch)
    }

    // Adicionar filtros selecionados
    if (status) {
      params.set("status", status)
    }

    if (dataInicio) {
      params.set("dataInicio", dataInicio)
    }

    if (dataFim) {
      params.set("dataFim", dataFim)
    }

    // Resetar para a primeira página ao filtrar
    router.push(`/editais?${params.toString()}`)
  }

  // Limpar filtros
  const limparFiltros = () => {
    setStatus("")
    setDataInicio("")
    setDataFim("")

    // Se houver busca, mantém apenas ela
    if (currentSearch) {
      router.push(`/editais?search=${currentSearch}`)
    } else {
      router.push("/editais")
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtro por status */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Status do Edital</Label>
        <RadioGroup value={status} onValueChange={setStatus}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="abertos" id="abertos" />
            <Label htmlFor="abertos" className="text-sm font-normal">
              Editais Abertos
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="futuros" id="futuros" />
            <Label htmlFor="futuros" className="text-sm font-normal">
              Editais Futuros
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="encerrados" id="encerrados" />
            <Label htmlFor="encerrados" className="text-sm font-normal">
              Editais Encerrados
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Filtro por período de publicação */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Período de Publicação</Label>
        <div className="space-y-2">
          <div className="relative">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              placeholder="Data inicial"
              className="pl-8"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              placeholder="Data final"
              className="pl-8"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col gap-2">
        <Button onClick={aplicarFiltros} className="w-full">
          Aplicar Filtros
        </Button>
        <Button variant="outline" onClick={limparFiltros} className="w-full">
          Limpar Filtros
        </Button>
      </div>
    </div>
  )
}
