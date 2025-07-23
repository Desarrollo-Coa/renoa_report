"use client"

import { User } from "lucide-react"

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">COC</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">CENTRAL DE OPERACIONES COSTA</span>
          </div>

          {/* Perfil */}
          <button className="rounded-full p-2 hover:bg-gray-100 transition">
            <User className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </nav>
  )
}
