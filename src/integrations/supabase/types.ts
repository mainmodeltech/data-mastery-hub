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
      alumni: {
        Row: {
          bootcamp_id: string | null
          cohort: string | null
          created_at: string
          current_position: string | null
          current_title: string | null
          display_order: number | null
          email: string | null
          id: string
          linkedin_url: string | null
          name: string
          phone: string | null
          photo_url: string | null
          published: boolean | null
          registration_id: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          bootcamp_id?: string | null
          cohort?: string | null
          created_at?: string
          current_position?: string | null
          current_title?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          published?: boolean | null
          registration_id?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          bootcamp_id?: string | null
          cohort?: string | null
          created_at?: string
          current_position?: string | null
          current_title?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          published?: boolean | null
          registration_id?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alumni_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumni_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
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
      project_members: {
        Row: {
          alumni_id: string
          created_at: string
          display_order: number | null
          id: string
          project_id: string
          role: string | null
        }
        Insert: {
          alumni_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          project_id: string
          role?: string | null
        }
        Update: {
          alumni_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_alumni_id_fkey"
            columns: ["alumni_id"]
            isOneToOne: false
            referencedRelation: "alumni"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_screenshots: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          photo_url: string
          project_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          photo_url: string
          project_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          photo_url?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_screenshots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          access_link: string | null
          bootcamp_id: string | null
          cohort: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          published: boolean | null
          title: string
          tools_technologies: string[] | null
          updated_at: string
          year: number | null
        }
        Insert: {
          access_link?: string | null
          bootcamp_id?: string | null
          cohort?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          published?: boolean | null
          title: string
          tools_technologies?: string[] | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          access_link?: string | null
          bootcamp_id?: string | null
          cohort?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          published?: boolean | null
          title?: string
          tools_technologies?: string[] | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
        ]
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
