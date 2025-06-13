"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEmployeeAuth } from "./employee-auth-provider"

export default function EmployeeProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useEmployeeAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/employee-login")
    }
  }, [isAuthenticated, router])

  // Don't render children until authentication check is complete
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
