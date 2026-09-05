'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '../../../lib/supabase/server'

const allowedStatuses = new Set(['upcoming', 'pre_launch', 'launched', 'under_construction', 'ready_to_move', 'completed', 'sold_out', 'inactive'])
const allowedTypes = new Set(['apartment', 'villa', 'plot', 'independent_house', 'row_house', 'commercial', 'office', 'retail', 'other'])

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

async function requireManager() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Unauthorized')

  const { data: user, error } = await supabase.from('users').select('id, tenant_code').eq('id', userId).maybeSingle()
  if (error || !user) throw new Error('CRM user profile not found')
  const { data: tenant } = await supabase.from('tenants').select('id').eq('tenant_code', user.tenant_code).maybeSingle()
  if (!tenant) throw new Error('Tenant not found')

  const { data: claims2 } = await supabase.rpc('crm_current_user_role')
  const role = String(claims2 ?? '')
  if (!['admin', 'manager', 'super_admin', 'owner'].includes(role.toLowerCase())) throw new Error('Manager access required')
  return { supabase, userId, tenantId: tenant.id }
}

export async function createProject(formData: FormData) {
  const { supabase, userId } = await requireManager()
  const name = String(formData.get('name') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim() || null
  const state = String(formData.get('state') ?? '').trim() || null
  const propertyType = String(formData.get('property_type') ?? 'apartment')
  const propertyCategory = String(formData.get('property_category') ?? 'primary_sale')
  const status = String(formData.get('status') ?? 'upcoming')
  const priceMin = Number(formData.get('price_min') || 0) || null
  const priceMax = Number(formData.get('price_max') || 0) || null
  const developerName = String(formData.get('developer_name') ?? '').trim()

  if (!name) throw new Error('Project name is required')
  if (!allowedTypes.has(propertyType)) throw new Error('Invalid property type')
  if (!allowedStatuses.has(status)) throw new Error('Invalid project status')

  let developerId: string | null = null
  if (developerName) {
    const developerSlug = slugify(developerName)
    const { data: existing } = await supabase.from('developers').select('id').eq('slug', developerSlug).maybeSingle()
    if (existing) developerId = existing.id
    else {
      const { data: created, error } = await supabase.from('developers').insert({ name: developerName, slug: developerSlug }).select('id').single()
      if (error || !created) throw new Error(error?.message ?? 'Unable to create developer')
      developerId = created.id
    }
  }

  const baseSlug = slugify(name)
  const { data: existingSlug } = await supabase.from('projects').select('id').eq('slug', baseSlug).maybeSingle()
  const slug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug

  const { data: project, error } = await supabase.from('projects').insert({
    name,
    slug,
    property_category: propertyCategory,
    property_type: propertyType,
    status,
    city,
    state,
    price_min: priceMin,
    price_max: priceMax,
    developer_id: developerId,
  }).select('id').single()

  if (error || !project) throw new Error(error?.message ?? 'Unable to create project')

  revalidatePath('/dashboard/inventory')
  redirect(`/dashboard/inventory/${project.id}`)
}
