"use client"

import { useEffect } from "react"
import ClientMenu from "../../components/client-menu"
import { Card, CardContent } from "@/components/ui/card"

export default function ClientMenuWrapper() {
  return (
    <Card>
      <CardContent className="p-4">
        <ClientMenu />
      </CardContent>
    </Card>
  )
}