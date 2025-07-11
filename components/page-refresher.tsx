'use client'

import { usePageRefresh } from '@/hooks/use-page-refresh'

export function PageRefresher() {
  usePageRefresh()
  return null
}