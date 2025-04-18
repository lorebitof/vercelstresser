import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://fcabxzdtjiczznyvbyis.supabase.co"!
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYWJ4emR0amljenpueXZieWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mjg4OTIsImV4cCI6MjA2MDUwNDg5Mn0.t5vS-2AFYGHFSOUQQvh4B78pYXmc2r8APXnoCkbe6Qs"!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
