'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/auth/permissions'
import { normalizeCrmRole } from '@/lib/auth/roles'
import { redirect } from 'next/navigation'
import type {
  InventoryActionState,
  ListingStatus,
  ListingType,
  UnitStatus,
} from '@/lib/crm/inventory/types'

async function getCurrentUserContext() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, tenant_code, workspace_id, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!profile || !profile.is_active) {
    throw new Error('Active user profile not found')
  }

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, tenant_code, is_active')
    .eq('tenant_code', profile.tenant_code)
    .maybeSingle()

  if (tenantError) {
    throw new Error(tenantError.message)
  }

  if (!tenant || !tenant.is_active) {
    throw new Error('Active tenant not found')
  }

  return {
    supabase,
    user,
    profile,
    tenant,
  }
}

export async function updateUnitStatus(
  unitId: string,
  status: UnitStatus,
): Promise<InventoryActionState> {
  try {
    const { supabase } = await getCurrentUserContext()

    const { error } = await supabase
      .from('units')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', unitId)

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath(`/dashboard/inventory/${unitId}`)

    return {
      ok: true,
      message: 'Unit status updated.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Unable to update unit.',
    }
  }
}

export async function updateUnit(
  unitId: string,
  formData: FormData,
): Promise<InventoryActionState> {
  try {
    const { supabase } = await getCurrentUserContext()

    const projectId = String(formData.get('project_id') ?? '').trim()
    const unitNumber = String(formData.get('unit_number') ?? '').trim()

    if (!projectId) {
      return {
        ok: false,
        message: 'Project is required.',
      }
    }

    if (!unitNumber) {
      return {
        ok: false,
        message: 'Unit number is required.',
      }
    }

    const numeric = (name: string) => {
      const value = String(formData.get(name) ?? '').trim()
      if (!value) return null

      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }

    const integer = (name: string) => {
      const value = String(formData.get(name) ?? '').trim()
      if (!value) return null

      const parsed = Number.parseInt(value, 10)
      return Number.isFinite(parsed) ? parsed : null
    }

    const status = String(formData.get('status') ?? 'available') as UnitStatus

    const { error } = await supabase
      .from('units')
      .update({
        project_id: projectId,
        phase_id: String(formData.get('phase_id') ?? '').trim() || null,
        tower_id: String(formData.get('tower_id') ?? '').trim() || null,
        configuration_id:
          String(formData.get('configuration_id') ?? '').trim() || null,
        unit_number: unitNumber,
        floor_number: integer('floor_number'),
        carpet_area_sqft: numeric('carpet_area_sqft'),
        builtup_area_sqft: numeric('builtup_area_sqft'),
        super_builtup_area_sqft: numeric('super_builtup_area_sqft'),
        balcony_area_sqft: numeric('balcony_area_sqft'),
        bedrooms: numeric('bedrooms'),
        bathrooms: numeric('bathrooms'),
        facing: String(formData.get('facing') ?? '').trim() || null,
        parking_count: integer('parking_count'),
        asking_price: numeric('asking_price'),
        price_per_sqft: numeric('price_per_sqft'),
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', unitId)

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath(`/dashboard/inventory/${unitId}`)

    return {
      ok: true,
      message: 'Unit updated successfully.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Unable to update unit.',
    }
  }
}

export async function updateListing(
  listingId: string,
  unitId: string,
  formData: FormData,
): Promise<InventoryActionState> {
  try {
    const { supabase } = await getCurrentUserContext()

    const numeric = (name: string) => {
      const value = String(formData.get(name) ?? '').trim()
      if (!value) return null

      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }

    const listingType = String(
      formData.get('listing_type') ?? 'primary_sale',
    ) as ListingType

    const status = String(
      formData.get('listing_status') ?? 'draft',
    ) as ListingStatus

    const availableFrom =
      String(formData.get('available_from') ?? '').trim() || null

    const expiresAt =
      String(formData.get('expires_at') ?? '').trim() || null

    const { error } = await supabase
      .from('listings')
      .update({
        listing_type: listingType,
        status,
        asking_price: numeric('listing_asking_price'),
        rent_amount: numeric('rent_amount'),
        deposit_amount: numeric('deposit_amount'),
        maintenance_amount: numeric('maintenance_amount'),
        available_from: availableFrom,
        furnishing:
          String(formData.get('furnishing') ?? '').trim() || null,
        description:
          String(formData.get('description') ?? '').trim() || null,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .eq('unit_id', unitId)

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath(`/dashboard/inventory/${unitId}`)

    return {
      ok: true,
      message: 'Listing updated successfully.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update listing.',
    }
  }
}

export async function createListing(
  unitId: string,
  formData: FormData,
): Promise<InventoryActionState> {
  try {
    const { supabase, tenant, profile } = await getCurrentUserContext()

    const listingType = String(
      formData.get('listing_type') ?? 'primary_sale',
    ) as ListingType

    const status = String(
      formData.get('listing_status') ?? 'draft',
    ) as ListingStatus

    const numeric = (name: string) => {
      const value = String(formData.get(name) ?? '').trim()
      if (!value) return null

      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }

    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('id')
      .eq('id', unitId)
      .maybeSingle()

    if (unitError) {
      return {
        ok: false,
        message: unitError.message,
      }
    }

    if (!unit) {
      return {
        ok: false,
        message: 'Unit not found.',
      }
    }

    const { error } = await supabase.from('listings').insert({
      tenant_id: tenant.id,
      unit_id: unitId,
      listing_type: listingType,
      agent_id: profile.id,
      status,
      asking_price: numeric('listing_asking_price'),
      rent_amount: numeric('rent_amount'),
      deposit_amount: numeric('deposit_amount'),
      maintenance_amount: numeric('maintenance_amount'),
      available_from:
        String(formData.get('available_from') ?? '').trim() || null,
      furnishing:
        String(formData.get('furnishing') ?? '').trim() || null,
      description:
        String(formData.get('description') ?? '').trim() || null,
      expires_at:
        String(formData.get('expires_at') ?? '').trim() || null,
    })

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath(`/dashboard/inventory/${unitId}`)

    return {
      ok: true,
      message: 'Listing created successfully.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create listing.',
    }
  }
}

function parseInventoryNumber(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? '').trim()
  if (!raw) return null

  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(\`\${name} must be a valid non-negative number.\`)
  }

  return value
}

function parseInventoryInteger(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? '').trim()
  if (!raw) return null

  const value = Number(raw)
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(\`\${name} must be a valid non-negative whole number.\`)
  }

  return value
}

const INVENTORY_UNIT_STATUSES: UnitStatus[] = [
  'available',
  'reserved',
  'sold',
  'leased',
  'under_maintenance',
  'off_market',
]

const INVENTORY_LISTING_TYPES: ListingType[] = [
  'primary_sale',
  'resale',
  'rent',
  'lease',
]

const INVENTORY_LISTING_STATUSES: ListingStatus[] = [
  'draft',
  'active',
  'reserved',
  'under_offer',
  'closed',
  'expired',
  'withdrawn',
]

const INVENTORY_FURNISHING_OPTIONS = [
  'unfurnished',
  'semi_furnished',
  'fully_furnished',
] as const

export async function createUnit(
  _previousState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  try {
    const { supabase, profile } = await getCurrentUserContext()
    const role = normalizeCrmRole(profile.role)

    if (!hasPermission(role, 'inventory.manage')) {
      return {
        ok: false,
        message: 'You do not have permission to create inventory.',
      }
    }

    const projectId = String(formData.get('project_id') ?? '').trim()
    const phaseId = String(formData.get('phase_id') ?? '').trim() || null
    const towerId = String(formData.get('tower_id') ?? '').trim() || null
    const configurationId =
      String(formData.get('configuration_id') ?? '').trim() || null
    const unitNumber = String(formData.get('unit_number') ?? '').trim()
    const status = String(formData.get('status') ?? 'available') as UnitStatus

    if (!projectId) {
      return { ok: false, message: 'Project is required.' }
    }

    if (!unitNumber) {
      return { ok: false, message: 'Unit number is required.' }
    }

    if (!INVENTORY_UNIT_STATUSES.includes(status)) {
      return { ok: false, message: 'Select a valid unit status.' }
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle()

    if (projectError) throw new Error(projectError.message)
    if (!project) return { ok: false, message: 'Selected project was not found.' }

    if (phaseId) {
      const { data: phase, error } = await supabase
        .from('project_phases')
        .select('id, project_id')
        .eq('id', phaseId)
        .maybeSingle()

      if (error) throw new Error(error.message)
      if (!phase || phase.project_id !== projectId) {
        return { ok: false, message: 'Selected phase does not belong to the project.' }
      }
    }

    if (towerId) {
      if (!phaseId) {
        return { ok: false, message: 'A tower requires a phase.' }
      }

      const { data: tower, error } = await supabase
        .from('project_towers')
        .select('id, phase_id')
        .eq('id', towerId)
        .maybeSingle()

      if (error) throw new Error(error.message)
      if (!tower || tower.phase_id !== phaseId) {
        return { ok: false, message: 'Selected tower does not belong to the phase.' }
      }
    }

    if (configurationId) {
      const { data: configuration, error } = await supabase
        .from('project_configurations')
        .select('id, project_id')
        .eq('id', configurationId)
        .maybeSingle()

      if (error) throw new Error(error.message)
      if (!configuration || configuration.project_id !== projectId) {
        return {
          ok: false,
          message: 'Selected configuration does not belong to the project.',
        }
      }
    }

    const { data: duplicate, error: duplicateError } = await supabase
      .from('units')
      .select('id')
      .eq('project_id', projectId)
      .ilike('unit_number', unitNumber)
      .limit(1)
      .maybeSingle()

    if (duplicateError) throw new Error(duplicateError.message)
    if (duplicate) {
      return {
        ok: false,
        message: \`Unit "\${unitNumber}" already exists in this project.\`,
      }
    }

    const { data: unit, error: unitError } = await supabase
      .from('units')
      .insert({
        project_id: projectId,
        phase_id: phaseId,
        tower_id: towerId,
        configuration_id: configurationId,
        unit_number: unitNumber,
        floor_number: parseInventoryInteger(formData, 'floor_number'),
        carpet_area_sqft: parseInventoryNumber(formData, 'carpet_area_sqft'),
        builtup_area_sqft: parseInventoryNumber(formData, 'builtup_area_sqft'),
        super_builtup_area_sqft: parseInventoryNumber(formData, 'super_builtup_area_sqft'),
        balcony_area_sqft: parseInventoryNumber(formData, 'balcony_area_sqft'),
        bedrooms: parseInventoryNumber(formData, 'bedrooms'),
        bathrooms: parseInventoryNumber(formData, 'bathrooms'),
        facing: String(formData.get('facing') ?? '').trim() || null,
        parking_count: parseInventoryInteger(formData, 'parking_count'),
        asking_price: parseInventoryNumber(formData, 'asking_price'),
        price_per_sqft: parseInventoryNumber(formData, 'price_per_sqft'),
        status,
      })
      .select('id')
      .single()

    if (unitError || !unit) {
      throw new Error(unitError?.message ?? 'Unable to create inventory unit.')
    }

    if (String(formData.get('create_listing') ?? '') === 'yes') {
      const listingType = String(
        formData.get('listing_type') ?? 'primary_sale',
      ) as ListingType
      const listingStatus = String(
        formData.get('listing_status') ?? 'draft',
      ) as ListingStatus
      const furnishing = String(formData.get('furnishing') ?? '').trim()

      if (!INVENTORY_LISTING_TYPES.includes(listingType)) {
        return { ok: false, message: 'Select a valid listing type.' }
      }

      if (!INVENTORY_LISTING_STATUSES.includes(listingStatus)) {
        return { ok: false, message: 'Select a valid listing status.' }
      }

      if (
        furnishing &&
        !INVENTORY_FURNISHING_OPTIONS.includes(
          furnishing as (typeof INVENTORY_FURNISHING_OPTIONS)[number],
        )
      ) {
        return { ok: false, message: 'Select a valid furnishing option.' }
      }

      const availableFrom =
        String(formData.get('available_from') ?? '').trim() || null
      const expiresAtRaw =
        String(formData.get('expires_at') ?? '').trim() || null
      const expiresAt = expiresAtRaw
        ? new Date(expiresAtRaw).toISOString()
        : null

      if (expiresAtRaw && Number.isNaN(new Date(expiresAtRaw).getTime())) {
        return { ok: false, message: 'Enter a valid listing expiry date.' }
      }

      const { error: listingError } = await supabase.from('listings').insert({
        tenant_id: (await supabase.rpc('crm_current_tenant_id')).data,
        unit_id: unit.id,
        listing_type: listingType,
        agent_id: profile.id,
        status: listingStatus,
        asking_price: parseInventoryNumber(formData, 'listing_asking_price'),
        rent_amount: parseInventoryNumber(formData, 'rent_amount'),
        deposit_amount: parseInventoryNumber(formData, 'deposit_amount'),
        maintenance_amount: parseInventoryNumber(formData, 'maintenance_amount'),
        available_from: availableFrom,
        furnishing: furnishing || null,
        description: String(formData.get('description') ?? '').trim() || null,
        expires_at: expiresAt,
      })

      if (listingError) {
        return {
          ok: false,
          message: \`Unit created, but listing creation failed: \${listingError.message}\`,
        }
      }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/inventory/projects')
    redirect(\`/dashboard/inventory/\${unit.id}\`)
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Unable to create inventory.',
    }
  }
}
