"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Clock, Database, Home, LogOut, Settings, Shield, Users, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isAdmin?: boolean
}

export function Sidebar({ className, isAdmin = false, ...props }: SidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className={cn("pb-12 gradient-bg min-h-screen", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight text-white">Global Stresser</h2>
          <div className="space-y-1">
            <Link href="/dashboard" passHref>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:text-white hover:bg-primary/20",
                  pathname === "/dashboard" && "bg-primary/20",
                )}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/attack" passHref>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:text-white hover:bg-primary/20",
                  pathname === "/dashboard/attack" && "bg-primary/20",
                )}
              >
                <Zap className="mr-2 h-4 w-4" />
                New Attack
              </Button>
            </Link>
            <Link href="/dashboard/history" passHref>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:text-white hover:bg-primary/20",
                  pathname === "/dashboard/history" && "bg-primary/20",
                )}
              >
                <Clock className="mr-2 h-4 w-4" />
                History
              </Button>
            </Link>
            <Link href="/dashboard/settings" passHref>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:text-white hover:bg-primary/20",
                  pathname === "/dashboard/settings" && "bg-primary/20",
                )}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {isAdmin && (
          <div className="px-4 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-white">Administration</h2>
            <div className="space-y-1">
              <Link href="/admin/users" passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:text-white hover:bg-primary/20",
                    pathname === "/admin/users" && "bg-primary/20",
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </Button>
              </Link>
              <Link href="/admin/plans" passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:text-white hover:bg-primary/20",
                    pathname === "/admin/plans" && "bg-primary/20",
                  )}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Plans
                </Button>
              </Link>
              <Link href="/admin/methods" passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:text-white hover:bg-primary/20",
                    pathname === "/admin/methods" && "bg-primary/20",
                  )}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Methods
                </Button>
              </Link>
              <Link href="/admin/stats" passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:text-white hover:bg-primary/20",
                    pathname === "/admin/stats" && "bg-primary/20",
                  )}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Statistics
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="px-4 py-2 absolute bottom-4 w-full">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:text-white hover:bg-primary/20"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
