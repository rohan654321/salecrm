"use client"

import {
  ArrowLeft,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Target,
  UserPlus,
  Users,
  BarChart,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include", // 🔐 Include cookies in request
      })

      if (res.ok) {
        localStorage.removeItem("token")
        localStorage.removeItem("employee")
        localStorage.removeItem("isAuthenticated")
        console.log("🔑 Token and session cleared successfully")
        router.push("/")
      } else {
        const errorData = await res.json()
        console.error("Logout failed:", errorData)
        alert("Logout failed. Please try again.")
      }
    } catch (error) {
      console.error("Logout error:", error)
      alert("Something went wrong during logout.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col min-h-screen fixed">
      <h2 className="text-xl font-bold mb-16 text-center">Admin Panel</h2>

      {/* Add Admin */}
      <button
        className={`py-2 px-4 mb-2 rounded w-full flex items-center ${activeTab === "add-admin" ? "bg-blue-700" : ""}`}
        onClick={() => setActiveTab("add-admin")}
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Add Admin
      </button>

      {/* Add Manager */}
      <button
        className={`py-2 px-4 mb-2 rounded w-full flex items-center ${activeTab === "add-manager" ? "bg-blue-700" : ""}`}
        onClick={() => setActiveTab("add-manager")}
      >
        <Users className="w-5 h-5 mr-2" />
        Add Manager
      </button>

      {/* Add Employee */}
      <button
        className={`py-2 px-4 mb-2 rounded w-full flex items-center ${activeTab === "add-employee" ? "bg-blue-700" : ""}`}
        onClick={() => setActiveTab("add-employee")}
      >
        <Briefcase className="w-5 h-5 mr-2" />
        Add Employee
      </button>

      {/* Add New Project */}
      <button
        className={`py-2 px-4 mb-2 rounded w-full flex items-center ${activeTab === "set-department-target" ? "bg-blue-700" : ""}`}
        onClick={() => setActiveTab("set-department-target")}
      >
        <Target className="w-5 h-5 mr-2" />
        Add New Project
      </button>

      {/* Set Targets */}
      <button
        className={`py-2 px-4 mb-2 rounded w-full flex items-center ${activeTab === "set-target" ? "bg-blue-700" : ""}`}
        onClick={() => setActiveTab("set-target")}
      >
        <Target className="w-5 h-5 mr-2" />
        Set Targets
      </button>

      {/* Leads Tracker */}
      <button
        className={`py-2 px-4 mb-2 rounded w-full flex items-center ${activeTab === "employeeTrackerDashboard" ? "bg-blue-700" : ""}`}
        onClick={() => setActiveTab("tracker")}
      >
        <BarChart className="w-5 h-5 mr-2" />
        Leads Tracker
      </button>

      {/* Dashboard */}
      <button
        className={`py-2 px-4 mb-2 rounded w-full flex items-center ${activeTab === "dashboard" ? "bg-blue-700" : ""}`}
        onClick={() => setActiveTab("dashboard")}
      >
        <LayoutDashboard className="w-5 h-5 mr-2" />
        Dashboard
      </button>

      <div className="flex-grow" />

      {/* Back Button */}
      <button
        className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded mb-2 flex items-center"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Logout Button */}
      <button
        className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center disabled:opacity-50"
        onClick={handleLogout}
        disabled={loading}
      >
        <LogOut className="w-5 h-5 mr-2" />
        {loading ? "Logging out..." : "Logout"}
      </button>
    </aside>
  )
}
