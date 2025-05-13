"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/app/components/admin/Sidebar"
import AddEmployee from "@/app/components/employee/AddEmployeeForm"
import AddDepartment from "@/app/components/admin/department"
import AddTarget from "@/app/components/admin/AddTarget"
import DepartmentList from "@/app/admin/DepartmentList"
import AdminForm from "../components/admin/adminform"
import ManagerForm from "../components/managers/addManagerForm"
import { Menu, X } from "lucide-react"
import LeadTracker from "../tracker/page"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // ✅ Check if user is authenticated using the API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/admin/verify", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          // Add cache: 'no-store' to prevent caching of the verification request
          cache: "no-store",
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          console.log("❌ Authentication failed, redirecting to login...")
          router.push("/admin-login")
          return
        }

        // Authentication successful
        setIsLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/admin-login")
      }
    }

    checkAuth()
  }, [router])

  const renderContent = () => {
    switch (activeTab) {
      case "add-admin":
        return <AdminForm />
      case "add-manager":
        return <ManagerForm />
      case "add-employee":
        return <AddEmployee />
      case "set-department-target":
        return <AddDepartment />
      case "set-target":
        return <AddTarget />
      case "tracker": // Fixed the case name to match the sidebar
        return <LeadTracker />
      case "dashboard":
      default:
        return <DepartmentList />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md flex justify-center">
          <div className="animate-pulse">Checking authentication...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 w-64 bg-gray-800 text-white transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 
        h-full min-h-screen overflow-y-auto z-50`}
      >
        {/* Mobile Close Button */}
        <div className="flex justify-between items-center p-4 md:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
        </div>

        {/* Main Content Section */}
        <main className="flex-1 p-4 md:p-8 bg-blue-300 text-black overflow-y-auto">
          <h1 className="hidden md:block text-3xl font-bold mb-6 text-white text-center">Super Admin Dashboard</h1>
          <div className="bg-white p-4 rounded-lg shadow-md overflow-hidden">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
