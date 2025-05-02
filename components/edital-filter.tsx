"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function EditalFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get("status") || "todos")
  const [tipos, setTipos] = useState<string[]>(searchParams.get("tipos")?.split(",") || [])

  const handleStatusChange = (value: string) => {
    setStatus(value)
  }

  const handleTipoChange = (tipo: string) => {
    setTipos((prev) => (prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (status && status !== "todos") {
      params.set("status", status)
    } else {
      params.delete("status")
    }

    if (tipos.length > 0) {
      params.set("tipos", tipos.join(","))
    } else {
      params.delete("tipos")
    }

    router.push(`/editais?${params.toString()}`)
  }

  const handleReset = () => {
    setStatus("todos")
    setTipos([])
    router.push("/editais")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Status</h3>
        <RadioGroup value={status} onValueChange={handleStatusChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="todos" id="status-todos" />
            <Label htmlFor="status-todos">Todos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="abertos" id="status-abertos" />
            <Label htmlFor="status-abertos">Inscrições Abertas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="futuros" id="status-futuros" />
            <Label htmlFor="status-futuros">Em Breve</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="encerrados" id="status-encerrados" />
            <Label htmlFor="status-encerrados">Encerrados</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Tipo de Edital</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tipo-bolsa"
              checked={tipos.includes("bolsa")}
              onCheckedChange={() => handleTipoChange("bolsa")}
            />
            <Label htmlFor="tipo-bolsa">Bolsas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tipo-estagio"
              checked={tipos.includes("estagio")}
              onCheckedChange={() => handleTipoChange("estagio")}
            />
            <Label htmlFor="tipo-estagio">Estágios</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tipo-monitoria"
              checked={tipos.includes("monitoria")}
              onCheckedChange={() => handleTipoChange("monitoria")}
            />
            <Label htmlFor="tipo-monitoria">Monitorias</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tipo-extensao"
              checked={tipos.includes("extensao")}
              onCheckedChange={() => handleTipoChange("extensao")}
            />
            <Label htmlFor="tipo-extensao">Extensão</Label>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button type="submit">Aplicar Filtros</Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Limpar Filtros
        </Button>
      </div>
    </form>
  )
}
