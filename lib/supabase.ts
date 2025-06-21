import { createClient } from '@supabase/supabase-js'

// Try multiple ways to access environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : '') ||
                   'https://placeholder.supabase.co'

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       'placeholder_key'

console.log('Supabase configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  envCheck: {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-4) : 'none'
  },
  isClient: typeof window !== 'undefined',
  isServer: typeof window === 'undefined'
})

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder_key') {
  console.error('Missing or invalid Supabase environment variables:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isPlaceholderUrl: supabaseUrl === 'https://placeholder.supabase.co',
    isPlaceholderKey: supabaseAnonKey === 'placeholder_key'
  })
}

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
) 