"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Pencil, Trash2, DollarSign, Clock, Shield } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

const planFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  max_concurrent_attacks: z.coerce.number().int().min(1, {
    message: "Must be at least 1.",
  }),
  max_time: z.coerce.number().int().min(1, {
    message: "Must be at least 1 second.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
})

export default function AdminPlansPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [editingPlan, setEditingPlan] = useState<any>(null)

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      max_concurrent_attacks: 1,
      max_time: 60,
      price: 0,
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
    if (editingPlan) {
      form.reset({
        name: editingPlan.name,
        max_concurrent_attacks: editingPlan.max_concurrent_attacks,
        max_time: editingPlan.max_time,
        price: editingPlan.price,
      })
    } else {
      form.reset({
        name: "",
        max_concurrent_attacks: 1,
        max_time: 60,
        price: 0,
      })
    }
  }, [editingPlan, form])

  async function onSubmit(values: z.infer<typeof planFormSchema>) {
    setIsSubmitting(true)

    try {
      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from("plans")
          .update({
            name: values.name,
            max_concurrent_attacks: values.max_concurrent_attacks,
            max_time: values.max_time,
            price: values.price,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPlan.id)

        if (error) throw error

        toast({
          title: "Plan Updated",
          description: `Plan ${values.name} has been updated successfully.`,
        })
      } else {
        // Create new plan
        const { error } = await supabase.from("plans").insert([
          {
            name: values.name,
            max_concurrent_attacks: values.max_concurrent_attacks,
            max_time: values.max_time,
            price: values.price,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (error) throw error

        toast({
          title: "Plan Created",
          description: `Plan ${values.name} has been created successfully.`,
        })
      }

      // Refresh plan list
      const { data: plansData } = await supabase.from("plans").select("*").order("price", { ascending: true })

      if (plansData) {
        setPlans(plansData)
      }

      // Reset form and editing state
      form.reset()
      setEditingPlan(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deletePlan(planId: string) {
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)

    try {
      // Check if plan is in use
      const { data: usersWithPlan, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("plan_id", planId)

      if (checkError) throw checkError

      if (usersWithPlan && usersWithPlan.length > 0) {
        throw new Error(`Cannot delete plan because it is assigned to ${usersWithPlan.length} user(s).`)
      }

      // Delete plan
      const { error } = await supabase.from("plans").delete().eq("id", planId)

      if (error) throw error

      // Refresh plan list
      const { data: plansData } = await supabase.from("plans").select("*").order("price", { ascending: true })

      if (plansData) {
        setPlans(plansData)
      }

      toast({
        title: "Plan Deleted",
        description: "Plan has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout isAdmin={true}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">Plan Management</h1>
          <p className="text-white/70">Manage subscription plans</p>
        </div>

        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader>
            <CardTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</CardTitle>
            <CardDescription className="text-white/70">
              {editingPlan ? "Update plan details" : "Add a new subscription plan"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Plan Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Basic, Pro, Enterprise"
                            className="bg-black/50 border-white/20 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Price (USD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              className="bg-black/50 border-white/20 text-white pl-8"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_concurrent_attacks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Max Concurrent Attacks</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Shield className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                            <Input type="number" {...field} className="bg-black/50 border-white/20 text-white pl-8" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Max Attack Time (seconds)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                            <Input type="number" {...field} className="bg-black/50 border-white/20 text-white pl-8" />
                          </div>
                        </FormControl>
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
                        {editingPlan ? "Updating..." : "Creating..."}
                      </>
                    ) : editingPlan ? (
                      "Update Plan"
                    ) : (
                      "Create Plan"
                    )}
                  </Button>

                  {editingPlan && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => setEditingPlan(null)}
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
            <CardTitle>Plans</CardTitle>
            <CardDescription className="text-white/70">Manage all subscription plans</CardDescription>
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
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-white">Price</TableHead>
                      <TableHead className="text-white">Max Concurrent</TableHead>
                      <TableHead className="text-white">Max Time</TableHead>
                      <TableHead className="text-white text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id} className="border-white/10">
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>${plan.price.toFixed(2)}</TableCell>
                        <TableCell>{plan.max_concurrent_attacks}</TableCell>
                        <TableCell>{plan.max_time} seconds</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                              onClick={() => setEditingPlan(plan)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => deletePlan(plan.id)}
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
