import { createClient } from '@supabase/supabase-js'

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },
  port: process.env.PORT || 3000,
}

// Supabase admin client (for service operations)
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
)
