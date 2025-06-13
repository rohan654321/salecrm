import type React from "react"
import { AuthProvider } from "@/app/components/authProvider"
import ProtectedRoute from "@/app/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>{children}</ProtectedRoute>
    </AuthProvider>
  )
}
