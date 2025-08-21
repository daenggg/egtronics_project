"use client"

import { useAuth } from "@/contexts/auth-context"
import Profile from "@/components/ui/profile"
import { CategoryFilter } from "@/components/category-filter"

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useAuth()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 bg-white/95 backdrop-blur-sm shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto pt-20
        `}
      >
        <div className="space-y-6 px-4 w-64">
          <Profile />
          <CategoryFilter onCategorySelect={toggleSidebar} />
        </div>
      </aside>
    </>
  )
}