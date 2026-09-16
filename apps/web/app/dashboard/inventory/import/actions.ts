'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../../lib/supabase/server'

export type PropertyImportState = {
  ok: boolean
  message: string
  imported: number
  failed: number
  errors: { row: number; message: string }[]
}

const initialState: PropertyImportState = { ok: true, message: '', imported: 0, failed: 0, errors: [] }
const allowedStatuses = new Set(['upcoming', 'pre_launch', 'launched', 'under_construction', 'ready_to_move', 'completed', 'sold_out', 'inactive'])
const allowedTypes = new Set(['apartment', 'villa', 'plot', 'independent_house', 'row_house', 'commercial', 'office', 'retail', 'other'])
const allowedCategories = new Set(['primary_sale', 'resale', 'rental'])

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

function text(row: Record<string, unknown>, key: string) {
  const value = row[key]
  return value == null ? '' : String(value).trim()
}

function optionalNumber(row: Record<string, unknown>, key: string) {
  const raw = text(row, key)
  if (!raw) return null
  const value = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid ${key}`)
  return value
}

function optionalInteger(row: Record<string, unknown>, key: string) {
  const value = optionalNumber(row, key)
  if (value != null && !Number.isInteger(value)) throw new Error(`${key} must be a whole number`)
  return value
}

function optionalDate(row: Record<string, unknown>, key: string) {
  const raw = text(row, key)
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${key}`)
  return date.toISOString().slice(0, 10)
}

async function requireManager() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) throw new Error('Authentication required.')

  const { data: role } = await supabase.rpc('crm_current_user_role')
  if (!['admin', 'manager', 'super_admin', 'owner'].includes(String(role ?? '').toLowerCase())) {
    throw new Error('Manager access required.')
  }
  return supabase
}

async function resolveLocation(supabase: Awaited<ReturnType<typeof createClient>>, row: Record<string, unknown>, city: string | null, state: string | null) {
  const locationName = text(row, 'location_name')
  const latitude = optionalNumber(row, 'latitude')
  const longitude = optionalNumber(row, 'longitude')
  if (latitude != null && latitude > 90) throw new Error('latitude must be <= 90')
  if (longitude != null && longitude > 180) throw new Error('longitude must be <= 180')
  if (latitude != null && longitude == null || latitude == null && longitude != null) throw new Error('latitude and longitude must be provided together')

  if (locationName) {
    const { data: named, error } = await supabase.from('locations').select('id, city, latitude, longitude').ilike('name', locationName).limit(25)
    if (error) throw new Error(error.message)
    const match = (named ?? []).find((location) => !city || !location.city || location.city.toLowerCase() === city.toLowerCase())
    if (match) return match.id
  }

  if (city) {
    const { data: cityRows, error } = await supabase.from('locations').select('id, name, state, latitude, longitude').ilike('name', city).eq('location_type', 'city').limit(10)
    if (error) throw new Error(error.message)
    const cityMatch = (cityRows ?? []).find((location) => !state || !location.state || location.state.toLowerCase() === state.toLowerCase()) ?? cityRows?.[0]
    if (cityMatch && !locationName) return cityMatch.id

    if (cityMatch && locationName) {
      const { data: locality, error: localityError } = await supabase.from('locations').select('id').ilike('name', locationName).eq('parent_location_id', cityMatch.id).maybeSingle()
      if (localityError) throw new Error(localityError.message)
      if (locality) return locality.id
    }
  }

  if (!locationName && !city) return null

  const name = locationName || city as string
  const slug = slugify(name)
  const locationType = locationName && city && locationName.toLowerCase() !== city.toLowerCase() ? 'locality' : 'city'
  const { data: created, error: createError } = await supabase.from('locations').insert({
    name,
    slug,
    location_type: locationType,
    parent_location_id: null,
    city: city || name,
    state,
    country: text(row, 'country') || 'India',
    latitude,
    longitude,
    aliases: [],
    metadata: { source: 'property_import' },
  }).select('id').single()
  if (createError || !created) throw new Error(createError?.message ?? 'Unable to create location')
  return created.id
}

export async function importProperties(_: PropertyImportState = initialState, formData: FormData): Promise<PropertyImportState> {
  try {
    const raw = String(formData.get('rows') ?? '')
    if (!raw) return { ...initialState, ok: false, message: 'No rows were provided.' }

    let parsed: unknown
    try { parsed = JSON.parse(raw) } catch { return { ...initialState, ok: false, message: 'Import data is not valid JSON.' } }
    if (!Array.isArray(parsed) || parsed.length === 0) return { ...initialState, ok: false, message: 'Add at least one property row.' }
    if (parsed.length > 5000) return { ...initialState, ok: false, message: 'Maximum 5,000 properties per import.' }
    if (parsed.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) {
      return { ...initialState, ok: false, message: 'Every import row must be an object.' }
    }

    const supabase = await requireManager()
    const errors: { row: number; message: string }[] = []
    let imported = 0

    for (let index = 0; index < parsed.length; index += 1) {
      const row = parsed[index] as Record<string, unknown>
      try {
        const name = text(row, 'name')
        if (!name) throw new Error('Project name is required')

        const propertyType = text(row, 'property_type') || 'apartment'
        const propertyCategory = text(row, 'property_category') || 'primary_sale'
        const status = text(row, 'status') || 'upcoming'
        if (!allowedTypes.has(propertyType)) throw new Error('Invalid property_type')
        if (!allowedCategories.has(propertyCategory)) throw new Error('Invalid property_category')
        if (!allowedStatuses.has(status)) throw new Error('Invalid status')

        const priceMin = optionalNumber(row, 'price_min')
        const priceMax = optionalNumber(row, 'price_max')
        if (priceMin != null && priceMax != null && priceMin > priceMax) throw new Error('price_min cannot exceed price_max')

        const city = text(row, 'city') || null
        const state = text(row, 'state') || null
        const locationId = await resolveLocation(supabase, row, city, state)
        const developerName = text(row, 'developer_name')
        let developerId: string | null = null
        if (developerName) {
          const developerSlug = slugify(developerName)
          const { data: existingDeveloper, error: developerLookupError } = await supabase
            .from('developers').select('id').eq('slug', developerSlug).maybeSingle()
          if (developerLookupError) throw new Error(developerLookupError.message)
          if (existingDeveloper) developerId = existingDeveloper.id
          else {
            const { data: createdDeveloper, error: developerCreateError } = await supabase
              .from('developers').insert({ name: developerName, slug: developerSlug }).select('id').single()
            if (developerCreateError || !createdDeveloper) throw new Error(developerCreateError?.message ?? 'Unable to create developer')
            developerId = createdDeveloper.id
          }
        }

        const { data: namedProjects, error: projectLookupError } = await supabase
          .from('projects').select('id, city').eq('name', name).limit(25)
        if (projectLookupError) throw new Error(projectLookupError.message)
        const existingProject = (namedProjects ?? []).find((project) => (project.city ?? null) === city) ?? null

        const commonPayload = {
          name,
          property_category: propertyCategory,
          property_type: propertyType,
          status,
          location_id: locationId,
          city,
          state,
          postal_code: text(row, 'postal_code') || null,
          address_line_1: text(row, 'address_line_1') || null,
          address_line_2: text(row, 'address_line_2') || null,
          latitude: optionalNumber(row, 'latitude'),
          longitude: optionalNumber(row, 'longitude'),
          price_min: priceMin,
          price_max: priceMax,
          total_units: optionalInteger(row, 'total_units'),
          total_towers: optionalInteger(row, 'total_towers'),
          total_floors: optionalInteger(row, 'total_floors'),
          land_area_sqft: optionalNumber(row, 'land_area_sqft'),
          launch_date: optionalDate(row, 'launch_date'),
          possession_date: optionalDate(row, 'possession_date'),
          rera_number: text(row, 'rera_number') || null,
          description: text(row, 'description') || null,
          highlights: text(row, 'highlights') || null,
          developer_id: developerId,
        }

        if (existingProject) {
          const { error: updateError } = await supabase.from('projects').update(commonPayload).eq('id', existingProject.id)
          if (updateError) throw new Error(updateError.message)
        } else {
          const baseSlug = slugify(name) || 'property'
          const { data: slugMatches, error: slugLookupError } = await supabase.from('projects').select('slug').like('slug', `${baseSlug}%`).limit(100)
          if (slugLookupError) throw new Error(slugLookupError.message)
          const usedSlugs = new Set((slugMatches ?? []).map((project) => project.slug))
          let slug = baseSlug
          let suffix = 2
          while (usedSlugs.has(slug)) { slug = `${baseSlug}-${suffix}`; suffix += 1 }
          const { error: insertError } = await supabase.from('projects').insert({ ...commonPayload, slug })
          if (insertError) throw new Error(insertError.message)
        }
        imported += 1
      } catch (error) {
        errors.push({ row: index + 2, message: error instanceof Error ? error.message : 'Unable to import row' })
      }
    }

    revalidatePath('/dashboard/inventory')
    return {
      ok: errors.length === 0,
      message: errors.length === 0
        ? `${imported} properties imported successfully.`
        : `${imported} imported, ${errors.length} failed. Review the row errors below.`,
      imported,
      failed: errors.length,
      errors: errors.slice(0, 50),
    }
  } catch (error) {
    return { ...initialState, ok: false, message: error instanceof Error ? error.message : 'Unable to import properties.' }
  }
}
