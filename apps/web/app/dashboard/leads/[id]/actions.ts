'use server'

import { revalidatePath } from 'next/cache'

import type {
  LeadPriority,
  LeadTemperature,
  TableUpdate,
} from '@realestate-crm/database'

import { createClient } from '@/lib/supabase/server'
import type { LeadActionState } from '@/lib/crm/leads/types'

const priorities = new Set<LeadPriority>([
  'low',
  'normal',
  'high',
  'urgent',
])

const temperatures = new Set<LeadTemperature>([
  'cold',
  'warm',
  'hot',
])

const requirementTypes = new Set([
  'buy',
  'rent',
  'resale',
  'lease',
])

const purposes = new Set([
  '',
  'end_use',
  'investment',
  'rental_income',
  'resale',
])

const furnishings = new Set([
  '',
  'unfurnished',
  'semi_furnished',
  'fully_furnished',
])

function text(value: FormDataEntryValue | null) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

function numberOrNull(value: string) {
  if (!value) {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return Number.NaN
  }

  return parsed
}

async function currentUser() {
  const supabase = await createClient()

  const { data: claims } =
    await supabase.auth.getClaims()

  const userId = claims?.claims.sub

  if (!userId) {
    throw new Error('Authentication required')
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, role, tenant_code')
    .eq('id', userId)
    .maybeSingle()

  if (error || !user) {
    throw new Error('CRM user profile not found')
  }

  return {
    supabase,
    userId,
    user,
  }
}

export async function updateLead(
  _state: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  try {
    const { supabase } = await currentUser()

    const leadId = text(formData.get('lead_id'))
    const statusId =
      text(formData.get('status_id')) || null
    const priority = text(formData.get('priority'))
    const temperature = text(
      formData.get('temperature'),
    )
    const notes = text(formData.get('notes'))

    if (!leadId) {
      return {
        ok: false,
        message: 'Lead reference is missing.',
      }
    }

    if (
      !priorities.has(priority as LeadPriority) ||
      !temperatures.has(temperature as LeadTemperature)
    ) {
      return {
        ok: false,
        message: 'Lead values are invalid.',
      }
    }

    const { data: lead, error: leadError } =
      await supabase
        .from('leads')
        .select(
          'id, pipeline_id, assigned_user_id',
        )
        .eq('id', leadId)
        .maybeSingle()

    if (leadError || !lead) {
      return {
        ok: false,
        message: 'Lead not found or not accessible.',
      }
    }

    const payload: TableUpdate<'leads'> = {
      priority: priority as LeadPriority,
      temperature: temperature as LeadTemperature,
      notes: notes || null,
      status_id: statusId,
    }

    if (statusId) {
      const { data: stage, error: stageError } =
        await supabase
          .from('pipeline_stages')
          .select('id, pipeline_id')
          .eq('id', statusId)
          .maybeSingle()

      if (stageError || !stage) {
        return {
          ok: false,
          message:
            'Selected pipeline stage is invalid.',
        }
      }

      if (
        lead.pipeline_id &&
        stage.pipeline_id !== lead.pipeline_id
      ) {
        return {
          ok: false,
          message:
            'Stage does not belong to this lead pipeline.',
        }
      }

      payload.pipeline_id =
        lead.pipeline_id ?? stage.pipeline_id
    }

    const { error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', leadId)

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidatePath(
      `/dashboard/leads/${leadId}`,
    )
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')

    return {
      ok: true,
      message: 'Lead details saved.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to save lead.',
    }
  }
}

export async function updateRequirement(
  _state: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  try {
    const { supabase, userId } =
      await currentUser()

    const leadId = text(formData.get('lead_id'))
    const requirementType = text(
      formData.get('requirement_type'),
    )
    const purpose = text(formData.get('purpose'))
    const furnishing = text(
      formData.get('furnishing'),
    )

    if (!leadId) {
      return {
        ok: false,
        message: 'Lead reference is missing.',
      }
    }

    if (
      !requirementTypes.has(requirementType) ||
      !purposes.has(purpose) ||
      !furnishings.has(furnishing)
    ) {
      return {
        ok: false,
        message: 'Requirement values are invalid.',
      }
    }

    const numeric = {
      bedrooms_min: numberOrNull(
        text(formData.get('bedrooms_min')),
      ),
      bedrooms_max: numberOrNull(
        text(formData.get('bedrooms_max')),
      ),
      budget_min: numberOrNull(
        text(formData.get('budget_min')),
      ),
      budget_max: numberOrNull(
        text(formData.get('budget_max')),
      ),
      area_min_sqft: numberOrNull(
        text(formData.get('area_min_sqft')),
      ),
      area_max_sqft: numberOrNull(
        text(formData.get('area_max_sqft')),
      ),
      bathrooms_min: numberOrNull(
        text(formData.get('bathrooms_min')),
      ),
      parking_required: numberOrNull(
        text(formData.get('parking_required')),
      ),
    }

    if (
      Object.values(numeric).some(
        (value) => Number.isNaN(value),
      )
    ) {
      return {
        ok: false,
        message:
          'Numeric requirement values are invalid.',
      }
    }

    if (
      numeric.bedrooms_min != null &&
      numeric.bedrooms_max != null &&
      numeric.bedrooms_min >
        numeric.bedrooms_max
    ) {
      return {
        ok: false,
        message:
          'Minimum bedrooms cannot exceed maximum.',
      }
    }

    if (
      numeric.budget_min != null &&
      numeric.budget_max != null &&
      numeric.budget_min > numeric.budget_max
    ) {
      return {
        ok: false,
        message:
          'Minimum budget cannot exceed maximum.',
      }
    }

    if (
      numeric.area_min_sqft != null &&
      numeric.area_max_sqft != null &&
      numeric.area_min_sqft >
        numeric.area_max_sqft
    ) {
      return {
        ok: false,
        message:
          'Minimum area cannot exceed maximum.',
      }
    }

    const { data: lead, error: leadError } =
      await supabase
        .from('leads')
        .select('id, assigned_user_id')
        .eq('id', leadId)
        .maybeSingle()

    if (leadError || !lead) {
      return {
        ok: false,
        message:
          'Lead not found or not accessible.',
      }
    }

    if (
      lead.assigned_user_id &&
      lead.assigned_user_id !== userId
    ) {
      const { data: canManage } =
        await supabase.rpc(
          'crm_can_manage_tenant',
        )

      if (!canManage) {
        return {
          ok: false,
          message:
            'You can only edit requirements for leads assigned to you.',
        }
      }
    }

    const payload = {
      lead_id: leadId,
      requirement_type:
        requirementType as 'buy' | 'rent' | 'resale' | 'lease',
      purpose:
        purpose === ''
          ? null
          : (purpose as
              | 'end_use'
              | 'investment'
              | 'rental_income'
              | 'resale'),
      ...numeric,
      furnishing:
        furnishing === ''
          ? null
          : (furnishing as
              | 'unfurnished'
              | 'semi_furnished'
              | 'fully_furnished'),
      preferred_facing:
        text(formData.get('preferred_facing')) ||
        null,
      possession_before:
        text(formData.get('possession_before')) ||
        null,
      notes:
        text(formData.get('notes')) || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    const { data: existing } =
      await supabase
        .from('requirements')
        .select('id')
        .eq('lead_id', leadId)
        .eq('is_active', true)
        .order('created_at', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle()

    const mutation = existing
      ? await supabase
          .from('requirements')
          .update(payload)
          .eq('id', existing.id)
      : await supabase
          .from('requirements')
          .insert(payload)

    if (mutation.error) {
      return {
        ok: false,
        message: mutation.error.message,
      }
    }

    revalidatePath(
      `/dashboard/leads/${leadId}`,
    )

    return {
      ok: true,
      message: 'Buyer requirement saved.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to save requirement.',
    }
  }
}

export async function reassignLead(
  _state: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  try {
    const { supabase } = await currentUser()

    const leadId = text(formData.get('lead_id'))
    const assignedUserId = text(
      formData.get('assigned_user_id'),
    )
    const reason =
      text(formData.get('reason')) || null

    if (!leadId || !assignedUserId) {
      return {
        ok: false,
        message: 'Select an active agent.',
      }
    }

    const { error } = await supabase.rpc(
      'reassign_lead',
      {
        p_lead_id: leadId,
        p_new_assigned_user_id:
          assignedUserId,
        p_reason: reason,
      },
    )

    if (error) {
      return {
        ok: false,
        message: error.message,
      }
    }

    revalidatePath(
      `/dashboard/leads/${leadId}`,
    )
    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard')

    return {
      ok: true,
      message: 'Lead reassigned successfully.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to reassign lead.',
    }
  }
}

export async function refreshRecommendations(
  leadId: string,
) {
  const { supabase } = await currentUser()

  if (!leadId) {
    throw new Error('Lead reference is missing.')
  }

  const { data: lead, error: leadError } =
    await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .maybeSingle()

  if (leadError || !lead) {
    throw new Error(
      'Lead not found or not accessible.',
    )
  }

  const { error } = await supabase.rpc(
    'run_property_recommendations',
    {
      p_lead_id: leadId,
      p_limit: 20,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(
    `/dashboard/leads/${leadId}`,
  )
}