"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Shield, Clock } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: "Current password must be at least 6 characters.",
    }),
    newPassword: z.string().min(6, {
      message: "New password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Confirm password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

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
        setProfile(profileData)
      }

      // Get available plans
      const { data: plansData } = await supabase.from("plans").select("*").order("price", { ascending: true })

      if (plansData) {
        setPlans(plansData)
      }
    }

    fetchData()
  }, [router])

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsLoading(true)

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      })

      if (error) throw error

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      })

      passwordForm.reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function upgradePlan(planId: string) {
    setIsLoading(true)

    try {
      // In a real application, you would handle payment processing here

      // Update user's plan
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { error } = await supabase.from("profiles").update({ plan_id: planId }).eq("id", user.id)

      if (error) throw error

      // Refresh profile data
      const { data: profileData } = await supabase.from("profiles").select("*, plans(*)").eq("id", user.id).single()

      if (profileData) {
        setProfile(profileData)
      }

      toast({
        title: "Plan Updated",
        description: "Your subscription plan has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout isAdmin={profile?.role === "admin"}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
          <p className="text-white/70">Manage your account and subscription</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-black/30 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription className="text-white/70">Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white/70">Username</h3>
                <p className="text-white">{profile?.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/70">Role</h3>
                <p className="text-white capitalize">{profile?.role}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/70">Current Plan</h3>
                <p className="text-white">{profile?.plans?.name || "Free"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/70">Member Since</h3>
                <p className="text-white">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Loading..."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription className="text-white/70">Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="bg-black/50 border-white/20 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="bg-black/50 border-white/20 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} className="bg-black/50 border-white/20 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" variant="gradient" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription className="text-white/70">Upgrade your plan to get more features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-lg border ${
                    profile?.plan_id === plan.id ? "border-primary glow" : "border-white/10"
                  } flex flex-col`}
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-2xl font-bold mt-2">
                      ${plan.price.toFixed(2)}
                      <span className="text-sm font-normal text-white/70">/mo</span>
                    </p>
                  </div>
                  <div className="flex-1 space-y-2 mb-6">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-primary mr-2" />
                      <span>Max {plan.max_concurrent_attacks} concurrent attacks</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-primary mr-2" />
                      <span>Max {plan.max_time} seconds per attack</span>
                    </div>
                  </div>
                  <Button
                    variant={profile?.plan_id === plan.id ? "secondary" : "gradient"}
                    disabled={profile?.plan_id === plan.id || isLoading}
                    onClick={() => upgradePlan(plan.id)}
                    className="w-full"
                  >
                    {profile?.plan_id === plan.id ? "Current Plan" : "Upgrade"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
