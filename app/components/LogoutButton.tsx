"use client"

// import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
//   const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        // Force a hard navigation to clear any client-side state
        window.location.href = "/admin-login"
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  )
}
