export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      faq_translations: {
        Row: {
          answer: string
          created_at: string
          faq_id: number | null
          id: number
          language_code: string | null
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          faq_id?: number | null
          id?: number
          language_code?: string | null
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          faq_id?: number | null
          id?: number
          language_code?: string | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_translations_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faq_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: number
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: number
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: number
          question?: string
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          biometric_steps: Json | null
          created_at: string | null
          document_type: string
          form_data: Json | null
          id: string
          liveness_score: number | null
          match_score: number | null
          ocr_extracted_data: Json | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          biometric_steps?: Json | null
          created_at?: string | null
          document_type: string
          form_data?: Json | null
          id?: string
          liveness_score?: number | null
          match_score?: number | null
          ocr_extracted_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          biometric_steps?: Json | null
          created_at?: string | null
          document_type?: string
          form_data?: Json | null
          id?: string
          liveness_score?: number | null
          match_score?: number | null
          ocr_extracted_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string
          id: number
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      tax_forms: {
        Row: {
          applicable_countries: string[]
          created_at: string
          description: string | null
          form_code: string
          form_name: string
          id: number
        }
        Insert: {
          applicable_countries: string[]
          created_at?: string
          description?: string | null
          form_code: string
          form_name: string
          id?: number
        }
        Update: {
          applicable_countries?: string[]
          created_at?: string
          description?: string | null
          form_code?: string
          form_name?: string
          id?: number
        }
        Relationships: []
      }
      user_tax_forms: {
        Row: {
          form_data: Json | null
          form_id: number | null
          id: string
          status: string | null
          submitted_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          form_data?: Json | null
          form_id?: number | null
          id?: string
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          form_data?: Json | null
          form_id?: number | null
          id?: string
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tax_forms_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "tax_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_accounts: {
        Row: {
          biometric_hash: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          biometric_hash?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          biometric_hash?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          wallet_address?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
