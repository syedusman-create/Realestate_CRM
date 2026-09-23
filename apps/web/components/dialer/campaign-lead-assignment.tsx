'use client'

import {
  useState,
  useTransition,
} from 'react'

import { addLeadsToCampaign } from '@/app/dashboard/dialer/admin/actions'

import type {
  CampaignAvailableLead,
} from '@/lib/crm/dialer/types'

type Props = {
  campaignId: string
  leads: CampaignAvailableLead[]
}

export function CampaignLeadAssignment({
  campaignId,
  leads,
}: Props) {
  const [selected, setSelected] =
    useState<
      Set<string>
    >(new Set())

  const [pending, startTransition] =
    useTransition()

  const [message, setMessage] =
    useState('')

  function toggle(
    leadId: string,
  ) {
    setSelected(
      (current) => {
        const next =
          new Set(current)

        if (
          next.has(leadId)
        ) {
          next.delete(leadId)
        } else {
          next.add(leadId)
        }

        return next
      },
    )
  }

  function submit() {
    const formData =
      new FormData()

    for (const id of selected) {
      formData.append(
        'lead_id',
        id,
      )
    }

    startTransition(
      async () => {
        const result =
          await addLeadsToCampaign(
            campaignId,
            formData,
          )

        setMessage(
          result.message,
        )

        if (result.ok) {
          setSelected(
            new Set(),
          )
        }
      },
    )
  }

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold">
            Manual lead assignment
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select specific leads to add to this campaign queue.
          </p>
        </div>

        <button
          type="button"
          disabled={
            pending ||
            selected.size === 0
          }
          onClick={submit}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {pending
            ? 'Assigning...'
            : `Assign ${selected.size || ''} lead${selected.size === 1 ? '' : 's'}`}
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {!leads.length ? (
        <div className="mt-5 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No additional leads are available in the current selection.
        </div>
      ) : (
        <div className="mt-5 divide-y rounded-lg border">
          {leads.map(
            (lead) => (
              <label
                key={lead.id}
                className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  checked={selected.has(
                    lead.id,
                  )}
                  onChange={() =>
                    toggle(
                      lead.id,
                    )
                  }
                />

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {lead.person_name}
                  </span>

                  <span className="block text-xs text-muted-foreground">
                    {lead.temperature} ·{' '}
                    {lead.priority}
                  </span>
                </span>
              </label>
            ),
          )}
        </div>
      )}
    </section>
  )
}