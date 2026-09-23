'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  UNIT_STATUSES,
  formatListingType,
  formatPropertyType,
  formatUnitStatus,
} from '@/lib/crm/inventory/types'

type Props = {
  projects: Array<{
    id: string
    name: string
  }>
  developers: Array<{
    id: string
    name: string
  }>
}

export function InventoryFilters({
  projects,
  developers,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/dashboard/inventory?${params.toString()}`)
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Input
        placeholder="Search unit, project..."
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(event) => {
          updateFilter('q', event.target.value)
        }}
      />

      <select
        className="h-9 rounded-md border bg-background px-3 text-sm"
        defaultValue={searchParams.get('project') ?? ''}
        onChange={(event) => updateFilter('project', event.target.value)}
      >
        <option value="">All projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-md border bg-background px-3 text-sm"
        defaultValue={searchParams.get('developer') ?? ''}
        onChange={(event) =>
          updateFilter('developer', event.target.value)
        }
      >
        <option value="">All developers</option>
        {developers.map((developer) => (
          <option key={developer.id} value={developer.id}>
            {developer.name}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-md border bg-background px-3 text-sm"
        defaultValue={searchParams.get('status') ?? ''}
        onChange={(event) => updateFilter('status', event.target.value)}
      >
        <option value="">All statuses</option>
        {UNIT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {formatUnitStatus(status)}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-md border bg-background px-3 text-sm"
        defaultValue={searchParams.get('propertyType') ?? ''}
        onChange={(event) =>
          updateFilter('propertyType', event.target.value)
        }
      >
        <option value="">All property types</option>
        {PROPERTY_TYPES.map((type) => (
          <option key={type} value={type}>
            {formatPropertyType(type)}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-md border bg-background px-3 text-sm"
        defaultValue={searchParams.get('listingType') ?? ''}
        onChange={(event) =>
          updateFilter('listingType', event.target.value)
        }
      >
        <option value="">All listing types</option>
        {LISTING_TYPES.map((type) => (
          <option key={type} value={type}>
            {formatListingType(type)}
          </option>
        ))}
      </select>
    </div>
  )
}
