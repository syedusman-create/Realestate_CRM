'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

import type {
  CampaignDistributionMode,
  DialerActionState,
} from '@/lib/crm/dialer/types'

const ADMIN_PATH = '/dashboard/dialer/admin'

type AdminContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  tenantId: string
  workspaceId: string | null
}

type CampaignMemberInput = {
  userId: string
  distributionOrder: number
}

type CampaignRecord = {
  id: string
  tenant_id: string
  workspace_id: string | null
  status: string
  distribution_mode: CampaignDistributionMode
  round_robin_cursor: number
}

async function getAdminContext(): Promise<AdminContext> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('users')
    .select(
      'id, tenant_code, workspace_id, role, is_active',
    )
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!profile?.is_active) {
    throw new Error('Active user profile not found.')
  }

  if (profile.role !== 'admin') {
    throw new Error(
      'Only administrators can manage dialer campaigns.',
    )
  }

  const {
    data: tenant,
    error: tenantError,
  } = await supabase
    .from('tenants')
    .select('id')
    .eq('tenant_code', profile.tenant_code)
    .maybeSingle()

  if (tenantError) {
    throw new Error(tenantError.message)
  }

  if (!tenant) {
    throw new Error('Tenant not found.')
  }

  return {
    supabase,
    userId: user.id,
    tenantId: tenant.id,
    workspaceId: profile.workspace_id ?? null,
  }
}

function textValue(
  formData: FormData,
  name: string,
) {
  return String(
    formData.get(name) ?? '',
  ).trim()
}

function numberValue(
  formData: FormData,
  name: string,
  fallback: number,
) {
  const value = Number(
    formData.get(name),
  )

  if (!Number.isFinite(value)) {
    return fallback
  }

  return Math.trunc(value)
}

function booleanValue(
  formData: FormData,
  name: string,
  fallback: boolean,
) {
  const value = formData.get(name)

  if (value === null) {
    return fallback
  }

  return (
    value === 'true' ||
    value === 'on' ||
    value === '1'
  )
}

function parseMemberIds(
  formData: FormData,
) {
  return [
    ...new Set(
      formData
        .getAll('member_user_id')
        .map(String)
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ]
}

function parseDistributionMode(
  formData: FormData,
): CampaignDistributionMode {
  const value = textValue(
    formData,
    'distribution_mode',
  )

  if (
    value === 'equal_split' ||
    value === 'round_robin' ||
    value === 'on_demand'
  ) {
    return value
  }

  return 'on_demand'
}

async function assertCampaignAccess(
  context: AdminContext,
  campaignId: string,
): Promise<CampaignRecord> {
  const {
    data: campaign,
    error,
  } = await context.supabase
    .from('dialer_campaigns')
    .select(
      `
        id,
        tenant_id,
        workspace_id,
        status,
        distribution_mode,
        round_robin_cursor
      `,
    )
    .eq('id', campaignId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (
    !campaign ||
    campaign.tenant_id !== context.tenantId
  ) {
    throw new Error('Campaign not found.')
  }

  return campaign as CampaignRecord
}

async function validateCampaignMembers(
  context: AdminContext,
  userIds: string[],
) {
  if (!userIds.length) {
    return []
  }

  const {
    data: users,
    error,
  } = await context.supabase
    .from('users')
    .select(
      'id, tenant_code, workspace_id, is_active, role',
    )
    .in('id', userIds)

  if (error) {
    throw new Error(error.message)
  }

  if (!users || users.length !== userIds.length) {
    throw new Error(
      'One or more selected campaign members could not be found.',
    )
  }

  const {
    data: tenant,
    error: tenantError,
  } = await context.supabase
    .from('tenants')
    .select('tenant_code')
    .eq('id', context.tenantId)
    .single()

  if (tenantError) {
    throw new Error(tenantError.message)
  }

  for (const user of users) {
    if (!user.is_active) {
      throw new Error(
        'Inactive users cannot be campaign members.',
      )
    }

    if (
      user.tenant_code !== tenant.tenant_code
    ) {
      throw new Error(
        'All campaign members must belong to the current tenant.',
      )
    }

    if (
      context.workspaceId &&
      user.workspace_id !== context.workspaceId
    ) {
      throw new Error(
        'All campaign members must belong to the current workspace.',
      )
    }
  }

  return users
}

async function replaceCampaignMembers(
  context: AdminContext,
  campaignId: string,
  userIds: string[],
) {
  await validateCampaignMembers(
    context,
    userIds,
  )

  const {
    error: deleteError,
  } = await context.supabase
    .from('dialer_campaign_members')
    .delete()
    .eq('campaign_id', campaignId)
    .eq('tenant_id', context.tenantId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  if (!userIds.length) {
    return
  }

  const rows = userIds.map(
    (userId, index) => ({
      tenant_id: context.tenantId,
      workspace_id: context.workspaceId,
      campaign_id: campaignId,
      user_id: userId,
      is_active: true,
      distribution_order: index,
    }),
  )

  const {
    error: insertError,
  } = await context.supabase
    .from('dialer_campaign_members')
    .insert(rows)

  if (insertError) {
    throw new Error(insertError.message)
  }
}

async function getActiveCampaignMembers(
  context: AdminContext,
  campaignId: string,
) {
  const {
    data: members,
    error,
  } = await context.supabase
    .from('dialer_campaign_members')
    .select(
      'id, user_id, distribution_order, is_active',
    )
    .eq('campaign_id', campaignId)
    .eq('tenant_id', context.tenantId)
    .eq('is_active', true)
    .order('distribution_order', {
      ascending: true,
    })

  if (error) {
    throw new Error(error.message)
  }

  return members ?? []
}

async function distributeLeadRows(
  context: AdminContext,
  campaign: CampaignRecord,
  queueIds: string[],
) {
  if (!queueIds.length) {
    return
  }

  if (
    campaign.distribution_mode ===
    'on_demand'
  ) {
    return
  }

  const members =
    await getActiveCampaignMembers(
      context,
      campaign.id,
    )

  if (!members.length) {
    throw new Error(
      'This campaign has no active members for lead distribution.',
    )
  }

  if (
    campaign.distribution_mode ===
    'equal_split'
  ) {
    const assignments = queueIds.map(
      (queueId, index) => {
        const member =
          members[
          index % members.length
          ]

        if (!member) {
          throw new Error(
            'Unable to determine a campaign member for lead distribution.',
          )
        }

        return {
          id: queueId,
          assigned_user_id:
            member.user_id,
          assigned_at:
            new Date().toISOString(),
          assignment_reason:
            'equal_split',
        }
      },
    )

    for (const assignment of assignments) {
      const {
        error,
      } = await context.supabase
        .from('dialer_campaign_leads')
        .update({
          assigned_user_id:
            assignment.assigned_user_id,
          assigned_at:
            assignment.assigned_at,
          assignment_reason:
            assignment.assignment_reason,
          updated_at:
            assignment.assigned_at,
        })
        .eq('id', assignment.id)
        .eq(
          'campaign_id',
          campaign.id,
        )

      if (error) {
        throw new Error(error.message)
      }
    }

    return
  }

  const cursor =
    Math.max(
      0,
      campaign.round_robin_cursor ?? 0,
    )

  const assignments = queueIds.map(
    (queueId, index) => {
      const member =
        members[
        (cursor + index) %
        members.length
        ]

      if (!member) {
        throw new Error(
          'Unable to determine a campaign member for round-robin distribution.',
        )
      }

      return {
        id: queueId,
        assigned_user_id:
          member.user_id,
        assigned_at:
          new Date().toISOString(),
        assignment_reason:
          'round_robin',
      }
    },
  )

  for (const assignment of assignments) {
    const {
      error,
    } = await context.supabase
      .from('dialer_campaign_leads')
      .update({
        assigned_user_id:
          assignment.assigned_user_id,
        assigned_at:
          assignment.assigned_at,
        assignment_reason:
          assignment.assignment_reason,
        updated_at:
          assignment.assigned_at,
      })
      .eq('id', assignment.id)
      .eq(
        'campaign_id',
        campaign.id,
      )

    if (error) {
      throw new Error(error.message)
    }
  }

  const nextCursor =
    (cursor + queueIds.length) %
    members.length

  const {
    error: cursorError,
  } = await context.supabase
    .from('dialer_campaigns')
    .update({
      round_robin_cursor: nextCursor,
      updated_at:
        new Date().toISOString(),
    })
    .eq('id', campaign.id)
    .eq(
      'tenant_id',
      context.tenantId,
    )

  if (cursorError) {
    throw new Error(cursorError.message)
  }
}

async function resolveLeadPhones(
  context: AdminContext,
  leadIds: string[],
) {
  const {
    data: leads,
    error: leadError,
  } = await context.supabase
    .from('leads')
    .select(
      'id, tenant_id, person_id, priority, temperature, lead_score',
    )
    .in('id', leadIds)
    .eq(
      'tenant_id',
      context.tenantId,
    )

  if (leadError) {
    throw new Error(leadError.message)
  }

  const personIds = [
    ...new Set(
      (leads ?? []).map(
        (lead) => lead.person_id,
      ),
    ),
  ]

  if (!personIds.length) {
    return []
  }

  const {
    data: phones,
    error: phoneError,
  } = await context.supabase
    .from('person_phones')
    .select(
      'id, person_id, is_primary, created_at',
    )
    .in(
      'person_id',
      personIds,
    )
    .order('is_primary', {
      ascending: false,
    })
    .order('created_at', {
      ascending: true,
    })

  if (phoneError) {
    throw new Error(phoneError.message)
  }

  const phoneByPerson =
    new Map<string, string>()

  for (const phone of phones ?? []) {
    if (
      !phoneByPerson.has(
        phone.person_id,
      )
    ) {
      phoneByPerson.set(
        phone.person_id,
        phone.id,
      )
    }
  }

  return (leads ?? [])
    .map((lead) => {
      const phoneId =
        phoneByPerson.get(
          lead.person_id,
        )

      if (!phoneId) {
        return null
      }

      return {
        lead,
        phoneId,
      }
    })
    .filter(
      (
        value,
      ): value is NonNullable<
        typeof value
      > => Boolean(value),
    )
}

export async function createCampaign(
  formData: FormData,
): Promise<DialerActionState> {
  try {
    const context =
      await getAdminContext()

    const name = textValue(
      formData,
      'name',
    )

    if (!name) {
      return {
        ok: false,
        message:
          'Campaign name is required.',
      }
    }

    const description =
      textValue(
        formData,
        'description',
      ) || null

    const dialingMode =
      textValue(
        formData,
        'dialing_mode',
      ) || 'assisted'

    if (
      ![
        'assisted',
        'preview',
        'power',
      ].includes(dialingMode)
    ) {
      return {
        ok: false,
        message:
          'Invalid dialing mode.',
      }
    }

    const distributionMode =
      parseDistributionMode(formData)

    const memberIds =
      parseMemberIds(formData)

    if (
      distributionMode !==
      'on_demand' &&
      !memberIds.length
    ) {
      return {
        ok: false,
        message:
          'Select at least one campaign member for this distribution mode.',
      }
    }

    await validateCampaignMembers(
      context,
      memberIds,
    )

    const maxAttempts =
      Math.min(
        20,
        Math.max(
          1,
          numberValue(
            formData,
            'max_attempts',
            3,
          ),
        ),
      )

    const retryAfterMinutes =
      Math.min(
        10080,
        Math.max(
          1,
          numberValue(
            formData,
            'retry_after_minutes',
            60,
          ),
        ),
      )

    const {
      data: campaign,
      error,
    } = await context.supabase
      .from('dialer_campaigns')
      .insert({
        tenant_id:
          context.tenantId,
        workspace_id:
          context.workspaceId,
        name,
        description,
        status: 'draft',
        distribution_mode:
          distributionMode,
        round_robin_cursor: 0,
        dialing_mode:
          dialingMode,
        max_attempts:
          maxAttempts,
        retry_after_minutes:
          retryAfterMinutes,
        allow_callbacks:
          booleanValue(
            formData,
            'allow_callbacks',
            true,
          ),
        allow_voicemail:
          booleanValue(
            formData,
            'allow_voicemail',
            true,
          ),
        quiet_hours: {
          enabled: true,
          start: '20:00',
          end: '09:00',
        },
        compliance_config: {},
        created_by:
          context.userId,
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await replaceCampaignMembers(
      context,
      campaign.id,
      memberIds,
    )

    revalidatePath(ADMIN_PATH)

    return {
      ok: true,
      message: 'Campaign created.',
      id: campaign.id,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create campaign.',
    }
  }
}

export async function updateCampaign(
  formData: FormData,
): Promise<DialerActionState> {
  try {
    const context =
      await getAdminContext()

    const campaignId =
      textValue(
        formData,
        'campaign_id',
      )

    if (!campaignId) {
      return {
        ok: false,
        message:
          'Campaign id is required.',
      }
    }

    const campaign =
      await assertCampaignAccess(
        context,
        campaignId,
      )

    const name = textValue(
      formData,
      'name',
    )

    if (!name) {
      return {
        ok: false,
        message:
          'Campaign name is required.',
      }
    }

    const dialingMode =
      textValue(
        formData,
        'dialing_mode',
      ) || 'assisted'

    if (
      ![
        'assisted',
        'preview',
        'power',
      ].includes(dialingMode)
    ) {
      return {
        ok: false,
        message:
          'Invalid dialing mode.',
      }
    }

    const distributionMode =
      parseDistributionMode(formData)

    const memberIds =
      parseMemberIds(formData)

    if (
      distributionMode !==
      'on_demand' &&
      !memberIds.length
    ) {
      return {
        ok: false,
        message:
          'Select at least one campaign member for this distribution mode.',
      }
    }

    await validateCampaignMembers(
      context,
      memberIds,
    )

    const {
      error,
    } = await context.supabase
      .from('dialer_campaigns')
      .update({
        name,
        description:
          textValue(
            formData,
            'description',
          ) || null,
        dialing_mode:
          dialingMode,
        distribution_mode:
          distributionMode,
        max_attempts:
          Math.min(
            20,
            Math.max(
              1,
              numberValue(
                formData,
                'max_attempts',
                3,
              ),
            ),
          ),
        retry_after_minutes:
          Math.min(
            10080,
            Math.max(
              1,
              numberValue(
                formData,
                'retry_after_minutes',
                60,
              ),
            ),
          ),
        allow_callbacks:
          booleanValue(
            formData,
            'allow_callbacks',
            true,
          ),
        allow_voicemail:
          booleanValue(
            formData,
            'allow_voicemail',
            true,
          ),
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', campaignId)
      .eq(
        'tenant_id',
        context.tenantId,
      )

    if (error) {
      throw new Error(error.message)
    }

    /*
     * Preserve the round-robin cursor when the
     * distribution mode remains round robin.
     *
     * If changing into round robin from another
     * mode, start from the current cursor.
     */
    if (
      campaign.distribution_mode !==
      distributionMode
    ) {
      const {
        error: cursorError,
      } = await context.supabase
        .from('dialer_campaigns')
        .update({
          round_robin_cursor: 0,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          'id',
          campaignId,
        )
        .eq(
          'tenant_id',
          context.tenantId,
        )

      if (cursorError) {
        throw new Error(
          cursorError.message,
        )
      }
    }

    await replaceCampaignMembers(
      context,
      campaignId,
      memberIds,
    )

    revalidatePath(
      `${ADMIN_PATH}/${campaignId}`,
    )

    revalidatePath(ADMIN_PATH)

    return {
      ok: true,
      message: 'Campaign updated.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update campaign.',
    }
  }
}

async function setCampaignStatus(
  campaignId: string,
  status:
    | 'running'
    | 'paused'
    | 'completed'
    | 'archived',
): Promise<DialerActionState> {
  try {
    const context =
      await getAdminContext()

    const campaign =
      await assertCampaignAccess(
        context,
        campaignId,
      )

    if (
      status === 'running' &&
      campaign.status === 'archived'
    ) {
      return {
        ok: false,
        message:
          'Archived campaigns cannot be restarted.',
      }
    }

    if (
      status === 'running' &&
      campaign.status === 'completed'
    ) {
      return {
        ok: false,
        message:
          'Completed campaigns cannot be restarted.',
      }
    }

    const {
      error,
    } = await context.supabase
      .from('dialer_campaigns')
      .update({
        status,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', campaignId)
      .eq(
        'tenant_id',
        context.tenantId,
      )

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath(ADMIN_PATH)
    revalidatePath(
      `${ADMIN_PATH}/${campaignId}`,
    )

    return {
      ok: true,
      message: `Campaign ${status}.`,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update campaign status.',
    }
  }
}

export async function startCampaign(
  campaignId: string,
) {
  return setCampaignStatus(
    campaignId,
    'running',
  )
}

export async function pauseCampaign(
  campaignId: string,
) {
  return setCampaignStatus(
    campaignId,
    'paused',
  )
}

export async function completeCampaign(
  campaignId: string,
) {
  return setCampaignStatus(
    campaignId,
    'completed',
  )
}

export async function archiveCampaign(
  campaignId: string,
) {
  return setCampaignStatus(
    campaignId,
    'archived',
  )
}

export async function populateCampaign(
  campaignId: string,
  formData: FormData,
): Promise<DialerActionState> {
  try {
    const context =
      await getAdminContext()

    const campaign =
      await assertCampaignAccess(
        context,
        campaignId,
      )

    if (
      campaign.status ===
      'completed' ||
      campaign.status ===
      'archived'
    ) {
      return {
        ok: false,
        message:
          'This campaign cannot receive new leads.',
      }
    }

    const temperature =
      textValue(
        formData,
        'temperature',
      )

    const limit = Math.min(
      5000,
      Math.max(
        1,
        numberValue(
          formData,
          'limit',
          100,
        ),
      ),
    )

    const priority =
      Math.min(
        100,
        Math.max(
          0,
          numberValue(
            formData,
            'queue_priority',
            0,
          ),
        ),
      )

    let query = context.supabase
      .from('leads')
      .select(
        'id, tenant_id, person_id, priority, temperature, lead_score',
      )
      .eq(
        'tenant_id',
        context.tenantId,
      )
      .limit(limit)

    if (
      temperature &&
      temperature !== 'any'
    ) {
      query = query.eq(
        'temperature',
        temperature,
      )
    }

    const {
      data: leads,
      error: leadError,
    } = await query

    if (leadError) {
      throw new Error(
        leadError.message,
      )
    }

    if (!leads?.length) {
      return {
        ok: true,
        message:
          'No eligible leads found.',
      }
    }

    const {
      data: existing,
      error: existingError,
    } = await context.supabase
      .from('dialer_campaign_leads')
      .select('lead_id')
      .eq(
        'campaign_id',
        campaignId,
      )

    if (existingError) {
      throw new Error(
        existingError.message,
      )
    }

    const existingIds =
      new Set(
        (
          existing ?? []
        ).map(
          (row) => row.lead_id,
        ),
      )

    const candidateIds =
      leads
        .map(
          (lead) => lead.id,
        )
        .filter(
          (leadId) =>
            !existingIds.has(
              leadId,
            ),
        )

    if (!candidateIds.length) {
      return {
        ok: true,
        message:
          'All selected leads are already in this campaign.',
      }
    }

    const resolved =
      await resolveLeadPhones(
        context,
        candidateIds,
      )

    if (!resolved.length) {
      return {
        ok: false,
        message:
          'None of the selected leads has a phone number.',
      }
    }

    const rows =
      resolved.map(
        ({
          lead,
          phoneId,
        }) => ({
          tenant_id:
            context.tenantId,
          campaign_id:
            campaignId,
          lead_id:
            lead.id,
          person_id:
            lead.person_id,
          phone_id:
            phoneId,
          status: 'queued',
          attempt_count: 0,
          priority:
            priority ||
            Math.round(
              Number(
                lead.lead_score ??
                0,
              ),
            ),
          next_attempt_at:
            null,
          metadata: {},
        }),
      )

    const {
      data: inserted,
      error,
    } = await context.supabase
      .from(
        'dialer_campaign_leads',
      )
      .insert(rows)
      .select('id')

    if (error) {
      throw new Error(error.message)
    }

    const queueIds =
      (inserted ?? []).map(
        (row) => row.id,
      )

    await distributeLeadRows(
      context,
      campaign,
      queueIds,
    )

    revalidatePath(
      `${ADMIN_PATH}/${campaignId}`,
    )

    revalidatePath(ADMIN_PATH)

    return {
      ok: true,
      message: `${queueIds.length} lead${queueIds.length === 1 ? '' : 's'} added to the campaign.`,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to populate campaign.',
    }
  }
}

export async function addLeadsToCampaign(
  campaignId: string,
  formData: FormData,
): Promise<DialerActionState> {
  try {
    const context =
      await getAdminContext()

    const campaign =
      await assertCampaignAccess(
        context,
        campaignId,
      )

    const leadIds = [
      ...new Set(
        formData
          .getAll('lead_id')
          .map(String)
          .filter(Boolean),
      ),
    ]

    if (!leadIds.length) {
      return {
        ok: false,
        message:
          'Select at least one lead.',
      }
    }

    const resolved =
      await resolveLeadPhones(
        context,
        leadIds,
      )

    if (!resolved.length) {
      return {
        ok: false,
        message:
          'The selected leads do not have usable phone numbers.',
      }
    }

    const {
      data: existing,
      error: existingError,
    } = await context.supabase
      .from('dialer_campaign_leads')
      .select('lead_id')
      .eq(
        'campaign_id',
        campaignId,
      )
      .in(
        'lead_id',
        leadIds,
      )

    if (existingError) {
      throw new Error(
        existingError.message,
      )
    }

    const existingIds =
      new Set(
        (
          existing ?? []
        ).map(
          (row) => row.lead_id,
        ),
      )

    const rows =
      resolved
        .filter(
          ({
            lead,
          }) =>
            !existingIds.has(
              lead.id,
            ),
        )
        .map(
          ({
            lead,
            phoneId,
          }) => ({
            tenant_id:
              context.tenantId,
            campaign_id:
              campaignId,
            lead_id:
              lead.id,
            person_id:
              lead.person_id,
            phone_id:
              phoneId,
            status: 'queued',
            attempt_count: 0,
            priority:
              Math.round(
                Number(
                  lead.lead_score ??
                  0,
                ),
              ),
            next_attempt_at:
              null,
            metadata: {},
          }),
        )

    if (!rows.length) {
      return {
        ok: true,
        message:
          'All selected leads are already in this campaign.',
      }
    }

    const {
      data: inserted,
      error,
    } = await context.supabase
      .from(
        'dialer_campaign_leads',
      )
      .insert(rows)
      .select('id')

    if (error) {
      throw new Error(error.message)
    }

    const queueIds =
      (inserted ?? []).map(
        (row) => row.id,
      )

    await distributeLeadRows(
      context,
      campaign,
      queueIds,
    )

    revalidatePath(
      `${ADMIN_PATH}/${campaignId}`,
    )

    return {
      ok: true,
      message: `${queueIds.length} lead${queueIds.length === 1 ? '' : 's'} assigned.`,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to assign leads.',
    }
  }
}

export async function removeCampaignLead(
  queueItemId: string,
): Promise<DialerActionState> {
  try {
    const context =
      await getAdminContext()

    const {
      data: item,
      error: itemError,
    } = await context.supabase
      .from('dialer_campaign_leads')
      .select(
        'id, campaign_id, tenant_id, status, claimed_by',
      )
      .eq('id', queueItemId)
      .maybeSingle()

    if (itemError) {
      throw new Error(
        itemError.message,
      )
    }

    if (
      !item ||
      item.tenant_id !==
      context.tenantId
    ) {
      throw new Error(
        'Queue item not found.',
      )
    }

    if (
      item.claimed_by ||
      ![
        'queued',
        'failed',
        'callback',
      ].includes(
        item.status,
      )
    ) {
      return {
        ok: false,
        message:
          'This queue item cannot be removed while it is active.',
      }
    }

    const {
      error,
    } = await context.supabase
      .from(
        'dialer_campaign_leads',
      )
      .delete()
      .eq('id', queueItemId)
      .eq(
        'tenant_id',
        context.tenantId,
      )

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath(
      `${ADMIN_PATH}/${item.campaign_id}`,
    )

    return {
      ok: true,
      message:
        'Lead removed from campaign.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to remove lead.',
    }
  }
}