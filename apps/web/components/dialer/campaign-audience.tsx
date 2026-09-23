'use client'

import {
  useState,
  useTransition,
} from 'react'

import { populateCampaign } from '@/app/dashboard/dialer/admin/actions'

type Props = {
  campaignId: string
}

export function CampaignAudience({
  campaignId,
}: Props) {
  const [pending, startTransition] =
    useTransition()

  const [message, setMessage] =
    useState('')

  const [temperature, setTemperature] =
    useState('any')

  const [limit, setLimit] =
    useState('100')

  const [priority, setPriority] =
    useState('0')

  function submit() {
    const formData =
      new FormData()

    formData.set(
      'temperature',
      temperature,
    )

    formData.set(
      'limit',
      limit,
    )

    formData.set(
      'queue_priority',
      priority,
    )

    startTransition(
      async () => {
        const result =
          await populateCampaign(
            campaignId,
            formData,
          )

        setMessage(
          result.message,
        )
      },
    )
  }

  return (
    <section className="rounded-xl border bg-card p-5">
      <div>
        <h2 className="font-semibold">
          Populate campaign
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Add eligible leads with a usable phone number to the campaign queue.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium">
            Temperature
          </span>

          <select
            value={temperature}
            onChange={(event) =>
              setTemperature(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="any">
              Any
            </option>

            <option value="hot">
              Hot
            </option>

            <option value="warm">
              Warm
            </option>

            <option value="cold">
              Cold
            </option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">
            Maximum leads
          </span>

          <input
            type="number"
            min={1}
            max={5000}
            value={limit}
            onChange={(event) =>
              setLimit(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">
            Queue priority
          </span>

          <input
            type="number"
            min={0}
            max={100}
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {pending
            ? 'Loading...'
            : 'Load eligible leads'}
        </button>

        {message && (
          <span className="text-sm text-muted-foreground">
            {message}
          </span>
        )}
      </div>
    </section>
  )
}