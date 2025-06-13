"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./authProvider"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/manager-login")
    }
  }, [isAuthenticated, router])

  // Don't render children until authentication check is complete
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
