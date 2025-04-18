"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Info } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  host: z.string().min(1, { message: "Host is required" }),
  port: z.coerce.number().int().min(1).max(65535),
  time: z.coerce.number().int().min(1),
  method: z.string().min(1, { message: "Method is required" }),
})

export default function AttackPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [methods, setMethods] = useState<any[]>([])
  const [profile, setProfile] = useState<{
    id: string
    username: string
    role: string
    concurrent_attacks: number
    max_concurrent_attacks: number
    max_time: number
    plan_id: string | null // Atualizado para usar plan_id
  } | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: "",
      port: 80,
      time: 60,
      method: "",
    },
  })

  useEffect(() => {
    async function fetchData() {
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
        form.setValue("time", profileData.max_time || 60)
      }

      const { data: methodsData } = await supabase.from("attack_methods").select("*")

      if (methodsData) {
        setMethods(methodsData)
      }
    }

    fetchData()
  }, [router, form])

  const watchMethod = form.watch("method")

  useEffect(() => {
    if (watchMethod && methods.length > 0) {
      const method = methods.find((m) => m.id === watchMethod)
      setSelectedMethod(method)
    } else {
      setSelectedMethod(null)
    }
  }, [watchMethod, methods])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!profile) return

    try {
      if (!profile.plan_id) {
        toast({
          title: "Upgrade Required",
          description: "You need to upgrade your plan to send attacks.",
          variant: "destructive",
        })
        return
      }

      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .select("concurrent_attacks, max_concurrent_attacks")
        .eq("id", profile.id)
        .single()

      if (profileError || !updatedProfile) {
        toast({
          title: "Error",
          description: "Failed to fetch updated profile data.",
          variant: "destructive",
        })
        return
      }

      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          concurrent_attacks: updatedProfile.concurrent_attacks,
        }
      })

      if (updatedProfile.concurrent_attacks >= updatedProfile.max_concurrent_attacks) {
        toast({
          title: "Error",
          description: "You have reached your maximum concurrent attacks limit.",
          variant: "destructive",
        })
        return
      }

      if (values.time > profile.max_time) {
        form.setError("time", {
          message: `Maximum time allowed is ${profile.max_time} seconds`,
        })
        return
      }

      setIsLoading(true)

      const { error: attackError } = await supabase
        .from("attack_history")
        .insert([
          {
            user_id: profile.id,
            method_id: values.method,
            host: values.host,
            port: values.port,
            time: values.time,
            status: "running",
          },
        ])

      if (attackError) throw attackError

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ concurrent_attacks: updatedProfile.concurrent_attacks + 1 })
        .eq("id", profile.id)

      if (updateError) throw updateError

      toast({
        title: "Attack Started",
        description: `Attack on ${values.host}:${values.port} has been initiated.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start attack. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout isAdmin={profile?.role === "admin"}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Launch Attack</h1>

        <Card className="bg-black/30 border-white/10 text-white mb-6">
          <CardHeader>
            <CardTitle>Attack Configuration</CardTitle>
            <CardDescription className="text-white/70">Configure your attack parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Host</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="71.71.71.71"
                            {...field}
                            className="bg-black/50 border-white/20 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Port</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-black/50 border-white/20 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Time (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-black/50 border-white/20 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/20 text-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black border-white/20 text-white">
                            {methods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedMethod && (
                  <Alert className="bg-primary/10 border-primary/20 text-white">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Method Information</AlertTitle>
                    <AlertDescription>{selectedMethod.description || "No description available."}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" variant="gradient" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Attack...
                    </>
                  ) : (
                    "Launch Attack"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
