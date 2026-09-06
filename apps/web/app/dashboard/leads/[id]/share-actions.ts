'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../lib/supabase/server'

export type ShareMatchesState = {
  ok: boolean
  message: string
  whatsappUrl?: string
}

type MatchRow = {
  project_id: string
  project_name: string
  unit_id: string
  unit_number: string
  listing_id: string | null
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqft: number | null
  facing: string | null
}

function safeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function formatMoney(value: number | null) {
  if (value == null) return 'Price on request'
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

export async function shareMatchedProperties(_: ShareMatchesState, formData: FormData): Promise<ShareMatchesState> {
  const supabase = await createClient()
  const leadId = safeText(formData.get('lead_id'))
  const rawMatches = formData.getAll('match').map(safeText).filter(Boolean)

  if (!leadId) return { ok: false, message: 'Lead reference is missing.' }
  if (!rawMatches.length) return { ok: false, message: 'Select at least one matched property.' }
  if (rawMatches.length > 6) return { ok: false, message: 'Select up to 6 properties per WhatsApp share.' }

  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) return { ok: false, message: 'Your session has expired. Please sign in again.' }

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, person_id, assigned_user_id, tenant_id')
    .eq('id', leadId)
    .maybeSingle()
  if (leadError || !lead) return { ok: false, message: 'Lead not found.' }
  if (lead.assigned_user_id !== userId) {
    const { data: user, error: userError } = await supabase.from('users').select('role').eq('id', userId).maybeSingle()
    if (userError || !user || !['admin', 'manager', 'super_admin', 'owner'].includes(user.role.toLowerCase())) {
      return { ok: false, message: 'You can only share properties for leads assigned to you.' }
    }
  }

  const parsed = rawMatches.map((value) => {
    const [projectId, unitId, listingId] = value.split('|')
    return { projectId, unitId: unitId || null, listingId: listingId || null }
  }).filter((item) => item.projectId && item.unitId)

  if (!parsed.length) return { ok: false, message: 'Selected properties are invalid.' }

  const unitIds = parsed.map((item) => item.unitId).filter((id): id is string => Boolean(id))
  const listingIds = parsed.map((item) => item.listingId).filter((id): id is string => Boolean(id))

  const [{ data: units }, { data: listings }, { data: projects }, { data: phone }] = await Promise.all([
    supabase.from('units').select('id, project_id, unit_number, bedrooms, bathrooms, super_builtup_area_sqft, asking_price, facing, status').in('id', unitIds),
    listingIds.length ? supabase.from('listings').select('id, unit_id, asking_price, rent_amount, status').in('id', listingIds) : Promise.resolve({ data: [] as { id: string; unit_id: string; asking_price: number | null; rent_amount: number | null; status: string }[] }),
    supabase.from('projects').select('id, name').in('id', parsed.map((item) => item.projectId)),
    supabase.from('person_phones').select('normalized_phone').eq('person_id', lead.person_id).eq('is_primary', true).maybeSingle(),
  ])

  const projectById = new Map((projects ?? []).map((project) => [project.id, project]))
  const listingById = new Map((listings ?? []).map((listing) => [listing.id, listing]))
  const unitById = new Map((units ?? []).map((unit) => [unit.id, unit]))

  const verified: MatchRow[] = []
  for (const item of parsed) {
    const unit = item.unitId ? unitById.get(item.unitId) : null
    const listing = item.listingId ? listingById.get(item.listingId) : null
    const project = projectById.get(item.projectId)
    if (!project || !unit || unit.project_id !== project.id) continue
    if (unit.status !== 'available' && unit.status !== 'reserved') continue
    verified.push({
      project_id: project.id,
      project_name: project.name,
      unit_id: unit.id,
      unit_number: unit.unit_number,
      listing_id: listing?.id ?? null,
      price: listing?.rent_amount ?? listing?.asking_price ?? unit.asking_price,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      area_sqft: unit.super_builtup_area_sqft,
      facing: unit.facing,
    })
  }

  if (!verified.length) return { ok: false, message: 'None of the selected properties are currently shareable.' }
  if (phone?.normalized_phone == null) return { ok: false, message: 'This lead has no primary phone number.' }

  const messageBody = [
    'Hi! Based on your requirement, here are a few property options I shortlisted for you:',
    '',
    ...verified.map((match, index) => {
      const details = [
        `Unit ${match.unit_number}`,
        match.bedrooms != null ? `${match.bedrooms} BHK` : null,
        match.area_sqft != null ? `${Number(match.area_sqft).toLocaleString('en-IN')} sq ft` : null,
        match.facing ? `${match.facing} facing` : null,
        formatMoney(match.price),
      ].filter(Boolean).join(' · ')
      return `${index + 1}. ${match.project_name} — ${details}`
    }),
    '',
    'Let me know which ones you would like to explore. I can arrange a site visit and share more details.'
  ].join('\n')

  const db = supabase as unknown as {
    from: (table: string) => {
      insert: (values: Record<string, unknown> | Record<string, unknown>[]) => {
        select: (columns?: string) => { single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> }
      }
    }
  }

  const { data: share, error: shareError } = await db.from('communication_shares').insert({
    tenant_id: lead.tenant_id,
    lead_id: lead.id,
    person_id: lead.person_id,
    agent_id: userId,
    channel: 'whatsapp',
    message_body: messageBody,
  }).select('id').single()

  if (shareError || !share) return { ok: false, message: shareError?.message ?? 'Unable to create share record.' }

  const itemRows = verified.map((match) => ({ share_id: share.id, project_id: match.project_id, unit_id: match.unit_id, listing_id: match.listing_id }))
  const { error: itemError } = await db.from('communication_share_items').insert(itemRows)
  if (itemError) return { ok: false, message: itemError.message }

  const interactionRows = verified.map((match) => ({
    tenant_id: lead.tenant_id,
    person_id: lead.person_id,
    lead_id: lead.id,
    project_id: match.project_id,
    unit_id: match.unit_id,
    listing_id: match.listing_id,
    interaction_type: 'shared',
    source: 'whatsapp',
    agent_id: userId,
    notes: `Shared via CRM WhatsApp share ${share.id}`,
  }))
  const { error: interactionError } = await db.from('property_interactions').insert(interactionRows)
  if (interactionError) return { ok: false, message: interactionError.message }

  revalidatePath(`/dashboard/leads/${lead.id}`)
  const whatsappUrl = `https://wa.me/${phone.normalized_phone.replace(/^\+/, '')}?text=${encodeURIComponent(messageBody)}`
  return { ok: true, message: `${verified.length} propert${verified.length === 1 ? 'y' : 'ies'} share recorded.`, whatsappUrl }
}
