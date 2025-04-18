export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
          updated_at: string
          role: string
          plan_id: string | null
          concurrent_attacks: number
          max_concurrent_attacks: number
          max_time: number
        }
        Insert: {
          id: string
          username: string
          created_at?: string
          updated_at?: string
          role?: string
          plan_id?: string | null
          concurrent_attacks?: number
          max_concurrent_attacks?: number
          max_time?: number
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
          updated_at?: string
          role?: string
          plan_id?: string | null
          concurrent_attacks?: number
          max_concurrent_attacks?: number
          max_time?: number
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          max_concurrent_attacks: number
          max_time: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          max_concurrent_attacks?: number
          max_time?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          max_concurrent_attacks?: number
          max_time?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      attack_methods: {
        Row: {
          id: string
          name: string
          description: string | null
          api_endpoint: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          api_endpoint: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          api_endpoint?: string
          created_at?: string
          updated_at?: string
        }
      }
      attack_history: {
        Row: {
          id: string
          user_id: string
          method_id: string
          host: string
          port: number
          time: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          method_id: string
          host: string
          port: number
          time: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          method_id?: string
          host?: string
          port?: number
          time?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
