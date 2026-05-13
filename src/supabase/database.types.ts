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
      users: {
        Row: {
          id: string
          username: string | null
          email: string | null
          created_at: string
          total_study_time: number
          companion_clicks: number
          date_of_birth: string | null
          parent_email: string | null
          otp_code: string | null
          otp_expires_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          created_at?: string
          total_study_time?: number
          companion_clicks?: number
          date_of_birth?: string | null
          parent_email?: string | null
          otp_code?: string | null
          otp_expires_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          created_at?: string
          total_study_time?: number
          companion_clicks?: number
          date_of_birth?: string | null
          parent_email?: string | null
          otp_code?: string | null
          otp_expires_at?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          start_time: string
          end_time: string
          duration: number
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          start_time: string
          end_time: string
          duration: number
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          start_time?: string
          end_time?: string
          duration?: number
          is_verified?: boolean
          created_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      flowers: {
        Row: {
          id: string
          user_id: string
          subject: string
          flower_type_id: string
          grown_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          flower_type_id: string
          grown_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          flower_type_id?: string
          grown_at?: string
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
