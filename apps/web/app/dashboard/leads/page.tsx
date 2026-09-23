import Link from 'next/link'
import { Plus, Users } from 'lucide-react'

import LeadFilters from '@/components/leads/lead-filters'
import LeadList from '@/components/leads/lead-list'
import { createClient } from '@/lib/supabase/server'
import type {
  LeadFilterTemperature,
  LeadListItem,
} from '@/lib/crm/leads/types'

const PAGE_SIZE = 20

type LeadsPageProps = {
  searchParams: Promise<{
    q?: string
    temperature?: string
    page?: string
  }>
}

export const metadata = {
  title: 'Leads',
}

function parseTemperature(
  value: string | undefined,
): LeadFilterTemperature {
  if (
    value === 'hot' ||
    value === 'warm' ||
    value === 'cold'
  ) {
    return value
  }

  return 'all'
}

function parsePage(value: string | undefined) {
  const page = Number.parseInt(value ?? '1', 10)

  if (!Number.isFinite(page) || page < 1) {
    return 1
  }

  return page
}

function sanitizeSearch(value: string) {
  /*
   * PostgREST .or() expressions use a small filter syntax.
   * Remove characters that could alter that expression.
   */
  return value
    .trim()
    .replace(/[,%()]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 100)
}

export default async function LeadsPage({
  searchParams,
}: LeadsPageProps) {
  const params = await searchParams

  const search = sanitizeSearch(
    params.q ?? '',
  )

  const temperature =
    parseTemperature(params.temperature)

  const requestedPage =
    parsePage(params.page)

  const supabase = await createClient()

  /*
   * Resolve the authenticated CRM user.
   */
  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims()

  if (
    claimsError ||
    !claimsData?.claims?.sub
  ) {
    return (
      <div className="space-y-7">
        <header className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-dark">
            <Users className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Leads
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Authentication is required to view leads.
            </p>
          </div>
        </header>
      </div>
    )
  }

  const userId =
    claimsData.claims.sub

  const {
    data: currentUser,
    error: currentUserError,
  } = await supabase
    .from('users')
    .select(
      'id, tenant_code, workspace_id, is_active',
    )
    .eq('id', userId)
    .maybeSingle()

  if (
    currentUserError ||
    !currentUser ||
    currentUser.is_active === false
  ) {
    return (
      <div className="space-y-7">
        <header className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-dark">
            <Users className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Leads
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Your CRM user profile could not be loaded.
            </p>
          </div>
        </header>
      </div>
    )
  }

  /*
   * lead_dashboard exposes tenant_id, so resolve the tenant UUID
   * from the authenticated user's tenant_code.
   */
  const {
    data: tenant,
    error: tenantError,
  } = await supabase
    .from('tenants')
    .select('id')
    .eq(
      'tenant_code',
      currentUser.tenant_code,
    )
    .maybeSingle()

  if (tenantError || !tenant) {
    return (
      <div className="space-y-7">
        <header className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-dark">
            <Users className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Leads
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              The current tenant could not be resolved.
            </p>
          </div>
        </header>
      </div>
    )
  }

  const tenantId = tenant.id as string

  /*
   * Build the lead-dashboard query.
   */
  let query = supabase
    .from('lead_dashboard')
    .select('*', {
      count: 'exact',
    })
    .eq('tenant_id', tenantId)
    .order('updated_at', {
      ascending: false,
    })

  if (temperature !== 'all') {
    query = query.eq(
      'temperature',
      temperature,
    )
  }

  if (search) {
    const escapedSearch =
      search.replace(/[%_]/g, '\\$&')

    query = query.or(
      [
        `person_name.ilike.%${escapedSearch}%`,
        `phone.ilike.%${escapedSearch}%`,
        `email.ilike.%${escapedSearch}%`,
        `assigned_user_name.ilike.%${escapedSearch}%`,
      ].join(','),
    )
  }

  /*
   * First get the count so we can calculate the valid page range.
   *
   * Supabase's count is returned together with the paginated query,
   * so we initially request the requested page.
   */
  const initialFrom =
    (requestedPage - 1) * PAGE_SIZE

  const initialTo =
    initialFrom + PAGE_SIZE - 1

  const {
    data: initialLeads,
    count,
    error: leadsError,
  } = await query.range(
    initialFrom,
    initialTo,
  )

  if (leadsError) {
    return (
      <div className="space-y-7">
        <header className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-dark">
            <Users className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Leads
            </h1>

            <p className="mt-2 text-sm text-destructive">
              Unable to load leads.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {leadsError.message}
            </p>
          </div>
        </header>
      </div>
    )
  }

  const total = count ?? 0

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  )

  /*
   * If someone manually requests a page beyond the end,
   * load the final valid page instead.
   */
  const page = Math.min(
    requestedPage,
    totalPages,
  )

  let leads = initialLeads ?? []

  if (page !== requestedPage) {
    const from =
      (page - 1) * PAGE_SIZE

    const to =
      from + PAGE_SIZE - 1

    const {
      data: correctedLeads,
      error: correctedError,
    } = await query.range(from, to)

    if (correctedError) {
      return (
        <div className="space-y-7">
          <header className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-dark">
              <Users className="size-5" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Leads
              </h1>

              <p className="mt-2 text-sm text-destructive">
                Unable to load leads.
              </p>
            </div>
          </header>
        </div>
      )
    }

    leads = correctedLeads ?? []
  }

  const leadItems =
    leads as LeadListItem[]

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-dark">
            <Users className="size-5" />
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Sales workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Leads
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage prospects, follow-ups, qualification, and lead
              ownership from one workspace.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/leads/new"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-action px-3 text-sm font-semibold text-action-foreground shadow-sm transition-colors hover:bg-action-hover"
        >
          <Plus className="mr-2 size-4" />
          Create lead
        </Link>
      </header>

      <section className="space-y-4">
        <LeadFilters
          search={search}
          temperature={temperature}
        />

        <LeadList
          leads={leadItems}
          page={page}
          totalPages={totalPages}
          total={total}
        />
      </section>
    </div>
  )
}