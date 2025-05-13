import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const secretKey = process.env.JWT_SECRET
    if (!secretKey) {
      throw new Error("JWT_SECRET not defined")
    }

    const secret = new TextEncoder().encode(secretKey)
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    })

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
