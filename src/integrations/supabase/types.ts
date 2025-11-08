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
      appointment_action_tokens: {
        Row: {
          action: string
          appointment_id: string
          created_at: string | null
          expires_at: string
          token: string
        }
        Insert: {
          action: string
          appointment_id: string
          created_at?: string | null
          expires_at: string
          token: string
        }
        Update: {
          action?: string
          appointment_id?: string
          created_at?: string | null
          expires_at?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_action_tokens_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_addons: {
        Row: {
          addon_service_id: string
          appointment_id: string
          created_at: string | null
          id: string
          price_paid: number
        }
        Insert: {
          addon_service_id: string
          appointment_id: string
          created_at?: string | null
          id?: string
          price_paid: number
        }
        Update: {
          addon_service_id?: string
          appointment_id?: string
          created_at?: string | null
          id?: string
          price_paid?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointment_addons_addon_service_id_fkey"
            columns: ["addon_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_addons_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          barber_id: string | null
          campaign_id: string | null
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
          payment_locked: boolean | null
          payment_required_reason: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          promo_code_used: string | null
          require_prepayment: boolean | null
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
          campaign_id?: string | null
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
          payment_locked?: boolean | null
          payment_required_reason?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          promo_code_used?: string | null
          require_prepayment?: boolean | null
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
          campaign_id?: string | null
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
          payment_locked?: boolean | null
          payment_required_reason?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          promo_code_used?: string | null
          require_prepayment?: boolean | null
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
            foreignKeyName: "appointments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotional_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "barber_clients"
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
      availability_overrides: {
        Row: {
          barber_id: string
          created_at: string | null
          created_by: string | null
          end_time: string
          id: string
          kind: Database["public"]["Enums"]["override_kind"]
          note: string | null
          start_time: string
        }
        Insert: {
          barber_id: string
          created_at?: string | null
          created_by?: string | null
          end_time: string
          id?: string
          kind: Database["public"]["Enums"]["override_kind"]
          note?: string | null
          start_time: string
        }
        Update: {
          barber_id?: string
          created_at?: string | null
          created_by?: string | null
          end_time?: string
          id?: string
          kind?: Database["public"]["Enums"]["override_kind"]
          note?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_overrides_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      blacklisted_customers: {
        Row: {
          created_at: string | null
          created_by: string | null
          email_norm: string | null
          id: string
          phone_norm: string | null
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email_norm?: string | null
          id?: string
          phone_norm?: string | null
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email_norm?: string | null
          id?: string
          phone_norm?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      blog_drafts: {
        Row: {
          author_id: string
          auto_saved_at: string
          category: string | null
          content: string | null
          excerpt: string | null
          id: string
          post_id: string | null
          tags: string[] | null
          title: string | null
        }
        Insert: {
          author_id: string
          auto_saved_at?: string
          category?: string | null
          content?: string | null
          excerpt?: string | null
          id?: string
          post_id?: string | null
          tags?: string[] | null
          title?: string | null
        }
        Update: {
          author_id?: string
          auto_saved_at?: string
          category?: string | null
          content?: string | null
          excerpt?: string | null
          id?: string
          post_id?: string | null
          tags?: string[] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_drafts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          archived_at: string | null
          author_id: string | null
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean
          is_pinned: boolean
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number
          scheduled_publish_at: string | null
          series_name: string | null
          series_order: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          archived_at?: string | null
          author_id?: string | null
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_pinned?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          scheduled_publish_at?: string | null
          series_name?: string | null
          series_order?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          archived_at?: string | null
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_pinned?: boolean
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          scheduled_publish_at?: string | null
          series_name?: string | null
          series_order?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
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
      campaign_recipients: {
        Row: {
          campaign_id: string
          channel: string
          clicked_at: string | null
          client_id: string
          created_at: string | null
          error_message: string | null
          id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["recipient_status"]
        }
        Insert: {
          campaign_id: string
          channel: string
          clicked_at?: string | null
          client_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["recipient_status"]
        }
        Update: {
          campaign_id?: string
          channel?: string
          clicked_at?: string | null
          client_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["recipient_status"]
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotional_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "barber_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
            referencedRelation: "barber_clients"
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
          account_linked_at: string | null
          created_at: string | null
          email: string | null
          email_norm: string | null
          first_seen: string | null
          full_name: string
          guest: boolean | null
          id: string
          linked_profile_id: string | null
          locale: string | null
          opt_in_email: boolean | null
          opt_in_sms: boolean | null
          phone: string | null
          phone_norm: string | null
        }
        Insert: {
          account_linked_at?: string | null
          created_at?: string | null
          email?: string | null
          email_norm?: string | null
          first_seen?: string | null
          full_name: string
          guest?: boolean | null
          id?: string
          linked_profile_id?: string | null
          locale?: string | null
          opt_in_email?: boolean | null
          opt_in_sms?: boolean | null
          phone?: string | null
          phone_norm?: string | null
        }
        Update: {
          account_linked_at?: string | null
          created_at?: string | null
          email?: string | null
          email_norm?: string | null
          first_seen?: string | null
          full_name?: string
          guest?: boolean | null
          id?: string
          linked_profile_id?: string | null
          locale?: string | null
          opt_in_email?: boolean | null
          opt_in_sms?: boolean | null
          phone?: string | null
          phone_norm?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_linked_profile_id_fkey"
            columns: ["linked_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      gallery_images: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      notification_jobs: {
        Row: {
          appointment_id: string | null
          attempts: number | null
          channel: string
          created_at: string | null
          id: string
          last_error: string | null
          scheduled_for: string
          status: Database["public"]["Enums"]["job_status"] | null
          template: string
        }
        Insert: {
          appointment_id?: string | null
          attempts?: number | null
          channel: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          scheduled_for: string
          status?: Database["public"]["Enums"]["job_status"] | null
          template: string
        }
        Update: {
          appointment_id?: string | null
          attempts?: number | null
          channel?: string
          created_at?: string | null
          id?: string
          last_error?: string | null
          scheduled_for?: string
          status?: Database["public"]["Enums"]["job_status"] | null
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_jobs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
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
      payments: {
        Row: {
          amount_cents: number
          appointment_id: string | null
          created_at: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          proof_url: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status_enum"] | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount_cents: number
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          proof_url?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"] | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount_cents?: number
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          proof_url?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"] | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      promotional_campaigns: {
        Row: {
          channel: string
          click_through_count: number | null
          created_at: string | null
          created_by: string
          custom_filters: Json | null
          custom_phone_numbers: string[] | null
          custom_recipient_ids: Json | null
          email_html: string | null
          failed_count: number | null
          id: string
          message_body: string
          opened_count: number | null
          promo_code: string | null
          promo_discount: number | null
          promo_expires_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          sent_count: number | null
          status: Database["public"]["Enums"]["campaign_status"]
          subject: string | null
          target_audience: Database["public"]["Enums"]["target_audience"]
          title: string
          total_recipients: number | null
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at: string | null
        }
        Insert: {
          channel: string
          click_through_count?: number | null
          created_at?: string | null
          created_by: string
          custom_filters?: Json | null
          custom_phone_numbers?: string[] | null
          custom_recipient_ids?: Json | null
          email_html?: string | null
          failed_count?: number | null
          id?: string
          message_body: string
          opened_count?: number | null
          promo_code?: string | null
          promo_discount?: number | null
          promo_expires_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: Database["public"]["Enums"]["campaign_status"]
          subject?: string | null
          target_audience?: Database["public"]["Enums"]["target_audience"]
          title: string
          total_recipients?: number | null
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string | null
        }
        Update: {
          channel?: string
          click_through_count?: number | null
          created_at?: string | null
          created_by?: string
          custom_filters?: Json | null
          custom_phone_numbers?: string[] | null
          custom_recipient_ids?: Json | null
          email_html?: string | null
          failed_count?: number | null
          id?: string
          message_body?: string
          opened_count?: number | null
          promo_code?: string | null
          promo_discount?: number | null
          promo_expires_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: Database["public"]["Enums"]["campaign_status"]
          subject?: string | null
          target_audience?: Database["public"]["Enums"]["target_audience"]
          title?: string
          total_recipients?: number | null
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      schedule_change_requests: {
        Row: {
          barber_id: string
          break_end: string | null
          break_kind: string | null
          break_start: string | null
          break_weekday: number | null
          created_at: string | null
          date: string | null
          day_off_date: string | null
          end_time: string | null
          id: string
          kind: Database["public"]["Enums"]["request_kind"]
          note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          weekday: number | null
        }
        Insert: {
          barber_id: string
          break_end?: string | null
          break_kind?: string | null
          break_start?: string | null
          break_weekday?: number | null
          created_at?: string | null
          date?: string | null
          day_off_date?: string | null
          end_time?: string | null
          id?: string
          kind: Database["public"]["Enums"]["request_kind"]
          note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          weekday?: number | null
        }
        Update: {
          barber_id?: string
          break_end?: string | null
          break_kind?: string | null
          break_start?: string | null
          break_weekday?: number | null
          created_at?: string | null
          date?: string | null
          day_off_date?: string | null
          end_time?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["request_kind"]
          note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_change_requests_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_change_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          canonical_url: string | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          page_slug: string
          robots: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          canonical_url?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_slug: string
          robots?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          canonical_url?: string | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_slug?: string
          robots?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      service_addons: {
        Row: {
          addon_id: string
          created_at: string | null
          id: string
          service_id: string
        }
        Insert: {
          addon_id: string
          created_at?: string | null
          id?: string
          service_id: string
        }
        Update: {
          addon_id?: string
          created_at?: string | null
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_addons_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
      barber_clients: {
        Row: {
          appointment_count: number | null
          barber_id: string | null
          created_at: string | null
          first_seen: string | null
          full_name: string | null
          id: string | null
          last_appointment_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
        ]
      }
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
      norm_email: { Args: { e: string }; Returns: string }
      norm_phone: { Args: { p: string }; Returns: string }
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
      campaign_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "sent"
        | "paused"
        | "canceled"
      campaign_type: "promotional" | "announcement" | "seasonal" | "loyalty"
      job_status: "queued" | "sent" | "failed" | "canceled"
      override_kind: "open" | "closed"
      payment_method: "zelle" | "apple_pay" | "cash_app" | "venmo"
      payment_method_enum: "zelle" | "apple_pay" | "cash_app"
      payment_status: "none" | "deposit_paid" | "fully_paid"
      payment_status_enum: "pending" | "verified" | "rejected"
      recipient_status: "queued" | "sent" | "failed" | "bounced" | "clicked"
      request_kind: "working_hours" | "breaks" | "day_off"
      request_status: "pending" | "approved" | "rejected"
      reward_action:
        | "review"
        | "checkin"
        | "referral"
        | "social_share"
        | "redeemed"
      service_category: "haircut" | "shave" | "combo" | "treatment" | "addon"
      target_audience:
        | "all_customers"
        | "vip_only"
        | "recent_customers"
        | "inactive_customers"
        | "custom"
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
      campaign_status: [
        "draft",
        "scheduled",
        "sending",
        "sent",
        "paused",
        "canceled",
      ],
      campaign_type: ["promotional", "announcement", "seasonal", "loyalty"],
      job_status: ["queued", "sent", "failed", "canceled"],
      override_kind: ["open", "closed"],
      payment_method: ["zelle", "apple_pay", "cash_app", "venmo"],
      payment_method_enum: ["zelle", "apple_pay", "cash_app"],
      payment_status: ["none", "deposit_paid", "fully_paid"],
      payment_status_enum: ["pending", "verified", "rejected"],
      recipient_status: ["queued", "sent", "failed", "bounced", "clicked"],
      request_kind: ["working_hours", "breaks", "day_off"],
      request_status: ["pending", "approved", "rejected"],
      reward_action: [
        "review",
        "checkin",
        "referral",
        "social_share",
        "redeemed",
      ],
      service_category: ["haircut", "shave", "combo", "treatment", "addon"],
      target_audience: [
        "all_customers",
        "vip_only",
        "recent_customers",
        "inactive_customers",
        "custom",
      ],
      user_role: ["customer", "barber", "admin"],
    },
  },
} as const
