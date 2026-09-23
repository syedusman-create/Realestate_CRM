import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  search: string
  temperature: 'all' | 'hot' | 'warm' | 'cold'
}

const filters = [
  { value: 'all', label: 'All' },
  { value: 'hot', label: 'Hot' },
  { value: 'warm', label: 'Warm' },
  { value: 'cold', label: 'Cold' },
] as const

export default function LeadFilters({
  search,
  temperature,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <form
        method="get"
        className="flex flex-1 gap-2"
      >
        <Input
          name="q"
          defaultValue={search}
          placeholder="Search name, phone, email or owner…"
          className="max-w-xl"
        />

        {temperature !== 'all' && (
          <input
            type="hidden"
            name="temperature"
            value={temperature}
          />
        )}

        <Button type="submit">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const params = new URLSearchParams()

          if (search) {
            params.set('q', search)
          }

          if (filter.value !== 'all') {
            params.set('temperature', filter.value)
          }

          const href = params.toString()
            ? `/dashboard/leads?${params.toString()}`
            : '/dashboard/leads'

          return (
            <Link
              key={filter.value}
              href={href}
              className={
                temperature === filter.value
                  ? 'inline-flex h-9 items-center rounded-md bg-brand-gold px-3 text-sm font-semibold text-brand-navy shadow-sm hover:bg-brand-gold-dark'
                  : 'inline-flex h-9 items-center rounded-md border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent'
              }
            >
              {filter.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}