"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, ClipboardList, LogOut } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Painel",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/editais",
      label: "Editais",
      icon: FileText,
    },
    {
      href: "/dashboard/inscricoes",
      label: "Inscrições",
      icon: ClipboardList,
    },
  ]

  return (
    <nav className="grid gap-2 px-2">
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button variant="ghost" className={cn("w-full justify-start", pathname === route.href && "bg-muted")}>
            <route.icon className="mr-2 h-4 w-4" />
            {route.label}
          </Button>
        </Link>
      ))}
      <Link href="/api/auth/signout">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </Link>
    </nav>
  )
}
