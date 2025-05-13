import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key" // Keep this secret and use .env

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (!admin) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT Token
    const token = jwt.sign({ id: admin.id, email: admin.email, role: "admin" }, SECRET_KEY, { expiresIn: "1h" })

    console.log("🔑 Generated Token:", token)

    // Create a response with the token
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token,
    })

    // Set the token as an HTTP-only cookie
    response.cookies.set({
      name: "admin-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour
      sameSite: "strict",
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Login Error:", error)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
