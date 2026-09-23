import { redirect } from 'next/navigation'

import CampaignEditor from '@/components/dialer/campaign-editor'
import { createClient } from '@/lib/supabase/server'

export default async function NewCampaignPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const {
    data: profile,
  } = await supabase
    .from('users')
    .select(
      'role, is_active, tenant_code, workspace_id',
    )
    .eq('id', user.id)
    .maybeSingle()

  if (
    !profile?.is_active ||
    profile.role !== 'admin'
  ) {
    redirect('/unauthorized')
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
    .order('full_name')

  if (usersError) {
    throw new Error(
      usersError.message,
    )
  }

  return (
    <div className="page">
      <div className="mb-8">
        <div className="eyebrow">
          Dialer
        </div>

        <h1 className="mt-2">
          Create campaign
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Create a calling campaign, select its
          members, and define how new leads are
          distributed across the campaign.
        </p>
      </div>

      <CampaignEditor
        users={users ?? []}
      />
    </div>
  )
}