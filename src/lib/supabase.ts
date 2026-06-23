import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _client
}

function createNoOpProxy(): any {
  const noop = () => Promise.resolve({ data: null, error: null })
  const handler: ProxyHandler<any> = {
    get() {
      return new Proxy(noop, handler)
    },
    apply() {
      return Promise.resolve({ data: null, error: null })
    },
  }
  return new Proxy({}, handler)
}

export const supabase = getSupabase() || createNoOpProxy()
