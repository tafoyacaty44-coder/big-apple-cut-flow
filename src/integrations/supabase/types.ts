export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          barber_id: string | null
          cancellation_deadline: string | null
          client_id: string | null
          confirmation_number: string
          created_at: string
          customer_id: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          notes: string | null
          payment_amount: number | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          service_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          stripe_payment_intent_id: string | null
          token: string | null
          updated_at: string
          vip_applied: boolean | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          barber_id?: string | null
          cancellation_deadline?: string | null
          client_id?: string | null
          confirmation_number: string
          created_at?: string
          customer_id?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          service_id: string
          status?: Database["public"]["Enums"]["appointment_status"]
          stripe_payment_intent_id?: string | null
          token?: string | null
          updated_at?: string
          vip_applied?: boolean | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          barber_id?: string | null
          cancellation_deadline?: string | null
          client_id?: string | null
          confirmation_number?: string
          created_at?: string
          customer_id?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          service_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          stripe_payment_intent_id?: string | null
          token?: string | null
          updated_at?: string
          vip_applied?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_availability: {
        Row: {
          barber_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          status_message: string | null
        }
        Insert: {
          barber_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          status_message?: string | null
        }
        Update: {
          barber_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          status_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barber_availability_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      barbers: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          profile_image_url: string | null
          specialties: string[] | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          profile_image_url?: string | null
          specialties?: string[] | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          profile_image_url?: string | null
          specialties?: string[] | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      breaks: {
        Row: {
          barber_id: string | null
          date: string | null
          end_time: string
          id: string
          note: string | null
          start_time: string
          type: string
          weekday: number | null
        }
        Insert: {
          barber_id?: string | null
          date?: string | null
          end_time: string
          id?: string
          note?: string | null
          start_time: string
          type: string
          weekday?: number | null
        }
        Update: {
          barber_id?: string | null
          date?: string | null
          end_time?: string
          id?: string
          note?: string | null
          start_time?: string
          type?: string
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "breaks_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          barber_id: string | null
          client_id: string | null
          created_at: string | null
          id: string
          note: string | null
          photo_url: string | null
        }
        Insert: {
          barber_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          photo_url?: string | null
        }
        Update: {
          barber_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      days_off: {
        Row: {
          barber_id: string | null
          date: string
          id: string
        }
        Insert: {
          barber_id?: string | null
          date: string
          id?: string
        }
        Update: {
          barber_id?: string | null
          date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "days_off_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          appointment_id: string | null
          channel: string | null
          id: string
          sent_at: string | null
          type: string | null
        }
        Insert: {
          appointment_id?: string | null
          channel?: string | null
          id?: string
          sent_at?: string | null
          type?: string | null
        }
        Update: {
          appointment_id?: string | null
          channel?: string | null
          id?: string
          sent_at?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_time_customer: boolean
          full_name: string
          id: string
          phone: string | null
          preferred_barber_id: string | null
          rewards_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_time_customer?: boolean
          full_name: string
          id: string
          phone?: string | null
          preferred_barber_id?: string | null
          rewards_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_time_customer?: boolean
          full_name?: string
          id?: string
          phone?: string | null
          preferred_barber_id?: string | null
          rewards_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          customer_id: string
          id: string
          times_used: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          customer_id: string
          id?: string
          times_used?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          times_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_conversions: {
        Row: {
          created_at: string | null
          id: string
          new_customer_id: string | null
          points_awarded: number | null
          referral_code_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_customer_id?: string | null
          points_awarded?: number | null
          referral_code_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_customer_id?: string | null
          points_awarded?: number | null
          referral_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_new_customer_id_fkey"
            columns: ["new_customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_conversions_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_actions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          points: number
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          points: number
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          points?: number
        }
        Relationships: []
      }
      reward_tiers: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          discount_percent: number
          display_order: number | null
          id: string
          min_points: number
          name: string
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          discount_percent: number
          display_order?: number | null
          id?: string
          min_points: number
          name: string
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          discount_percent?: number
          display_order?: number | null
          id?: string
          min_points?: number
          name?: string
        }
        Relationships: []
      }
      rewards_activity: {
        Row: {
          action_id: string | null
          action_type: Database["public"]["Enums"]["reward_action"]
          created_at: string
          customer_id: string
          description: string | null
          id: string
          points_earned: number | null
          points_redeemed: number | null
          related_appointment_id: string | null
        }
        Insert: {
          action_id?: string | null
          action_type: Database["public"]["Enums"]["reward_action"]
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          points_earned?: number | null
          points_redeemed?: number | null
          related_appointment_id?: string | null
        }
        Update: {
          action_id?: string | null
          action_type?: Database["public"]["Enums"]["reward_action"]
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          points_earned?: number | null
          points_redeemed?: number | null
          related_appointment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_activity_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "reward_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_activity_related_appointment_id_fkey"
            columns: ["related_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      service_prices: {
        Row: {
          barber_id: string | null
          default_price_cents: number
          id: string
          service_id: string
          vip_price_cents: number | null
        }
        Insert: {
          barber_id?: string | null
          default_price_cents: number
          id?: string
          service_id: string
          vip_price_cents?: number | null
        }
        Update: {
          barber_id?: string | null
          default_price_cents?: number
          id?: string
          service_id?: string
          vip_price_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_prices_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_prices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string | null
          display_order: number | null
          duration_minutes: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          regular_price: number
          vip_price: number
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          regular_price: number
          vip_price: number
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          regular_price?: number
          vip_price?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      vip_settings: {
        Row: {
          enabled: boolean | null
          id: number
          vip_code: string | null
        }
        Insert: {
          enabled?: boolean | null
          id?: number
          vip_code?: string | null
        }
        Update: {
          enabled?: boolean | null
          id?: number
          vip_code?: string | null
        }
        Relationships: []
      }
      working_hours: {
        Row: {
          barber_id: string | null
          end_time: string
          id: string
          start_time: string
          weekday: number
        }
        Insert: {
          barber_id?: string | null
          end_time: string
          id?: string
          start_time: string
          weekday: number
        }
        Update: {
          barber_id?: string | null
          end_time?: string
          id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_appointment_token: { Args: never; Returns: string }
      generate_confirmation_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { target_email: string }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      payment_status: "none" | "deposit_paid" | "fully_paid"
      reward_action:
        | "review"
        | "checkin"
        | "referral"
        | "social_share"
        | "redeemed"
      service_category: "haircut" | "shave" | "combo" | "treatment"
      user_role: "customer" | "barber" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      payment_status: ["none", "deposit_paid", "fully_paid"],
      reward_action: [
        "review",
        "checkin",
        "referral",
        "social_share",
        "redeemed",
      ],
      service_category: ["haircut", "shave", "combo", "treatment"],
      user_role: ["customer", "barber", "admin"],
    },
  },
} as const
