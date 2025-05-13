import { NextResponse } from "next/server"

// Make sure the cookie is properly cleared with the correct path and domain settings
export async function POST() {
  // Create a response
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  })

  // Clear the admin-token cookie with proper settings
  response.cookies.set({
    name: "admin-token",
    value: "",
    expires: new Date(0), // Expire immediately
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })

  return response
}
