'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  UNIT_STATUSES,
} from '@/lib/crm/inventory/types'

type Option = {
  id: string
  name: string
}

type PhaseOption = Option & {
  project_id: string
}

type TowerOption = Option & {
  project_id: string
  phase_id: string | null
}

type ConfigurationOption = Option & {
  project_id: string
}

type Props = {
  projects: Option[]
  developers: Option[]
  phases: PhaseOption[]
  towers: TowerOption[]
  configurations: ConfigurationOption[]
}

export function InventoryFilters({
  projects,
  developers,
  phases,
  towers,
  configurations,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initial = useMemo(
    () => ({
      q: searchParams.get('q') ?? '',
      project:
        searchParams.get('project') ?? '',
      developer:
        searchParams.get('developer') ?? '',
      phase:
        searchParams.get('phase') ?? '',
      tower:
        searchParams.get('tower') ?? '',
      configuration:
        searchParams.get('configuration') ?? '',
      status:
        searchParams.get('status') ?? '',
      propertyType:
        searchParams.get('propertyType') ?? '',
      listingType:
        searchParams.get('listingType') ?? '',
      bedrooms:
        searchParams.get('bedrooms') ?? '',
    }),
    [searchParams],
  )

  const [query, setQuery] = useState(
    initial.q,
  )

  useEffect(() => {
    setQuery(initial.q)
  }, [initial.q])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(
        searchParams.toString(),
      )

      if (query.trim()) {
        params.set('q', query.trim())
      } else {
        params.delete('q')
      }

      router.replace(
        `${pathname}?${params.toString()}`,
      )
    }, 300)

    return () => window.clearTimeout(timer)
  }, [
    query,
    pathname,
    router,
    searchParams,
  ])

  const selectedProject = initial.project
  const selectedPhase = initial.phase

  const visiblePhases = selectedProject
    ? phases.filter(
        (phase) =>
          phase.project_id ===
          selectedProject,
      )
    : phases

  const visibleTowers = towers.filter(
    (tower) => {
      if (
        selectedProject &&
        tower.project_id !== selectedProject
      ) {
        return false
      }

      if (
        selectedPhase &&
        tower.phase_id !== selectedPhase
      ) {
        return false
      }

      return true
    },
  )

  const visibleConfigurations =
    configurations.filter(
      (configuration) =>
        !selectedProject ||
        configuration.project_id ===
          selectedProject,
    )

  function updateFilter(
    key: string,
    value: string,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    )

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    if (key === 'project') {
      params.delete('phase')
      params.delete('tower')
      params.delete('configuration')
    }

    if (key === 'phase') {
      params.delete('tower')
    }

    router.push(
      `${pathname}?${params.toString()}`,
    )
  }

  function clearFilters() {
    const params = new URLSearchParams()

    if (query.trim()) {
      params.set('q', query.trim())
    }

    router.push(
      `${pathname}?${params.toString()}`,
    )
  }

  const hasFilters =
    Boolean(initial.project) ||
    Boolean(initial.developer) ||
    Boolean(initial.phase) ||
    Boolean(initial.tower) ||
    Boolean(initial.configuration) ||
    Boolean(initial.status) ||
    Boolean(initial.propertyType) ||
    Boolean(initial.listingType) ||
    Boolean(initial.bedrooms)

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search unit, project, tower..."
          className="h-9 rounded-md border bg-background px-3 text-sm md:col-span-2"
        />

        <select
          value={initial.project}
          onChange={(event) =>
            updateFilter(
              'project',
              event.target.value,
            )
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All projects
          </option>

          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
            >
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={initial.developer}
          onChange={(event) =>
            updateFilter(
              'developer',
              event.target.value,
            )
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All developers
          </option>

          {developers.map((developer) => (
            <option
              key={developer.id}
              value={developer.id}
            >
              {developer.name}
            </option>
          ))}
        </select>

        <select
          value={initial.phase}
          onChange={(event) =>
            updateFilter(
              'phase',
              event.target.value,
            )
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All phases
          </option>

          {visiblePhases.map((phase) => (
            <option
              key={phase.id}
              value={phase.id}
            >
              {phase.name}
            </option>
          ))}
        </select>

        <select
          value={initial.tower}
          onChange={(event) =>
            updateFilter(
              'tower',
              event.target.value,
            )
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All towers
          </option>

          {visibleTowers.map((tower) => (
            <option
              key={tower.id}
              value={tower.id}
            >
              {tower.name}
            </option>
          ))}
        </select>

        <select
          value={initial.configuration}
          onChange={(event) =>
            updateFilter(
              'configuration',
              event.target.value,
            )
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All configurations
          </option>

          {visibleConfigurations.map(
            (configuration) => (
              <option
                key={configuration.id}
                value={configuration.id}
              >
                {configuration.name}
              </option>
            ),
          )}
        </select>

        <select
          value={initial.status}
          onChange={(event) =>
            updateFilter(
              'status',
              event.target.value,
            )
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All statuses
          </option>

          {UNIT_STATUSES.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status.replaceAll('_', ' ')}
            </option>
          ))}
        </select>

        <select
          value={initial.bedrooms}
          onChange={(event) =>
            updateFilter(
              'bedrooms',
              event.target.value,
            )
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All BHK
          </option>

          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4 BHK</option>
          <option value="5">5 BHK</option>
        </select>

        <select
          value={initial.propertyType}
          onChange={(event) =>
            updateFilter(
              'propertyType',
              event.target.value,
            )
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All property types
          </option>

          {PROPERTY_TYPES.map((type) => (
            <option
              key={type}
              value={type}
            >
              {type.replaceAll('_', ' ')}
            </option>
          ))}
        </select>

        <select
          value={initial.listingType}
          onChange={(event) =>
            updateFilter(
              'listingType',
              event.target.value,
            )
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All listing types
          </option>

          {LISTING_TYPES.map((type) => (
            <option
              key={type}
              value={type}
            >
              {type.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}