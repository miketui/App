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
      user_profiles: {
        Row: {
          id: string
          email: string
          role: 'Applicant' | 'Member' | 'Leader' | 'Admin'
          house_id: string | null
          status: 'pending' | 'active' | 'banned'
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          pronouns: string | null
          ballroom_experience: string | null
          social_links: Json
          profile_data: Json
          login_code: string | null
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'Applicant' | 'Member' | 'Leader' | 'Admin'
          house_id?: string | null
          status?: 'pending' | 'active' | 'banned'
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          pronouns?: string | null
          ballroom_experience?: string | null
          social_links?: Json
          profile_data?: Json
          login_code?: string | null
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'Applicant' | 'Member' | 'Leader' | 'Admin'
          house_id?: string | null
          status?: 'pending' | 'active' | 'banned'
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          pronouns?: string | null
          ballroom_experience?: string | null
          social_links?: Json
          profile_data?: Json
          login_code?: string | null
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      houses: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          leader_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          leader_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          leader_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string | null
          media_urls: string[] | null
          ai_caption: string | null
          moderation_status: 'pending' | 'approved' | 'flagged'
          likes_count: number
          comments_count: number
          house_id: string | null
          visibility: 'public' | 'house_only' | 'members_only'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content?: string | null
          media_urls?: string[] | null
          ai_caption?: string | null
          moderation_status?: 'pending' | 'approved' | 'flagged'
          likes_count?: number
          comments_count?: number
          house_id?: string | null
          visibility?: 'public' | 'house_only' | 'members_only'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string | null
          media_urls?: string[] | null
          ai_caption?: string | null
          moderation_status?: 'pending' | 'approved' | 'flagged'
          likes_count?: number
          comments_count?: number
          house_id?: string | null
          visibility?: 'public' | 'house_only' | 'members_only'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          sender_id: string
          content: string | null
          message_type: 'text' | 'image' | 'file'
          file_url: string | null
          reply_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          sender_id: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file'
          file_url?: string | null
          reply_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          sender_id?: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file'
          file_url?: string | null
          reply_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_threads: {
        Row: {
          id: string
          name: string | null
          thread_type: 'direct' | 'group'
          participants: string[]
          created_by: string | null
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          thread_type: 'direct' | 'group'
          participants: string[]
          created_by?: string | null
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          thread_type?: 'direct' | 'group'
          participants?: string[]
          created_by?: string | null
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'like' | 'comment' | 'message' | 'application' | 'system'
          title: string
          content: string | null
          related_id: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'like' | 'comment' | 'message' | 'application' | 'system'
          title: string
          content?: string | null
          related_id?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'like' | 'comment' | 'message' | 'application' | 'system'
          title?: string
          content?: string | null
          related_id?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          category: string
          file_url: string
          file_type: string
          file_size: number | null
          uploader_id: string
          access_level: 'Applicant' | 'Member' | 'Leader' | 'Admin'
          download_count: number
          moderation_status: 'pending' | 'approved' | 'flagged'
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          file_url: string
          file_type: string
          file_size?: number | null
          uploader_id: string
          access_level?: 'Applicant' | 'Member' | 'Leader' | 'Admin'
          download_count?: number
          moderation_status?: 'pending' | 'approved' | 'flagged'
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          file_url?: string
          file_type?: string
          file_size?: number | null
          uploader_id?: string
          access_level?: 'Applicant' | 'Member' | 'Leader' | 'Admin'
          download_count?: number
          moderation_status?: 'pending' | 'approved' | 'flagged'
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
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

export type UserRole = Database['public']['Tables']['user_profiles']['Row']['role']
export type UserStatus = Database['public']['Tables']['user_profiles']['Row']['status']
export type PostVisibility = Database['public']['Tables']['posts']['Row']['visibility']
export type ModerationStatus = Database['public']['Tables']['posts']['Row']['moderation_status']
export type NotificationType = Database['public']['Tables']['notifications']['Row']['type']