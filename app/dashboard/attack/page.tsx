"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Info, CheckCircle } from "lucide-react" // Added CheckCircle

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
    username: string // Adicionado
    role: string
    concurrent_attacks: number
    max_concurrent_attacks: number
    max_time: number
    plan_id?: string | null // Added plan_id
    plans?: { name: string; price: number }
  } | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: "",
      port: 80,
      time: 30, // Valor padrão definido como 60 segundos
      method: "",
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
        setProfile({
          ...profileData,
          max_concurrent_attacks: profileData.plan_id ? 
            (profileData.plans?.max_concurrent_attacks || profileData.max_concurrent_attacks || 0) : 0,
          max_time: profileData.plans?.max_time || profileData.max_time || 0,
        })
        form.setValue("time", 30) // Default value remains 60 seconds
      }

      // Get attack methods
      const { data: methodsData } = await supabase.from("attack_methods").select("*")

      if (methodsData) {
        // Sort methods by name in ascending order
        const sortedMethods = methodsData.sort((a, b) => a.name.localeCompare(b.name))
        setMethods(sortedMethods)
      }
    }

    fetchData()
  }, [router, form])

  // Watch for method changes to display API endpoint info
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

    // Prevent users on the "free" plan or with no plan_id from attacking
    if (profile.plans?.name === "free" || !profile
      .plan_id) {
      toast({
        title: "Error",
        description: "You don't have active plan.",
        variant: "destructive",
      })
      return
    }

    try {
      // Sincronizar o estado do contador de ataques concorrentes
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
        console.error("Error fetching profile data:", profileError)
        return
      }

      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          concurrent_attacks: updatedProfile.concurrent_attacks,
        }
      })

      // Verificar se o limite de ataques concorrentes foi atingido
      if (updatedProfile.concurrent_attacks >= updatedProfile.max_concurrent_attacks) {
        toast({
          title: "Error",
          description: "You have reached your maximum concurrent attacks limit.",
          variant: "destructive",
        })
        return
      }

      // Verificar se o tempo está dentro do limite permitido
      if (values.time > profile.max_time) {
        form.setError("time", {
          message: `Maximum time allowed is ${profile.max_time} seconds`,
        })
        return
      }

      setIsLoading(true)

      const selectedMethodDetails = methods.find((m) => m.id === values.method)

      // Enviar dados para a API route
      const response = await fetch("/api/attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          methodId: values.method,
          host: values.host,
          port: values.port,
          time: values.time,
          username: profile.username,
          methodName: selectedMethodDetails?.name,
          apiEndpoint: selectedMethodDetails?.api_endpoint,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to start attack.")
      }

      // Expirar ataque após o tempo definido
      setTimeout(async () => {
        // Atualizar o status do ataque para "completed"
        const { error: updateStatusError } = await supabase
          .from("attack_history")
          .update({ status: "completed" })
          .eq("user_id", profile.id)
          .eq("host", values.host)
          .eq("port", values.port)
          .eq("method_id", values.method)

        if (updateStatusError) {
          console.error("Failed to update attack status:", updateStatusError)
          return
        }

        // Zerar ataques concorrentes
        const { error: resetError } = await supabase
          .from("profiles")
          .update({ concurrent_attacks: 0 })
          .eq("id", profile.id)

        if (!resetError) {
          setProfile((prev) => {
            if (!prev) return null
            return {
              ...prev,
              concurrent_attacks: 0,
            }
          })
        } else {
          console.error("Failed to reset concurrent attacks:", resetError)
        }

        toast({
          title: "Attack Completed",
          description: `Attack on ${values.host}:${values.port} has completed.`,
        })
      }, values.time * 1000)

      toast({
        title: "Success",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Attacks sent successfully.</span>
          </div>
        ),
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start attack. Please try again.",
        variant: "destructive",
      })
      console.error("Error during attack submission:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout isAdmin={profile?.role === "admin"}>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-full max-w-2xl">
          <Alert className="bg-purple-600 text-white border-purple-700">
            <div className="flex flex-col md:flex-row items-center justify-between w-full">
              <div>
                <AlertTitle className="text-lg font-bold">Join Our Telegram</AlertTitle>
                <AlertDescription>
                  Please join our Telegram channel to get the latest updates and support.
                </AlertDescription>
              </div>
              <Button
                variant="outline"
                className="mt-4 md:mt-0 bg-white text-purple-600 hover:bg-purple-700 hover:text-white"
                onClick={() => window.open("https://t.me/globalstress", "_blank")}
              >
                Join Telegram
              </Button>
            </div>
          </Alert>
        </div>

        <Card className="bg-black/30 border-white/10 text-white w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Panel</CardTitle>
            <CardDescription className="text-white/70">Attack panel</CardDescription>
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
                        <FormLabel className="text-white">IPv4</FormLabel>
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
                        <FormLabel className="text-white">Time</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-black/50 border-white/20 text-white"
                            placeholder="30" // Always display 30 as the placeholder
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

                <Button type="submit" variant="gradient" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Attack...
                    </>
                  ) : (
                    "Attack"
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
