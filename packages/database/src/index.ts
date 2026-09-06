import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

export * from './types'

export function createSupabaseClient(url: string, publishableKey: string): SupabaseClient<Database> {
  if (!url || !publishableKey) throw new Error('Supabase URL and publishable key are required')
  return createClient<Database>(url, publishableKey)
}
