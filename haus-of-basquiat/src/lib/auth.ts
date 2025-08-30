import { supabase } from './supabase'
import type { UserRole, Database } from '@/types/database'

export type User = Database['public']['Tables']['user_profiles']['Row']

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  status: 'pending' | 'active' | 'banned'
  display_name: string | null
  avatar_url: string | null
  house_id: string | null
}

// Role hierarchy for permission checking
const roleHierarchy: Record<UserRole, number> = {
  'Applicant': 0,
  'Member': 1,
  'Leader': 2,
  'Admin': 3
}

export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => roleHierarchy[userRole] >= roleHierarchy[role])
}

export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole]
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'Admin'
}

export function isLeaderOrAbove(userRole: UserRole): boolean {
  return hasMinimumRole(userRole, 'Leader')
}

export function isMemberOrAbove(userRole: UserRole): boolean {
  return hasMinimumRole(userRole, 'Member')
}

export function isPending(status: string): boolean {
  return status === 'pending'
}

export function isActive(status: string): boolean {
  return status === 'active'
}

export async function signInWithEmail(email: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function signOut(): Promise<{ success?: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      status: profile.status,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      house_id: profile.house_id
    }
  } catch (error) {
    return null
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<Database['public']['Tables']['user_profiles']['Update']>
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function createUserApplication(
  userId: string,
  applicationData: any
): Promise<{ success?: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        applicant_data: applicationData,
        status: 'pending'
      })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}