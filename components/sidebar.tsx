// sidebar
"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  Table,
  Receipt,
  CuboidIcon as Cube,
  Languages,
  Bell,
  User,
  LogIn,
  UserPlus,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, current: true },
  { name: "Tables", href: "/tables", icon: Table, current: false },
  { name: "Billing", href: "/billing", icon: Receipt, current: false },
  { name: "Virtual Reality", href: "/vr", icon: Cube, current: false },
  { name: "RTL", href: "/rtl", icon: Languages, current: false },
  { name: "Notifications", href: "/notifications", icon: Bell, current: false },
]

const accountPages = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Sign In", href: "/signin", icon: LogIn },
  { name: "Sign Up", href: "/signup", icon: UserPlus },
]

export function Sidebar() {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center px-6 py-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="ml-3 text-sm font-semibold text-gray-900">Creative Tim</span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  item.current
                    ? "bg-gradient-to-r from-gray-800 to-gray-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}

          <div className="pt-6">
            <h6 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Pages</h6>
            <div className="mt-2 space-y-1">
              {accountPages.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Footer buttons */}
        <div className="p-4 space-y-2">
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Documentation
          </button>
          <button className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg hover:from-gray-700 hover:to-gray-500 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  )
}
