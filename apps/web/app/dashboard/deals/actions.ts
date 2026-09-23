'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../lib/supabase/server'
import type {
  DealActionState,
  DealStatus,
} from '../../../lib/crm/deals/types'

const DEAL_STATUSES: DealStatus[] = [
  'open',
  'won',
  'lost',
  'paused',
]

type Context = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  profile: {
    id: string
    tenant_code: string
    workspace_id: string | null
    role: string
    full_name: string
  }
}

async function context(): Promise<Context> {
  const supabase = await createClient()

  const { data: claims } =
    await supabase.auth.getClaims()

  const userId = claims?.claims.sub

  if (!userId) {
    throw new Error('Authentication required')
  }

  const db = supabase as any

  const { data: profile, error } = await db
    .from('users')
    .select(
      'id, tenant_code, workspace_id, role, full_name',
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!profile) {
    throw new Error('CRM profile not found')
  }

  return {
    supabase,
    userId,
    profile,
  }
}

function parseMoney(value: FormDataEntryValue | null) {
  if (
    value === null ||
    typeof value !== 'string' ||
    !value.trim()
  ) {
    return null
  }

  const number = Number(value)

  if (!Number.isFinite(number) || number < 0) {
    throw new Error('Deal value must be a valid amount')
  }

  return number
}

function parseProbability(
  value: FormDataEntryValue | null,
) {
  if (
    value === null ||
    typeof value !== 'string' ||
    !value.trim()
  ) {
    return null
  }

  const number = Number(value)

  if (
    !Number.isInteger(number) ||
    number < 0 ||
    number > 100
  ) {
    throw new Error(
      'Probability must be between 0 and 100',
    )
  }

  return number
}

function nullableString(
  value: FormDataEntryValue | null,
) {
  if (
    value === null ||
    typeof value !== 'string'
  ) {
    return null
  }

  const trimmed = value.trim()

  return trimmed || null
}

async function ensureManagerOrOwner(
  ctx: Context,
  dealId: string,
) {
  const db = ctx.supabase as any

  const { data: deal, error } = await db
    .from('deals')
    .select(
      'id, tenant_id, lead_id, owner_user_id',
    )
    .eq('id', dealId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!deal) {
    throw new Error('Opportunity not found')
  }

  const { data: canManage } = await db.rpc(
    'crm_can_manage_tenant',
  )

  const ownsDeal =
    deal.owner_user_id === ctx.userId

  const { data: lead } = await db
    .from('leads')
    .select('assigned_user_id')
    .eq('id', deal.lead_id)
    .maybeSingle()

  const ownsLead =
    lead?.assigned_user_id === ctx.userId

  if (!canManage && !ownsDeal && !ownsLead) {
    throw new Error(
      'You do not have permission to edit this opportunity',
    )
  }

  return deal
}

export async function saveDeal(
  input: {
    deal_id: string
    deal_name: string
    deal_value: number | null
    expected_close_date: string | null
    probability: number | null
    status: DealStatus
    stage_id: string | null
    owner_user_id: string | null
    lost_reason: string | null
    notes: string | null
  },
): Promise<DealActionState> {
  try {
    const ctx = await context()
    const db = ctx.supabase as any

    if (!DEAL_STATUSES.includes(input.status)) {
      throw new Error('Invalid opportunity status')
    }

    if (!input.deal_name.trim()) {
      throw new Error(
        'Opportunity name is required',
      )
    }

    if (
      input.status === 'lost' &&
      !input.lost_reason?.trim()
    ) {
      throw new Error(
        'Lost reason is required when marking an opportunity lost',
      )
    }

    const deal = await ensureManagerOrOwner(
      ctx,
      input.deal_id,
    )

    if (input.stage_id) {
      const { data: stage } = await db
        .from('pipeline_stages')
        .select('id, pipeline_id')
        .eq('id', input.stage_id)
        .maybeSingle()

      if (!stage) {
        throw new Error(
          'Selected pipeline stage was not found',
        )
      }

      if (
        deal.pipeline_id &&
        stage.pipeline_id !== deal.pipeline_id
      ) {
        throw new Error(
          'Selected stage does not belong to the opportunity pipeline',
        )
      }
    }

    if (input.owner_user_id) {
      const { data: owner } = await db
        .from('users')
        .select('id, tenant_code, is_active')
        .eq('id', input.owner_user_id)
        .maybeSingle()

      if (
        !owner ||
        owner.tenant_code !== ctx.profile.tenant_code ||
        !owner.is_active
      ) {
        throw new Error(
          'Selected owner is not an active user in this tenant',
        )
      }
    }

    const closed =
      input.status === 'won' ||
      input.status === 'lost'

    const { error } = await db
      .from('deals')
      .update({
        deal_name: input.deal_name.trim(),
        deal_value: input.deal_value,
        expected_close_date:
          input.expected_close_date,
        probability: input.probability,
        status: input.status,
        stage_id: input.stage_id,
        owner_user_id:
          input.owner_user_id,
        lost_reason:
          input.status === 'lost'
            ? input.lost_reason
            : null,
        notes: input.notes,
        closed_at: closed
          ? deal.closed_at ?? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.deal_id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/dashboard/deals')
    revalidatePath(
      `/dashboard/leads/${deal.lead_id}`,
    )
    revalidatePath('/dashboard')

    return {
      ok: true,
      message: 'Opportunity saved.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to save opportunity.',
    }
  }
}

export async function saveDealForm(
  _previous: DealActionState,
  formData: FormData,
): Promise<DealActionState> {
  try {
    return await saveDeal({
      deal_id: String(
        formData.get('deal_id') ?? '',
      ),
      deal_name: String(
        formData.get('deal_name') ?? '',
      ),
      deal_value: parseMoney(
        formData.get('deal_value'),
      ),
      expected_close_date:
        nullableString(
          formData.get(
            'expected_close_date',
          ),
        ),
      probability: parseProbability(
        formData.get('probability'),
      ),
      status: String(
        formData.get('status') ?? 'open',
      ) as DealStatus,
      stage_id: nullableString(
        formData.get('stage_id'),
      ),
      owner_user_id: nullableString(
        formData.get('owner_user_id'),
      ),
      lost_reason: nullableString(
        formData.get('lost_reason'),
      ),
      notes: nullableString(
        formData.get('notes'),
      ),
    })
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Invalid opportunity data.',
    }
  }
}

export async function createDeal(
  input: {
    lead_id: string
    deal_name?: string
  },
): Promise<DealActionState & { dealId?: string }> {
  try {
    const ctx = await context()
    const db = ctx.supabase as any

    if (!input.lead_id) {
      throw new Error('Lead is required')
    }

    const { data: lead, error: leadError } =
      await db
        .from('leads')
        .select(
          'id, tenant_id, assigned_user_id',
        )
        .eq('id', input.lead_id)
        .maybeSingle()

    if (leadError) {
      throw new Error(leadError.message)
    }

    if (!lead) {
      throw new Error('Lead not found')
    }

    const { data: canManage } =
      await db.rpc('crm_can_manage_tenant')

    if (
      !canManage &&
      lead.assigned_user_id !== ctx.userId
    ) {
      throw new Error(
        'You do not have permission to create an opportunity for this lead',
      )
    }

    const { data: dealId, error } =
      await db.rpc('ensure_lead_deal', {
        p_lead_id: input.lead_id,
        p_deal_name:
          input.deal_name?.trim() || null,
      })

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/dashboard/deals')
    revalidatePath(
      `/dashboard/leads/${input.lead_id}`,
    )
    revalidatePath('/dashboard')

    return {
      ok: true,
      message: 'Opportunity created.',
      dealId,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create opportunity.',
    }
  }
}

export async function createDealForm(
  _previous: DealActionState,
  formData: FormData,
): Promise<DealActionState> {
  const result = await createDeal({
    lead_id: String(
      formData.get('lead_id') ?? '',
    ),
    deal_name: String(
      formData.get('deal_name') ?? '',
    ),
  })

  return {
    ok: result.ok,
    message: result.message,
  }
}