'use client'

import { usePageRefresh } from '@/hooks/use-page-refresh'
import { ReactNode } from 'react'

interface AutoRefreshLayoutProps {
  children: ReactNode
}

export function AutoRefreshLayout({ children }: AutoRefreshLayoutProps) {
  usePageRefresh()
  return <>{children}</>
}