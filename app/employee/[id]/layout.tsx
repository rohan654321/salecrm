import type React from "react"
import { EmployeeAuthProvider } from "@/app/components/employee/employee-auth-provider"
import EmployeeProtectedRoute from "@/app/components/employee/employee-protected-route"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EmployeeAuthProvider>
      <EmployeeProtectedRoute>{children}</EmployeeProtectedRoute>
    </EmployeeAuthProvider>
  )
}
