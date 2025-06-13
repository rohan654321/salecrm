"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import jwt from "jsonwebtoken"

interface EmployeeAuthContextType {
  isAuthenticated: boolean
  employee: any | null
  logout: () => void
}

const EmployeeAuthContext = createContext<EmployeeAuthContextType>({
  isAuthenticated: false,
  employee: null,
  logout: () => {},
})

export const useEmployeeAuth = () => useContext(EmployeeAuthContext)

export function EmployeeAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [employee, setEmployee] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const storedEmployee = localStorage.getItem("employee")
      const tokenInvalidationTime = localStorage.getItem("tokenInvalidationTime")

      if (!token) {
        setIsAuthenticated(false)
        setEmployee(null)
        setIsLoading(false)
        return false
      }

      try {
        // Check if token has been manually invalidated
        if (tokenInvalidationTime) {
          const invalidationTime = Number.parseInt(tokenInvalidationTime, 10)
          const tokenData = jwt.decode(token)

          // If token was issued before invalidation time, it's invalid
          if (tokenData && typeof tokenData !== "string" && tokenData.iat && tokenData.iat * 1000 < invalidationTime) {
            localStorage.removeItem("token")
            localStorage.removeItem("employee")
            setIsAuthenticated(false)
            setEmployee(null)
            setIsLoading(false)
            return false
          }
        }

        // Verify token is valid
        const decodedToken = jwt.decode(token)

        // Check if token is expired
        if (decodedToken && typeof decodedToken !== "string" && decodedToken.exp) {
          const currentTime = Math.floor(Date.now() / 1000)
          if (decodedToken.exp < currentTime) {
            // Token expired
            await handleLogout(false)
            return false
          }
        }

        setIsAuthenticated(true)
        setEmployee(storedEmployee ? JSON.parse(storedEmployee) : null)
        setIsLoading(false)
        return true
      } catch (error) {
        console.error("Auth error:", error)
        await handleLogout(false)
        return false
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async (redirect = true) => {
    // Set invalidation timestamp for all previous tokens
    localStorage.setItem("tokenInvalidationTime", Date.now().toString())

    // Clear auth data
    localStorage.removeItem("token")
    localStorage.removeItem("employee")
    localStorage.removeItem("isAuthenticated")

    // Update state
    setIsAuthenticated(false)
    setEmployee(null)

    // Redirect if needed
    if (redirect) {
      router.push("/employee-login")
    }
  }

  const logout = () => handleLogout(true)

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <EmployeeAuthContext.Provider value={{ isAuthenticated, employee, logout }}>
      {children}
    </EmployeeAuthContext.Provider>
  )
}
