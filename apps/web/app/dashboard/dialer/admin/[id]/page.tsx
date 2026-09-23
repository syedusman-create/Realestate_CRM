import {
  notFound,
  redirect,
} from 'next/navigation'

import CampaignEditor from '@/components/dialer/campaign-editor'

import {
  createClient,
} from '@/lib/supabase/server'

import type {
  CampaignDistributionMode,
  DialerMode,
} from '@/lib/crm/dialer/types'

type CampaignPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function CampaignAdminPage({
  params,
}: CampaignPageProps) {
  const { id } = await params

  const supabase =
    await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('users')
    .select(
      'id, role, is_active, tenant_code, workspace_id',
    )
    .eq('id', user.id)
    .maybeSingle()

  if (
    profileError ||
    !profile?.is_active ||
    profile.role !== 'admin'
  ) {
    redirect('/unauthorized')
  }

  const {
    data: campaign,
    error: campaignError,
  } = await supabase
    .from('dialer_campaigns')
    .select(
      `
        id,
        name,
        description,
        status,
        distribution_mode,
        round_robin_cursor,
        dialing_mode,
        max_attempts,
        retry_after_minutes,
        allow_callbacks,
        allow_voicemail,
        created_by,
        created_at,
        updated_at
      `,
    )
    .eq('id', id)
    .maybeSingle()

  if (campaignError) {
    throw new Error(
      campaignError.message,
    )
  }

  if (!campaign) {
    notFound()
  }

  const {
    data: users,
    error: usersError,
  } = await supabase
    .from('users')
    .select(
      'id, full_name, role, is_active',
    )
    .eq(
      'tenant_code',
      profile.tenant_code,
    )
    .eq(
      'workspace_id',
      profile.workspace_id,
    )
    .eq(
      'is_active',
      true,
    )
    .order('full_name', {
      ascending: true,
    })

  if (usersError) {
    throw new Error(
      usersError.message,
    )
  }

  const {
    data: members,
    error: membersError,
  } = await supabase
    .from(
      'dialer_campaign_members',
    )
    .select(
      'user_id, distribution_order, is_active',
    )
    .eq(
      'campaign_id',
      campaign.id,
    )
    .eq(
      'is_active',
      true,
    )
    .order(
      'distribution_order',
      {
        ascending: true,
      },
    )

  if (membersError) {
    throw new Error(
      membersError.message,
    )
  }

  const memberUserIds =
    (members ?? []).map(
      (member) =>
        member.user_id,
    )

  return (
    <div className="page">
      <div className="mb-8">
        <div className="eyebrow">
          Dialer / Campaigns
        </div>

        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1>
              {campaign.name}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage campaign settings, members,
              lead distribution, calling rules, and
              campaign lifecycle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium capitalize">
              {campaign.status.replace(
                /_/g,
                ' ',
              )}
            </span>

            <span className="rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1 text-xs font-medium text-brand-gold-dark">
              {campaign.distribution_mode ===
              'equal_split'
                ? 'Equal split'
                : campaign.distribution_mode ===
                    'round_robin'
                  ? 'Round robin'
                  : 'On demand'}
            </span>

            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {memberUserIds.length}{' '}
              member
              {memberUserIds.length === 1
                ? ''
                : 's'}
            </span>
          </div>
        </div>
      </div>

      <CampaignEditor
        campaign={{
          id: campaign.id,
          name: campaign.name,
          description:
            campaign.description,
          distribution_mode:
            campaign.distribution_mode as CampaignDistributionMode,
          round_robin_cursor:
            campaign.round_robin_cursor,
          dialing_mode:
            campaign.dialing_mode as DialerMode,
          max_attempts:
            campaign.max_attempts,
          retry_after_minutes:
            campaign.retry_after_minutes,
          allow_callbacks:
            campaign.allow_callbacks,
          allow_voicemail:
            campaign.allow_voicemail,
          member_user_ids:
            memberUserIds,
        }}
        users={users ?? []}
      />
    </div>
  )
}