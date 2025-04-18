"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap, Clock, History, Settings, Shield, Loader2 } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<{
    id: string
    username: string // Adicionado
    role: string
    concurrent_attacks: number
    max_concurrent_attacks: number
    max_time: number
    plans?: { name: string; price: number }
  } | null>(null)
  const [attackHistory, setAttackHistory] = useState<any[]>([])
  const [methods, setMethods] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      // Get user profile
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profileData } = await supabase.from("profiles").select("*, plans(*)").eq("id", user.id).single()

      if (profileData) {
        setProfile({
          ...profileData,
          max_concurrent_attacks: profileData.plans?.max_concurrent_attacks || profileData.max_concurrent_attacks || 0,
          max_time: profileData.plans?.max_time || profileData.max_time || 0,
        })
      }

      // Get attack methods
      const { data: methodsData } = await supabase.from("attack_methods").select("*")

      if (methodsData) {
        setMethods(methodsData)
      }

      // Get attack history
      const { data: historyData } = await supabase
        .from("attack_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (historyData) {
        setAttackHistory(historyData)
      }

      // Atualizar ataques concorrentes e status dos ataques
      const { data: updatedHistory } = await supabase
        .from("attack_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (updatedHistory) {
        const runningAttacks = updatedHistory.filter((attack) => attack.status === "running").length
        const completedAttacks = updatedHistory.filter((attack) => attack.status === "completed").length

        setProfile((prev) => {
          if (!prev) return null // Garantir que prev não seja null
          return {
            ...prev,
            concurrent_attacks: runningAttacks, // Atualiza apenas os ataques em execução
          }
        })

        // Atualizar o status dos ataques no histórico
        const updatedStatusHistory = updatedHistory.map((attack) => {
          if (attack.status === "running" && completedAttacks > 0) {
            return { ...attack, status: "completed" }
          }
          return attack
        })

        setAttackHistory(updatedStatusHistory)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [router])

  // Function to get method name by ID
  const getMethodName = (methodId: string) => {
    const method = methods.find((m) => m.id === methodId)
    return method ? method.name : "Unknown"
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      case "running":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30"
    }
  }

  return (
    <DashboardLayout isAdmin={profile?.role === "admin"}>
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-white/70">Welcome back, {profile?.username || "User"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/30 border-white/10 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{profile?.plans?.name || "Free"}</div>
                  <div className="text-white/70 text-sm">
                    {profile?.plans ? `$${profile.plans.price.toFixed(2)}/month` : "No active subscription"}
                  </div>
                  <Link href="https://t.me/udpnfo" passHref>
                    <Button variant="outline" size="sm" className="mt-4 border-white/20 text-white hover:bg-white/10">
                      Upgrade Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-white/10 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-primary" />
                    Concurrent Attacks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl font-bold">{profile?.concurrent_attacks || 0}</span>
                    <span className="text-white/70">/ {profile?.max_concurrent_attacks || 0}</span>
                  </div>
                  <Progress
                    value={
                      profile?.max_concurrent_attacks
                        ? (profile.concurrent_attacks / profile.max_concurrent_attacks) * 100
                        : 0
                    }
                    className="h-2 bg-white/10"
                  />
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-white/10 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Max Attack Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{profile?.max_time || 0} seconds</div>
                  <div className="text-white/70 text-sm">Maximum duration per attack</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-black/30 border-white/10 text-white lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Attacks</CardTitle>
                    <CardDescription className="text-white/70">Your recent attack history</CardDescription>
                  </div>
                  <Link href="/dashboard/history" passHref>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      <History className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {attackHistory.length > 0 ? (
                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-white/5">
                          <TableRow>
                            <TableHead className="text-white">Target</TableHead>
                            <TableHead className="text-white">Method</TableHead>
                            <TableHead className="text-white">Time</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-white">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attackHistory.map((attack) => (
                            <TableRow key={attack.id} className="border-white/10">
                              <TableCell className="font-medium">
                                {attack.host}:{attack.port}
                              </TableCell>
                              <TableCell>{getMethodName(attack.method_id)}</TableCell>
                              <TableCell>{attack.time}s</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`${getStatusColor(attack.status)} capitalize`}>
                                  {attack.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white/70">{formatDate(attack.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/70">No attack history found</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-white/10 text-white">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription className="text-white/70">Common tasks and actions</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Link href="/dashboard/attack" passHref>
                    <Button variant="gradient" className="w-full justify-start">
                      <Zap className="mr-2 h-4 w-4" />
                      Launch Attack
                    </Button>
                  </Link>
                  <Link href="/dashboard/history" passHref>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                    >
                      <History className="mr-2 h-4 w-4" />
                      View Attack History
                    </Button>
                  </Link>
                  <Link href="/dashboard/settings" passHref>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
