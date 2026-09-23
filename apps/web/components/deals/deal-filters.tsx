'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Input } from '@/components/ui/input'

const statuses = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'paused', label: 'Paused' },
] as const

export function DealFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const query = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? 'all'

  function updateQuery(value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }

    params.delete('page')

    startTransition(() => {
      router.push(`/dashboard/deals?${params.toString()}`)
    })
  }

  function updateStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all') {
      params.delete('status')
    } else {
      params.set('status', value)
    }

    params.delete('page')

    startTransition(() => {
      router.push(`/dashboard/deals?${params.toString()}`)
    })
  }

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <h2>Pipeline filters</h2>
          <span className="muted small">
            Search opportunities by name or customer.
          </span>
        </div>

        {pending ? (
          <span className="muted small">Updating…</span>
        ) : null}
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Search</span>

          <Input
            defaultValue={query}
            placeholder="Opportunity or customer"
            onChange={(event) => updateQuery(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Status</span>

          <select
            value={status}
            onChange={(event) => updateStatus(event.target.value)}
            className="input"
          >
            {statuses.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}