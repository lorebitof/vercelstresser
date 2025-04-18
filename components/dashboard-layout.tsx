"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Zap,
  History,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Package,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

interface DashboardLayoutProps {
  children: React.ReactNode
  isAdmin?: boolean
}

export function DashboardLayout({ children, isAdmin = false }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Launch Attack",
      href: "/dashboard/attack",
      icon: Zap,
    },
    {
      name: "Attack History",
      href: "/dashboard/history",
      icon: History,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const adminNavItems = [
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Plans",
      href: "/admin/plans",
      icon: Package,
    },
    {
      name: "Attack Methods",
      href: "/admin/methods",
      icon: Shield,
    },
  ]

  return (
    <div className="min-h-screen gradient-bg">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile menu */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/95 border-r border-white/10 transform transition-transform duration-200 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">Global Stresser</h1>
          <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.href
                    ? "bg-primary/20 text-primary"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <button
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  >
                    <div className="flex items-center">
                      <Shield className="mr-3 h-5 w-5" />
                      Admin
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isAdminMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isAdminMenuOpen && (
                    <div className="pl-10 space-y-1 mt-1">
                      {adminNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            pathname === item.href
                              ? "bg-primary/20 text-primary"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-black/50 backdrop-blur-sm border-r border-white/10">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-white/10">
            <h1 className="text-xl font-bold text-white">Global Stresser</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? "bg-primary/20 text-primary"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}

              {isAdmin && (
                <>
                  <div className="pt-4 pb-2">
                    <h3 className="px-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Admin</h3>
                  </div>
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pathname === item.href
                          ? "bg-primary/20 text-primary"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
          <div className="flex-shrink-0 p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="flex-1 flex justify-between px-4">
            <div className="flex-1 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white mr-2"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="py-6 px-4 sm:px-6 md:py-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}
