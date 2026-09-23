'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import type {
  Recommendation,
  ShareMatchesState,
} from '@/lib/crm/leads/types'

type Action = (
  state: ShareMatchesState,
  formData: FormData,
) => Promise<ShareMatchesState>

const initialState: ShareMatchesState = {
  ok: false,
  message: '',
}

function formatMoney(value: number | null) {
  if (value == null) {
    return 'Price on request'
  }

  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(2)} Cr`
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)} L`
  }

  return `₹${value.toLocaleString('en-IN')}`
}

export default function ShareMatches({
  leadId,
  phone,
  matches,
  action,
}: {
  leadId: string
  phone: string | null
  matches: Recommendation[]
  action: Action
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  )

  if (!matches.length) {
    return null
  }

  const directWhatsApp = phone
    ? `https://wa.me/${phone.replace(/^\+/, '')}`
    : null

  return (
    <form
      action={formAction}
      className="space-y-4"
    >
      <input
        type="hidden"
        name="lead_id"
        value={leadId}
      />

      <div className="grid gap-3">
        {matches.map((match) => {
          const value = [
            match.project_id,
            match.unit_id ?? '',
            match.listing_id ?? '',
          ].join('|')

          return (
            <label
              key={`${match.project_id}-${match.unit_id ?? match.listing_id ?? match.rank}`}
              className="cursor-pointer"
            >
              <Card className="transition-colors hover:bg-accent/40">
                <CardContent className="flex items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    name="match"
                    value={value}
                    className="mt-1 size-4 accent-primary"
                  />

                  <div className="min-w-0">
                    <div className="font-medium">
                      {match.project_name}
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      {match.unit_number ?? 'Matched property'}
                      {' · '}
                      {match.bedrooms ?? '—'} BHK
                      {' · '}
                      {match.area_sqft
                        ? `${Number(match.area_sqft).toLocaleString('en-IN')} sq ft`
                        : 'Area —'}
                      {' · '}
                      {formatMoney(match.price)}
                    </div>

                    {match.location_name && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {match.location_name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </label>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={pending}
        >
          {pending
            ? 'Preparing…'
            : 'Create WhatsApp share'}
        </Button>

        {directWhatsApp && (
          <a
            href={directWhatsApp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent"
          >
            Open chat
          </a>
        )}
      </div>

      {state.message && (
        <div
          className={
            state.ok
              ? 'rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm'
              : 'rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm'
          }
        >
          {state.message}
        </div>
      )}

      {state.whatsappUrl && (
        <a
          href={state.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          Open WhatsApp with selected properties →
        </a>
      )}
    </form>
  )
}