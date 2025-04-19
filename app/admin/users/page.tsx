"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Search, Pencil, Trash2 } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

const userFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z
    .string()
    .min(6, {
      message: "Password must be at least 6 characters.",
    })
    .optional()
    .or(z.literal("")),
  role: z.string().min(1, {
    message: "Role is required.",
  }),
  plan_id: z.string().optional().or(z.literal("")),
})

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState<any>(null)

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "user",
      plan_id: "",
    },
  })

  useEffect(() => {
    async function fetchData() {
      // Check if user is admin
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("username, role").eq("id", user.id).single()

      if (!profile || profile.role !== "admin" || !["Hypexx", "tcpnfo"].includes(profile.username)) {
        router.push("/dashboard")
        return
      }

      // Get all users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*, plans(*)")
        .order("created_at", { ascending: false })

      if (usersData) {
        setUsers(usersData)
      }

      // Get all plans
      const { data: plansData } = await supabase.from("plans").select("*").order("price", { ascending: true })

      if (plansData) {
        setPlans(plansData)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [router])

  useEffect(() => {
    if (editingUser) {
      form.reset({
        username: editingUser.username,
        password: "", // Don't populate password
        role: editingUser.role,
        plan_id: editingUser.plan_id || "",
      })
    } else {
      form.reset({
        username: "",
        password: "",
        role: "user",
        plan_id: "",
      })
    }
  }, [editingUser, form])

  async function onSubmit(values: z.infer<typeof userFormSchema>) {
    setIsSubmitting(true)

    try {
      if (editingUser) {
        // Atualizar usuário existente
        const updates: any = {
          username: values.username,
          role: values.role,
          plan_id: values.plan_id || null,
        }

        // Buscar os valores do plano selecionado
        if (values.plan_id) {
          const { data: selectedPlan, error: planError } = await supabase
            .from("plans")
            .select("max_time, max_concurrent_attacks")
            .eq("id", values.plan_id)
            .single()

          if (planError) throw planError

          if (selectedPlan) {
            updates.max_time = selectedPlan.max_time
            updates.max_concurrent_attacks = selectedPlan.max_concurrent_attacks
          }
        } else {
          // Se nenhum plano for selecionado, redefinir os valores para padrões
          updates.max_time = 0
          updates.max_concurrent_attacks = 1
        }

        const { error } = await supabase.from("profiles").update(updates).eq("id", editingUser.id)

        if (error) throw error

        // Atualizar senha se fornecida
        if (values.password) {
          // Em uma aplicação real, você precisaria usar privilégios de administrador para atualizar a senha
          console.log("Would update password for user", editingUser.id)
        }

        toast({
          title: "User Updated",
          description: `User ${values.username} has been updated successfully.`,
        })
      } else {
        // Criar novo usuário
        const { data, error } = await supabase.auth.admin.createUser({
          email: `${values.username}@example.com`,
          password: values.password as string,
          email_confirm: true,
        })

        if (error) throw error

        if (data.user) {
          // Criar perfil
          const profileData: any = {
            id: data.user.id,
            username: values.username,
            role: values.role,
            plan_id: values.plan_id || null,
          }

          // Buscar os valores do plano selecionado
          if (values.plan_id) {
            const { data: selectedPlan, error: planError } = await supabase
              .from("plans")
              .select("max_time, max_concurrent_attacks")
              .eq("id", values.plan_id)
              .single()

            if (planError) throw planError

            if (selectedPlan) {
              profileData.max_time = selectedPlan.max_time
              profileData.max_concurrent_attacks = selectedPlan.max_concurrent_attacks
            }
          } else {
            // Se nenhum plano for selecionado, definir valores padrão
            profileData.max_time = 0
            profileData.max_concurrent_attacks = 1
          }

          const { error: profileError } = await supabase.from("profiles").insert([profileData])

          if (profileError) throw profileError
        }

        toast({
          title: "User Created",
          description: `User ${values.username} has been created successfully.`,
        })
      }

      // Atualizar lista de usuários
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*, plans(*)")
        .order("created_at", { ascending: false })

      if (usersData) {
        setUsers(usersData)
      }

      // Resetar formulário e estado de edição
      form.reset()
      setEditingUser(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)

    try {
      // Delete user using Supabase Admin API
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) throw error

      // Refresh user list
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*, plans(*)")
        .order("created_at", { ascending: false })

      if (usersData) {
        setUsers(usersData)
      }

      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout isAdmin={true}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-white/70">Manage users and their permissions</p>
        </div>

        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "Create New User"}</CardTitle>
            <CardDescription className="text-white/70">
              {editingUser ? "Update user details" : "Add a new user to the system"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black/50 border-white/20 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                        </FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="bg-black/50 border-white/20 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/20 text-white">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black border-white/20 text-white">
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="plan_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Plan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/20 text-white">
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black border-white/20 text-white">
                            <SelectItem value="none">No Plan</SelectItem>
                            {plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} (${plan.price.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="gradient" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingUser ? "Updating..." : "Creating..."}
                      </>
                    ) : editingUser ? (
                      "Update User"
                    ) : (
                      "Create User"
                    )}
                  </Button>

                  {editingUser && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription className="text-white/70">Manage all users in the system</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search users..."
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
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              </div>
            ) : (
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow>
                      <TableHead className="text-white">Username</TableHead>
                      <TableHead className="text-white">Role</TableHead>
                      <TableHead className="text-white">Plan</TableHead>
                      <TableHead className="text-white">Created</TableHead>
                      <TableHead className="text-white text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-white/10">
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${user.role === "admin" ? "bg-primary/20 text-primary border-primary/30" : "bg-white/10 text-white/70 border-white/20"} capitalize`}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.plans?.name || "No Plan"}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                              onClick={() => setEditingUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
