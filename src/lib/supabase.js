import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. ' +
    'Copy .env.example to .env and fill in your Supabase project credentials.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Bypass navigator.locks to prevent orphaned lock issues with React Strict Mode
      lock: async (name, acquireTimeout, fn) => fn(),
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: { eventsPerSecond: 20 },
    },
    global: {
      fetch: (...args) => {
        // Add a 10-second timeout to prevent hanging
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const [url, options = {}] = args
        return fetch(url, { ...options, signal: controller.signal })
          .finally(() => clearTimeout(timeout))
      },
    },
  }
)
