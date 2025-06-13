import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define which paths require authentication
  const isManagerProtectedRoute = path.startsWith("/manager-dashboard")
  const isEmployeeProtectedRoute = path.startsWith("/employee/")

  // Get token from cookies or authorization header
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.split(" ")[1] ||
    ""

  if (!token) {
    // No token, redirect based on route
    if (isManagerProtectedRoute) {
      return NextResponse.redirect(new URL("/manager-login", request.url))
    }
    if (isEmployeeProtectedRoute) {
      return NextResponse.redirect(new URL("/employee-login", request.url))
    }
  } else {
    try {
      const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
      await jwtVerify(token, SECRET_KEY)
      return NextResponse.next()
    } catch {
      // Invalid token, redirect accordingly
      if (isManagerProtectedRoute) {
        return NextResponse.redirect(new URL("/manager-login", request.url))
      }
      if (isEmployeeProtectedRoute) {
        return NextResponse.redirect(new URL("/employee-login", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/manager-dashboard/:path*", "/employee/:path*"],
}
