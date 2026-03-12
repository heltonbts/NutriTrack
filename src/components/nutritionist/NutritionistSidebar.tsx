"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Home, Users, LogOut } from "lucide-react"

const navItems = [
  { href: "/dashboard/nutritionist", label: "Início", icon: Home },
  { href: "/dashboard/nutritionist/patients", label: "Pacientes", icon: Users },
]

interface SidebarUser {
  name: string | null
  email: string | null
  image: string | null
}

export default function NutritionistSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()

  const Avatar = ({ size }: { size: "sm" | "lg" }) => {
    const dim = size === "lg" ? "w-10 h-10" : "w-7 h-7"
    return user.image ? (
      <div className={`${dim} rounded-full overflow-hidden flex-shrink-0 ring-2 ring-brand-purple`}>
        <Image src={user.image} alt={user.name ?? ""} width={40} height={40} className="object-cover w-full h-full" />
      </div>
    ) : (
      <div className={`${dim} rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0`}>
        <span className={`font-bold text-white ${size === "lg" ? "text-sm" : "text-xs"}`}>
          {user.name?.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🥗</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">Evolux</p>
              <p className="text-xs text-gray-500">Nutricionista</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/dashboard/nutritionist" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-teal/10 text-brand-teal"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-brand-teal" : "text-gray-400")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/dashboard/nutritionist" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors",
                isActive ? "text-brand-teal" : "text-gray-400"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium text-gray-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </nav>
    </>
  )
}
