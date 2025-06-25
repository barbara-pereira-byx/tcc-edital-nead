'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function usePageRefresh() {
  const router = useRouter()

  useEffect(() => {
    // Força refresh dos dados do servidor quando a página é acessada
    router.refresh()
  }, [router])

  const refreshPage = () => {
    router.refresh()
  }

  return { refreshPage }
}