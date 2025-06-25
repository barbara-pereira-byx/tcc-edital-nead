import { useState, useEffect, useCallback } from 'react'

export function useCategorias() {
  const [categorias, setCategorias] = useState<string[]>([
    "Dados Pessoais",
    "Identidade", 
    "Endereço",
    "Contato",
    "Documentos",
    "Outros"
  ])
  
  const [isLoading, setIsLoading] = useState(false)

  const carregarCategorias = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/categorias')
      if (response.ok) {
        const categoriasApi = await response.json()
        setCategorias(categoriasApi)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const adicionarCategoria = useCallback((novaCategoria: string) => {
    const categoriaTrimmed = novaCategoria.trim()
    if (categoriaTrimmed && !categorias.includes(categoriaTrimmed)) {
      setCategorias(prev => [...prev, categoriaTrimmed])
      return true
    }
    return false
  }, [categorias])

  const adicionarCategoriasDosCampos = useCallback((campos: any[]) => {
    const categoriasDosCampos = campos
      .map(campo => campo.categoria)
      .filter(Boolean)
      .filter(cat => !categorias.includes(cat))
    
    if (categoriasDosCampos.length > 0) {
      setCategorias(prev => [...prev, ...categoriasDosCampos])
    }
  }, [categorias])

  useEffect(() => {
    carregarCategorias()
  }, [carregarCategorias])

  return {
    categorias,
    isLoading,
    carregarCategorias,
    adicionarCategoria,
    adicionarCategoriasDosCampos
  }
}