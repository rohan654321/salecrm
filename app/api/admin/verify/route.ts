import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    // Check if the user has admin role
    if (payload.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      message: "Authenticated",
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
  }
}
