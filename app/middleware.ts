import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define which paths require authentication
  const isManagerProtectedRoute = path.startsWith("/manager-dashboard")
  const isEmployeeProtectedRoute = path.startsWith("/employee/")

  // Get the token from the cookies or authorization header
  const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.split(" ")[1] || ""

  if (!token) {
    // No token found, redirect to login
    if (isManagerProtectedRoute) {
      return NextResponse.redirect(new URL("/manager-login", request.url))
    }
    if (isEmployeeProtectedRoute) {
      return NextResponse.redirect(new URL("/employee-login", request.url))
    }
  } else {
    // Token found, verify it
    try {
      const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

      await jwtVerify(token, SECRET_KEY)

      // Token is valid, continue
      return NextResponse.next()
    } catch (error) {
      // Token is invalid, redirect to login
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

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/manager-dashboard/:path*", "/employee/:path*"],
}
