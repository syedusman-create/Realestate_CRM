'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../lib/supabase/server'

export async function refreshRecommendations(leadId: string) {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) throw new Error('Unauthorized')

  const { error } = await supabase.rpc('run_property_recommendations', {
    p_lead_id: leadId,
    p_limit: 20,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/leads/${leadId}`)
}
