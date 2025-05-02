"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function AdminNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/admin/editais" className="flex items-center space-x-2">
        <Image src="/logo-nead.png" alt="NEAD Logo" width={80} height={30} className="h-auto" priority />
      </Link>
      <Link
        href="/admin/editais"
        className={`text-sm font-medium transition-colors hover:text-red-600 ${
          pathname === "/admin/editais" ? "text-red-600" : "text-muted-foreground"
        }`}
      >
        Editais
      </Link>
      <Link
        href="/inscricoes"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === "/inscricoes" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        Minhas Inscrições
      </Link>
      <Link
        href="/admin/editais/gerenciar"
        className={`text-sm font-medium transition-colors hover:text-red-600 ${
          pathname === "/gerenciar" ? "text-red-600" : "text-muted-foreground"
        }`}
      >
        Gerenciar Editais
      </Link>
    </nav>
  )
}
