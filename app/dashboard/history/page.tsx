"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Clock, Search } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"

export default function HistoryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [attacks, setAttacks] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

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

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profileData) {
        setProfile(profileData)
      }

      // Get attack history
      const { data: attacksData } = await supabase
        .from("attack_history")
        .select("*, attack_methods(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (attacksData) {
        setAttacks(attacksData)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [router])

  // Filter attacks based on search query
  const filteredAttacks = attacks.filter(
    (attack) =>
      attack.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (attack.attack_methods as any)?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout isAdmin={profile?.role === "admin"}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">Attack History</h1>
          <p className="text-white/70">View all your previous attacks</p>
        </div>

        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Your Attacks</CardTitle>
                <CardDescription className="text-white/70">Complete history of all your attacks</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search attacks..."
                  className="pl-8 bg-black/50 border-white/20 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Clock className="h-8 w-8 animate-spin text-white/50" />
              </div>
            ) : filteredAttacks.length > 0 ? (
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Target</TableHead>
                      <TableHead className="text-white">Method</TableHead>
                      <TableHead className="text-white">Duration</TableHead>
                      <TableHead className="text-white">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttacks.map((attack) => (
                      <TableRow key={attack.id} className="border-white/10">
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                attack.status === "completed"
                                  ? "bg-green-500"
                                  : attack.status === "running"
                                    ? "bg-blue-500"
                                    : attack.status === "failed"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                              }`}
                            />
                            <span className="capitalize">{attack.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {attack.host}:{attack.port}
                        </TableCell>
                        <TableCell>{(attack.attack_methods as any)?.name}</TableCell>
                        <TableCell>{attack.time} seconds</TableCell>
                        <TableCell>{formatDate(attack.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-white/70">
                <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No attacks found</h3>
                <p className="text-sm">
                  {searchQuery ? "Try a different search term" : "Start your first attack to see it here"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
