// ============================================================
// Supabase Database TypeScript types – Vispute Restaurant
// Generated manually from schema (Phase 1)
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tables: {
        Row: {
          id: string
          number: number
          secret_token: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          number: number
          secret_token?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          number?: number
          secret_token?: string
          is_active?: boolean
          created_at?: string
        }
      }
      table_sessions: {
        Row: {
          id: string
          table_id: string
          status: 'open' | 'billed'
          opened_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          table_id: string
          status?: 'open' | 'billed'
          opened_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          table_id?: string
          status?: 'open' | 'billed'
          opened_at?: string
          closed_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name_mr: string
          name_en: string
          sort_order: number
          icon: string | null
        }
        Insert: {
          id?: string
          name_mr: string
          name_en: string
          sort_order?: number
          icon?: string | null
        }
        Update: {
          id?: string
          name_mr?: string
          name_en?: string
          sort_order?: number
          icon?: string | null
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name_mr: string
          name_en: string
          description_mr: string | null
          price: number
          image_url: string | null
          is_veg: boolean
          is_available: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name_mr: string
          name_en: string
          description_mr?: string | null
          price: number
          image_url?: string | null
          is_veg?: boolean
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name_mr?: string
          name_en?: string
          description_mr?: string | null
          price?: number
          image_url?: string | null
          is_veg?: boolean
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          session_id: string
          placed_by: 'customer' | 'waiter'
          status: 'new' | 'preparing' | 'ready' | 'served'
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          placed_by?: 'customer' | 'waiter'
          status?: 'new' | 'preparing' | 'ready' | 'served'
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          placed_by?: 'customer' | 'waiter'
          status?: 'new' | 'preparing' | 'ready' | 'served'
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          item_id: string
          name_snapshot: string
          price_snapshot: number
          qty: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          item_id: string
          name_snapshot: string
          price_snapshot: number
          qty?: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          item_id?: string
          name_snapshot?: string
          price_snapshot?: number
          qty?: number
          note?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          mobile: string
          name: string | null
          offers_consent: boolean
          first_seen: string
          last_visit: string
        }
        Insert: {
          id?: string
          mobile: string
          name?: string | null
          offers_consent?: boolean
          first_seen?: string
          last_visit?: string
        }
        Update: {
          id?: string
          mobile?: string
          name?: string | null
          offers_consent?: boolean
          first_seen?: string
          last_visit?: string
        }
      }
      bills: {
        Row: {
          id: string
          session_id: string
          customer_id: string | null
          subtotal: number
          discount: number
          gst: number
          total: number
          payment_mode: 'cash' | 'upi' | 'card'
          paid_at: string
        }
        Insert: {
          id?: string
          session_id: string
          customer_id?: string | null
          subtotal: number
          discount?: number
          gst?: number
          total: number
          payment_mode?: 'cash' | 'upi' | 'card'
          paid_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          customer_id?: string | null
          subtotal?: number
          discount?: number
          gst?: number
          total?: number
          payment_mode?: 'cash' | 'upi' | 'card'
          paid_at?: string
        }
      }
      staff: {
        Row: {
          user_id: string
          role: 'admin' | 'cashier' | 'waiter' | 'kitchen'
          name: string
          created_at: string
        }
        Insert: {
          user_id: string
          role: 'admin' | 'cashier' | 'waiter' | 'kitchen'
          name: string
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: 'admin' | 'cashier' | 'waiter' | 'kitchen'
          name?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_open_session: {
        Args: { p_table_id: string }
        Returns: string | null
      }
      table_id_from_token: {
        Args: { p_token: string }
        Returns: string | null
      }
      is_any_staff: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_staff_role: {
        Args: { required_role: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}

// Convenience types
export type Table = Database['public']['Tables']['tables']['Row']
export type TableSession = Database['public']['Tables']['table_sessions']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Bill = Database['public']['Tables']['bills']['Row']
export type Staff = Database['public']['Tables']['staff']['Row']

export type StaffRole = 'admin' | 'cashier' | 'waiter' | 'kitchen'
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served'
export type SessionStatus = 'open' | 'billed'
export type PaymentMode = 'cash' | 'upi' | 'card'
