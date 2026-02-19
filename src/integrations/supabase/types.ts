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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alumni_groups: {
        Row: {
          cohort: string
          created_at: string
          display_order: number | null
          group_photo_url: string | null
          id: string
          project_description: string | null
          project_link: string | null
          project_title: string
          published: boolean | null
          testimonial: string | null
          updated_at: string
          year: number
        }
        Insert: {
          cohort: string
          created_at?: string
          display_order?: number | null
          group_photo_url?: string | null
          id?: string
          project_description?: string | null
          project_link?: string | null
          project_title: string
          published?: boolean | null
          testimonial?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          cohort?: string
          created_at?: string
          display_order?: number | null
          group_photo_url?: string | null
          id?: string
          project_description?: string | null
          project_link?: string | null
          project_title?: string
          published?: boolean | null
          testimonial?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      alumni_members: {
        Row: {
          created_at: string
          display_order: number | null
          email: string | null
          group_id: string
          id: string
          linkedin_url: string | null
          name: string
          phone: string | null
          position: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          email?: string | null
          group_id: string
          id?: string
          linkedin_url?: string | null
          name: string
          phone?: string | null
          position?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          email?: string | null
          group_id?: string
          id?: string
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          position?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumni_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "alumni_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni_work_photos: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          group_id: string
          id: string
          photo_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          group_id: string
          id?: string
          photo_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          group_id?: string
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_work_photos_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "alumni_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamps: {
        Row: {
          audience: string | null
          benefits: string[] | null
          created_at: string
          description: string | null
          duration: string | null
          featured: boolean | null
          id: string
          next_session: string | null
          prerequisites: string | null
          price: string | null
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string | null
          benefits?: string[] | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          next_session?: string | null
          prerequisites?: string | null
          price?: string | null
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string | null
          benefits?: string[] | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          id?: string
          next_session?: string | null
          prerequisites?: string | null
          price?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          company: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          notes: string | null
          phone: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          notes?: string | null
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          notes?: string | null
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          bootcamp_name: string | null
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          published: boolean | null
          url: string
        }
        Insert: {
          bootcamp_name?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          published?: boolean | null
          url: string
        }
        Update: {
          bootcamp_name?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          published?: boolean | null
          url?: string
        }
        Relationships: []
      }
      references: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          full_name: string | null
          id: string
          logo_text: string | null
          logo_url: string | null
          name: string
          published: boolean | null
          sector: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          full_name?: string | null
          id?: string
          logo_text?: string | null
          logo_url?: string | null
          name: string
          published?: boolean | null
          sector?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          full_name?: string | null
          id?: string
          logo_text?: string | null
          logo_url?: string | null
          name?: string
          published?: boolean | null
          sector?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          bootcamp_id: string | null
          bootcamp_title: string | null
          company: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string | null
          phone: string | null
          position: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bootcamp_id?: string | null
          bootcamp_title?: string | null
          company?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          phone?: string | null
          position?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bootcamp_id?: string | null
          bootcamp_title?: string | null
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          phone?: string | null
          position?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          duration: string | null
          features: string[] | null
          icon_name: string | null
          id: string
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          features?: string[] | null
          icon_name?: string | null
          id?: string
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: string | null
          features?: string[] | null
          icon_name?: string | null
          id?: string
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          content: string
          created_at: string
          display_order: number | null
          id: string
          name: string
          published: boolean | null
          rating: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          name: string
          published?: boolean | null
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          name?: string
          published?: boolean | null
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
