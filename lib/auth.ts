import { supabase } from './supabase'
import { User } from './database.types'
import { useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
}

// React hook for authentication
export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

export async function signUp(email: string, password: string, userType: 'designer' | 'tester', name?: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your environment variables.')
  }

  console.log('Starting signup process for:', email, 'with user type:', userType)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: userType,
        name: name || email.split('@')[0]
      }
    }
  })

  if (error) {
    console.error('Supabase auth signup error:', error)
    throw error
  }

  console.log('Auth signup successful, user created:', data.user?.id)

  // Manually create user profile
  if (data.user) {
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          user_type: userType,
          full_name: name || email.split('@')[0]
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't throw error here - user is still created in auth
        // Just log the error for debugging
      } else {
        console.log('User profile created successfully')
      }
    } catch (profileError: any) {
      console.error('Profile creation failed:', profileError)
      // Don't throw error here - user is still created in auth
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your environment variables.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your environment variables.')
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile(userId: string): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
} 