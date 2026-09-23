import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import type {
  LeadFilterTemperature,
  LeadListItem,
} from '@/lib/crm/leads/types'

type Props = {
  leads: LeadListItem[]
  page: number
  totalPages: number
  total: number
  search?: string
  temperature?: LeadFilterTemperature
}

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(new Date(value))
}

function temperatureClass(
  value: LeadListItem['temperature'],
) {
  if (value === 'hot') {
    return 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
  }

  if (value === 'warm') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
  }

  return 'border-border bg-muted text-muted-foreground'
}

function pageHref(
  page: number,
  search: string,
  temperature: LeadFilterTemperature,
) {
  const params = new URLSearchParams()

  if (search) {
    params.set('q', search)
  }

  if (temperature !== 'all') {
    params.set(
      'temperature',
      temperature,
    )
  }

  if (page > 1) {
    params.set(
      'page',
      String(page),
    )
  }

  const query = params.toString()

  return query
    ? `/dashboard/leads?${query}`
    : '/dashboard/leads'
}

export default function LeadList({
  leads,
  page,
  totalPages,
  total,
  search = '',
  temperature = 'all',
}: Props) {
  if (!leads.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          No leads match the current filters.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {total.toLocaleString('en-IN')}{' '}
        lead
        {total === 1 ? '' : 's'}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="hidden grid-cols-[minmax(220px,2fr)_minmax(140px,1fr)_minmax(130px,1fr)_120px_140px] gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
          <div>Lead</div>
          <div>Owner</div>
          <div>Stage</div>
          <div>Status</div>
          <div>Next action</div>
        </div>

        {leads.map((lead) => (
          <Link
            key={lead.lead_id}
            href={`/dashboard/leads/${lead.lead_id}`}
            className="block border-b last:border-b-0 hover:bg-accent/30"
          >
            <div className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(220px,2fr)_minmax(140px,1fr)_minmax(130px,1fr)_120px_140px] md:items-center md:gap-4">
              <div className="min-w-0">
                <div className="truncate font-medium">
                  {lead.person_name}
                </div>

                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {lead.phone ??
                    lead.email ??
                    'No contact information'}
                </div>
              </div>

              <div className="text-sm">
                {lead.assigned_user_name ??
                  'Unassigned'}
              </div>

              <div className="text-sm">
                {lead.stage_name ?? 'New'}
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium capitalize ${temperatureClass(
                    lead.temperature,
                  )}`}
                >
                  {lead.temperature ??
                    'cold'}
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                {lead.next_task_due_at
                  ? formatDate(
                      lead.next_task_due_at,
                    )
                  : lead.next_followup_at
                    ? formatDate(
                        lead.next_followup_at,
                      )
                    : 'No follow-up'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={pageHref(
                page - 1,
                search,
                temperature,
              )}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              Previous
            </Link>
          )}

          {page < totalPages && (
            <Link
              href={pageHref(
                page + 1,
                search,
                temperature,
              )}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}