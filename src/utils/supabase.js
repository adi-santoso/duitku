import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[Supabase] Init:', { url: supabaseUrl, keyLength: supabaseAnonKey?.length })

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
