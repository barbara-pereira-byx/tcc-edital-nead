"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/editais"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === "/editais" ? "text-primary" : "text-muted-foreground"
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
    </nav>
  )
}
