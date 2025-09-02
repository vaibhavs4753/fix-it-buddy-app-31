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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          customer_id: string
          id: string
          payment_method: string | null
          service_request_id: string | null
          status: string | null
          stripe_session_id: string | null
          technician_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          customer_id: string
          id?: string
          payment_method?: string | null
          service_request_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          technician_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          customer_id?: string
          id?: string
          payment_method?: string | null
          service_request_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          technician_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_role: string | null
          available_roles: string[] | null
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          active_role?: string | null
          available_roles?: string[] | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          active_role?: string | null
          available_roles?: string[] | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          rating: number | null
          service_request_id: string | null
          technician_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          rating?: number | null
          service_request_id?: string | null
          technician_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          rating?: number | null
          service_request_id?: string | null
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: true
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          actual_price: number | null
          client_id: string
          created_at: string
          description: string
          estimated_price: number | null
          id: string
          is_visit_required: boolean | null
          location_address: string
          location_lat: number
          location_lng: number
          media_type: string | null
          media_urls: string[] | null
          payment_method: string | null
          scheduled_time: string | null
          service_id: string | null
          service_type: string
          status: string | null
          technician_id: string | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          actual_price?: number | null
          client_id: string
          created_at?: string
          description: string
          estimated_price?: number | null
          id?: string
          is_visit_required?: boolean | null
          location_address: string
          location_lat: number
          location_lng: number
          media_type?: string | null
          media_urls?: string[] | null
          payment_method?: string | null
          scheduled_time?: string | null
          service_id?: string | null
          service_type: string
          status?: string | null
          technician_id?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          actual_price?: number | null
          client_id?: string
          created_at?: string
          description?: string
          estimated_price?: number | null
          id?: string
          is_visit_required?: boolean | null
          location_address?: string
          location_lat?: number
          location_lng?: number
          media_type?: string | null
          media_urls?: string[] | null
          payment_method?: string | null
          scheduled_time?: string | null
          service_id?: string | null
          service_type?: string
          status?: string | null
          technician_id?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      technician_profiles: {
        Row: {
          availability_status: string | null
          commission_rate: number | null
          created_at: string
          current_location_lat: number | null
          current_location_lng: number | null
          description: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          name: string
          phone: string | null
          profile_image_url: string | null
          rating: number | null
          service_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_status?: string | null
          commission_rate?: number | null
          created_at?: string
          current_location_lat?: number | null
          current_location_lng?: number | null
          description?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          name: string
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          service_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_status?: string | null
          commission_rate?: number | null
          created_at?: string
          current_location_lat?: number | null
          current_location_lng?: number | null
          description?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          name?: string
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          service_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_role: {
        Args: { new_role: string }
        Returns: boolean
      }
      create_payment_record: {
        Args: {
          p_amount: number
          p_customer_id: string
          p_payment_method: string
          p_service_request_id: string
          p_stripe_session_id?: string
          p_technician_id: string
        }
        Returns: string
      }
      get_available_technicians_for_service: {
        Args: {
          client_lat: number
          client_lng: number
          radius_km?: number
          service_type_param: string
        }
        Returns: {
          availability_status: string
          distance_km: number
          id: string
          name: string
          rating: number
          service_type: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      switch_user_role: {
        Args: { new_role: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
