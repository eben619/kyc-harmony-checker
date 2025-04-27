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
          middle_name: string | null
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
          middle_name?: string | null
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
          middle_name?: string | null
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
      page_translations: {
        Row: {
          created_at: string
          id: number
          key: string
          language_code: string | null
          value: string
        }
        Insert: {
          created_at?: string
          id?: number
          key: string
          language_code?: string | null
          value: string
        }
        Update: {
          created_at?: string
          id?: number
          key?: string
          language_code?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      tax_deductions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          deduction_date: string
          description: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          deduction_date?: string
          description: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          deduction_date?: string
          description?: string
          id?: string
          status?: string | null
          user_id?: string
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
      tax_receipts: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          id: string
          receipt_date: string
          receipt_number: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          id?: string
          receipt_date?: string
          receipt_number: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          receipt_date?: string
          receipt_number?: string
          user_id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
