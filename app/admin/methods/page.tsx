"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Pencil, Trash2, LinkIcon } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

const methodFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  description: z.string().optional(),
  api_endpoint: z.string().min(1, {
    message: "API endpoint is required.",
  }),
})

export default function AdminMethodsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [methods, setMethods] = useState<any[]>([])
  const [editingMethod, setEditingMethod] = useState<any>(null)

  const form = useForm<z.infer<typeof methodFormSchema>>({
    resolver: zodResolver(methodFormSchema),
    defaultValues: {
      name: "",
      description: "",
      api_endpoint: "",
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

      // Get all methods
      const { data: methodsData } = await supabase.from("attack_methods").select("*").order("name", { ascending: true })

      if (methodsData) {
        setMethods(methodsData)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [router])

  useEffect(() => {
    if (editingMethod) {
      form.reset({
        name: editingMethod.name,
        description: editingMethod.description || "",
        api_endpoint: editingMethod.api_endpoint,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        api_endpoint: "",
      })
    }
  }, [editingMethod, form])

  async function onSubmit(values: z.infer<typeof methodFormSchema>) {
    setIsSubmitting(true)

    try {
      if (editingMethod) {
        // Update existing method
        const { error } = await supabase
          .from("attack_methods")
          .update({
            name: values.name,
            description: values.description,
            api_endpoint: values.api_endpoint,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingMethod.id)

        if (error) throw error

        toast({
          title: "Method Updated",
          description: `Method ${values.name} has been updated successfully.`,
        })
      } else {
        // Create new method
        const { error } = await supabase.from("attack_methods").insert([
          {
            name: values.name,
            description: values.description,
            api_endpoint: values.api_endpoint,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (error) throw error

        toast({
          title: "Method Created",
          description: `Method ${values.name} has been created successfully.`,
        })
      }

      // Refresh method list
      const { data: methodsData } = await supabase.from("attack_methods").select("*").order("name", { ascending: true })

      if (methodsData) {
        setMethods(methodsData)
      }

      // Reset form and editing state
      form.reset()
      setEditingMethod(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deleteMethod(methodId: string) {
    if (!confirm("Are you sure you want to delete this method? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)

    try {
      // Check if method is in use
      const { data: attacksWithMethod, error: checkError } = await supabase
        .from("attack_history")
        .select("id")
        .eq("method_id", methodId)

      if (checkError) throw checkError

      if (attacksWithMethod && attacksWithMethod.length > 0) {
        throw new Error(`Cannot delete method because it is used in ${attacksWithMethod.length} attack(s).`)
      }

      // Delete method
      const { error } = await supabase.from("attack_methods").delete().eq("id", methodId)

      if (error) throw error

      // Refresh method list
      const { data: methodsData } = await supabase.from("attack_methods").select("*").order("name", { ascending: true })

      if (methodsData) {
        setMethods(methodsData)
      }

      toast({
        title: "Method Deleted",
        description: "Method has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete method. Please try again.",
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
          <h1 className="text-3xl font-bold text-white">Attack Methods</h1>
          <p className="text-white/70">Manage attack methods and API endpoints</p>
        </div>

        <Card className="bg-black/30 border-white/10 text-white">
          <CardHeader>
            <CardTitle>{editingMethod ? "Edit Method" : "Create New Method"}</CardTitle>
            <CardDescription className="text-white/70">
              {editingMethod ? "Update method details" : "Add a new attack method"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Method Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. TCP Flood, UDP Flood"
                          className="bg-black/50 border-white/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe what this attack method does"
                          className="bg-black/50 border-white/20 text-white min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="api_endpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">API Endpoint</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                          <Input
                            {...field}
                            placeholder="https://api.example.com/attack?host={HOST}&port={PORT}&time={TIME}"
                            className="bg-black/50 border-white/20 text-white pl-8"
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-white/70">
                        Use {"{HOST}"}, {"{PORT}"}, and {"{TIME}"} as placeholders for attack parameters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" variant="gradient" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingMethod ? "Updating..." : "Creating..."}
                      </>
                    ) : editingMethod ? (
                      "Update Method"
                    ) : (
                      "Create Method"
                    )}
                  </Button>

                  {editingMethod && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => setEditingMethod(null)}
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
            <CardTitle>Attack Methods</CardTitle>
            <CardDescription className="text-white/70">Manage all attack methods</CardDescription>
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
                      <TableHead className="text-white">Description</TableHead>
                      <TableHead className="text-white">API Endpoint</TableHead>
                      <TableHead className="text-white text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {methods.map((method) => (
                      <TableRow key={method.id} className="border-white/10">
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {method.description || <span className="text-white/50 italic">No description</span>}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">{method.api_endpoint}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                              onClick={() => setEditingMethod(method)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => deleteMethod(method.id)}
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
