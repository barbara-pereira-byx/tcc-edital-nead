import type React from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard-nav"
import { getCurrentUser } from "@/lib/session"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/editais")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Link href="/dashboard">
              <span className="text-xl">Portal de Editais</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-16 z-30 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6">
            <DashboardNav />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-4 md:py-8">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
