"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"
import jwt from "jsonwebtoken"

interface Employee {
  id: string
  name: string
  email: string
  // Add more fields as needed
}

interface EmployeeAuthContextType {
  isAuthenticated: boolean
  employee: Employee | null
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
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const handleLogout = useCallback(
    async (redirect = true) => {
      localStorage.setItem("tokenInvalidationTime", Date.now().toString())
      localStorage.removeItem("token")
      localStorage.removeItem("employee")
      localStorage.removeItem("isAuthenticated")

      setIsAuthenticated(false)
      setEmployee(null)

      if (redirect) {
        router.push("/employee-login")
      }
    },
    [router]
  )

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const storedEmployee = localStorage.getItem("employee")
      const tokenInvalidationTime = localStorage.getItem("tokenInvalidationTime")

      if (!token) {
        setIsAuthenticated(false)
        setEmployee(null)
        setIsLoading(false)
        return
      }

      try {
        if (tokenInvalidationTime) {
          const invalidationTime = Number.parseInt(tokenInvalidationTime, 10)
          const tokenData = jwt.decode(token)

          if (
            tokenData &&
            typeof tokenData !== "string" &&
            tokenData.iat &&
            tokenData.iat * 1000 < invalidationTime
          ) {
            await handleLogout(false)
            setIsLoading(false)
            return
          }
        }

        const decodedToken = jwt.decode(token)

        if (decodedToken && typeof decodedToken !== "string" && decodedToken.exp) {
          const currentTime = Math.floor(Date.now() / 1000)
          if (decodedToken.exp < currentTime) {
            await handleLogout(false)
            setIsLoading(false)
            return
          }
        }

        setIsAuthenticated(true)
        setEmployee(storedEmployee ? JSON.parse(storedEmployee) : null)
        setIsLoading(false)
      } catch (error) {
        console.error("Auth error:", error)
        await handleLogout(false)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [handleLogout])

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
