import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Check if user is authenticated
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Check if user is trying to access admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // If user is not an admin, redirect to editais page
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/editais", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/inscricoes/:path*"],
}
