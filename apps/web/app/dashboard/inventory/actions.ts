'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '../../../lib/supabase/server'

const allowedStatuses = new Set(['upcoming', 'pre_launch', 'launched', 'under_construction', 'ready_to_move', 'completed', 'sold_out', 'inactive'])
const allowedTypes = new Set(['apartment', 'villa', 'plot', 'independent_house', 'row_house', 'commercial', 'office', 'retail', 'other'])
const allowedCategories = new Set(['primary_sale', 'resale', 'rental'])
const allowedUnitStatuses = new Set(['available', 'reserved', 'sold', 'leased', 'under_maintenance', 'off_market'])

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

function optionalNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? '').trim()
  if (!raw) return null
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid value for ${key}`)
  return value
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

  const { data: roleData } = await supabase.rpc('crm_current_user_role')
  const role = String(roleData ?? '')
  if (!['admin', 'manager', 'super_admin', 'owner'].includes(role.toLowerCase())) throw new Error('Manager access required')
  return { supabase, userId, tenantId: tenant.id }
}

export async function createProject(formData: FormData) {
  const { supabase } = await requireManager()
  const name = String(formData.get('name') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim() || null
  const state = String(formData.get('state') ?? '').trim() || null
  const propertyType = String(formData.get('property_type') ?? 'apartment')
  const propertyCategory = String(formData.get('property_category') ?? 'primary_sale')
  const status = String(formData.get('status') ?? 'upcoming')
  const priceMin = optionalNumber(formData, 'price_min')
  const priceMax = optionalNumber(formData, 'price_max')
  const developerName = String(formData.get('developer_name') ?? '').trim()

  if (!name) throw new Error('Project name is required')
  if (!allowedTypes.has(propertyType)) throw new Error('Invalid property type')
  if (!allowedCategories.has(propertyCategory)) throw new Error('Invalid property category')
  if (!allowedStatuses.has(status)) throw new Error('Invalid project status')
  if (priceMin != null && priceMax != null && priceMin > priceMax) throw new Error('Minimum price cannot exceed maximum price')

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

export async function createConfiguration(projectId: string, formData: FormData) {
  const { supabase } = await requireManager()
  const projectName = String(formData.get('project_name') ?? '').trim()
  const configurationName = String(formData.get('configuration_name') ?? '').trim()
  const bedrooms = Number(formData.get('bedrooms') ?? 0)
  const bathrooms = optionalNumber(formData, 'bathrooms')
  const superBuiltupMin = optionalNumber(formData, 'super_builtup_area_min')
  const superBuiltupMax = optionalNumber(formData, 'super_builtup_area_max')
  const priceMin = optionalNumber(formData, 'price_min')
  const priceMax = optionalNumber(formData, 'price_max')
  const availableUnits = Number(formData.get('total_available_units') ?? 0)

  if (!projectId) throw new Error('Project is required')
  if (!configurationName) throw new Error('Configuration name is required')
  if (!Number.isInteger(bedrooms) || bedrooms < 0) throw new Error('Bedrooms must be a non-negative whole number')
  if (bathrooms != null && bathrooms < 0) throw new Error('Bathrooms cannot be negative')
  if (superBuiltupMin != null && superBuiltupMax != null && superBuiltupMin > superBuiltupMax) throw new Error('Minimum area cannot exceed maximum area')
  if (priceMin != null && priceMax != null && priceMin > priceMax) throw new Error('Minimum price cannot exceed maximum price')
  if (!Number.isInteger(availableUnits) || availableUnits < 0) throw new Error('Available units must be a non-negative whole number')

  const { error } = await supabase.from('project_configurations').insert({
    project_id: projectId,
    configuration_name: configurationName,
    bedrooms,
    bathrooms,
    super_builtup_area_min: superBuiltupMin,
    super_builtup_area_max: superBuiltupMax,
    price_min: priceMin,
    price_max: priceMax,
    total_available_units: availableUnits,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/inventory/${projectId}`)
  redirect(`/dashboard/inventory/${projectId}`)
}

export async function createUnit(projectId: string, formData: FormData) {
  const { supabase } = await requireManager()
  const unitNumber = String(formData.get('unit_number') ?? '').trim()
  const configurationId = String(formData.get('configuration_id') ?? '').trim() || null
  const floorNumber = optionalNumber(formData, 'floor_number')
  const bedrooms = optionalNumber(formData, 'bedrooms')
  const bathrooms = optionalNumber(formData, 'bathrooms')
  const superBuiltupArea = optionalNumber(formData, 'super_builtup_area_sqft')
  const askingPrice = optionalNumber(formData, 'asking_price')
  const pricePerSqft = optionalNumber(formData, 'price_per_sqft')
  const parkingCount = optionalNumber(formData, 'parking_count')
  const facing = String(formData.get('facing') ?? '').trim() || null
  const status = String(formData.get('status') ?? 'available')

  if (!projectId) throw new Error('Project is required')
  if (!unitNumber) throw new Error('Unit number is required')
  if (!allowedUnitStatuses.has(status)) throw new Error('Invalid unit status')
  if (floorNumber != null && !Number.isInteger(floorNumber)) throw new Error('Floor must be a whole number')
  if (bedrooms != null && !Number.isInteger(bedrooms)) throw new Error('Bedrooms must be a whole number')
  if (parkingCount != null && !Number.isInteger(parkingCount)) throw new Error('Parking count must be a whole number')

  if (configurationId) {
    const { data: configuration } = await supabase.from('project_configurations').select('id').eq('id', configurationId).eq('project_id', projectId).maybeSingle()
    if (!configuration) throw new Error('Configuration does not belong to this project')
  }

  const { error } = await supabase.from('units').insert({
    project_id: projectId,
    configuration_id: configurationId,
    unit_number: unitNumber,
    floor_number: floorNumber,
    bedrooms,
    bathrooms,
    super_builtup_area_sqft: superBuiltupArea,
    asking_price: askingPrice,
    price_per_sqft: pricePerSqft,
    parking_count: parkingCount,
    facing,
    status,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/inventory/${projectId}`)
  redirect(`/dashboard/inventory/${projectId}`)
}
