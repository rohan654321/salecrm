import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Check if the request is for the admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Exclude the login page from protection
    if (request.nextUrl.pathname === "/admin-login") {
      return NextResponse.next()
    }

    // Get the token from the cookies or authorization header
    const token = request.cookies.get("admin-token")?.value || request.headers.get("Authorization")?.split(" ")[1]

    // If no token is present, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/admin-login", request.url))
    }

    try {
      // Verify the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)

      // If token is valid, continue to the protected route
      return NextResponse.next()
    } catch (error) {
      // If token is invalid, redirect to login
      console.error("Invalid token:", error)
      return NextResponse.redirect(new URL("/admin-login", request.url))
    }
  }

  // For non-admin routes, continue normally
  return NextResponse.next()
}

// Configure the middleware to run only on admin routes
export const config = {
  matcher: ["/admin/:path*", "/admin-login"],
}
