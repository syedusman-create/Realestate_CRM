import { createClient } from '@/lib/supabase/server'

import {
  TeamFilters,
} from '@/components/team/team-filters'

import {
  TeamHeader,
} from '@/components/team/team-header'

import {
  TeamMemberDetail,
} from '@/components/team/team-member-detail'

import {
  TeamMemberEditor,
} from '@/components/team/team-member-editor'

import {
  TeamMetrics,
} from '@/components/team/team-metrics'

import {
  TeamList,
} from '@/components/team/team-list'

import type {
  TeamFilters as TeamFiltersType,
  TeamMember,
} from '@/lib/crm/team/types'

type TeamPageProps = {
  searchParams: Promise<{
    search?: string
    role?: string
    status?: string
    member?: string
  }>
}

function normalizeFilters(
  params: {
    search?: string
    role?: string
    status?: string
  },
): TeamFiltersType {
  const status =
    params.status === 'active' ||
    params.status === 'inactive'
      ? params.status
      : 'all'

  return {
    search:
      params.search?.trim() ??
      '',
    role:
      params.role?.trim() ??
      '',
    status,
  }
}

export default async function TeamPage({
  searchParams,
}: TeamPageProps) {
  const params =
    await searchParams

  const filters =
    normalizeFilters(params)

  const supabase =
    await createClient()

  let query = supabase
    .from('users')
    .select(
      'id,tenant_code,full_name,email,phone,role,is_active,workspace_id,created_at,updated_at',
    )
    .order('full_name', {
      ascending: true,
    })

  if (filters.search) {
    const escapedSearch =
      filters.search.replace(
        /[%_]/g,
        '\\$&',
      )

    query = query.or(
      `full_name.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%,phone.ilike.%${escapedSearch}%`,
    )
  }

  if (
    filters.role &&
    filters.role !== 'all'
  ) {
    query = query.eq(
      'role',
      filters.role,
    )
  }

  if (
    filters.status === 'active'
  ) {
    query = query.eq(
      'is_active',
      true,
    )
  }

  if (
    filters.status === 'inactive'
  ) {
    query = query.eq(
      'is_active',
      false,
    )
  }

  const {
    data,
    error,
  } = await query

  if (error) {
    throw new Error(
      `Unable to load team members: ${error.message}`,
    )
  }

  const members =
    (data ?? []) as TeamMember[]

  const total = members.length

  const active = members.filter(
    (member) =>
      member.is_active === true,
  ).length

  const inactive =
    total - active

  const roleCounts =
    members.reduce<
      Record<string, number>
    >((counts, member) => {
      const role =
        member.role || 'unassigned'

      counts[role] =
        (counts[role] ?? 0) + 1

      return counts
    }, {})

  /*
   * Metrics should represent the filtered team list.
   * This makes the dashboard metrics immediately
   * useful when a role/status/search filter is active.
   */

  const selectedMember =
    params.member
      ? members.find(
          (member) =>
            member.id ===
            params.member,
        ) ?? null
      : null

  return (
    <div className="space-y-6">
      <TeamHeader />

      <TeamMetrics
        total={total}
        active={active}
        inactive={inactive}
        roleCounts={roleCounts}
      />

      <TeamFilters />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.75fr)]">
        <TeamList
          members={members}
          selectedMemberId={
            selectedMember?.id
          }
        />

        <div className="space-y-6">
          {selectedMember ? (
            <>
              <TeamMemberDetail
                member={
                  selectedMember
                }
              />

              <TeamMemberEditor
                member={
                  selectedMember
                }
              />
            </>
          ) : (
            <TeamMemberEditor />
          )}
        </div>
      </div>
    </div>
  )
}