import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const createSupabaseClient = (getAccessToken: () => Promise<string | null>) => {
  return createClient(supabaseUrl, supabaseKey, {
    accessToken: async () => getAccessToken(),
  })
}
