import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Verificar se a rota é para acessar arquivos de upload
  if (request.nextUrl.pathname.startsWith("/uploads/user-files")) {
    const token = await getToken({ req: request })

    // Se não estiver autenticado, redirecionar para login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Permitir acesso aos arquivos
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/uploads/:path*"],
}
