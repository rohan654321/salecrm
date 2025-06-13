"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import jwt from "jsonwebtoken"

interface AuthContextType {
  isAuthenticated: boolean
  manager: any | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  manager: null,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [manager, setManager] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const storedManager = localStorage.getItem("manager")

      if (!token) {
        setIsAuthenticated(false)
        setManager(null)
        setIsLoading(false)
        return false
      }

      try {
        // Verify token is valid (this is a basic check, server should validate too)
        const decodedToken = jwt.decode(token)

        // Check if token is expired
        if (decodedToken && typeof decodedToken !== "string" && decodedToken.exp) {
          const currentTime = Math.floor(Date.now() / 1000)
          if (decodedToken.exp < currentTime) {
            // Token expired
            localStorage.removeItem("token")
            localStorage.removeItem("manager")
            setIsAuthenticated(false)
            setManager(null)
            setIsLoading(false)
            return false
          }
        }

        setIsAuthenticated(true)
        setManager(storedManager ? JSON.parse(storedManager) : null)
        setIsLoading(false)
        return true
      } catch (error) {
        console.error("Auth error:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("manager")
        setIsAuthenticated(false)
        setManager(null)
        setIsLoading(false)
        return false
      }
    }

    checkAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("manager")
    setIsAuthenticated(false)
    setManager(null)
    router.push("/manager-login")
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <AuthContext.Provider value={{ isAuthenticated, manager, logout }}>{children}</AuthContext.Provider>
}
