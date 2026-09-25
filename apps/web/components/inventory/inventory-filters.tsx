'use client'

import { useEffect, useRef } from 'react'
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

type Option = { id: string; name: string }

type Props = {
  projects: Option[]
  developers: Option[]
  phases: Array<Option & { projectId: string }>
  towers: Array<Option & { phaseId: string; towerCode: string | null }>
  configurations: Array<Option & { projectId: string }>
}

export function InventoryFilters({
  projects,
  developers,
  phases,
  towers,
  configurations,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedProject = searchParams.get('project') ?? ''
  const selectedPhase = searchParams.get('phase') ?? ''

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)

    router.push(\`/dashboard/inventory?\${params.toString()}\`)
  }

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
  }, [])

  const visiblePhases = selectedProject
    ? phases.filter((phase) => phase.projectId === selectedProject)
    : phases

  const visibleTowers = selectedPhase
    ? towers.filter((tower) => tower.phaseId === selectedPhase)
    : towers

  const visibleConfigurations = selectedProject
    ? configurations.filter((configuration) => configuration.projectId === selectedProject)
    : configurations

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Input
        placeholder="Search unit, project, tower..."
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(event) => {
          const value = event.target.value
          if (searchTimer.current) clearTimeout(searchTimer.current)
          searchTimer.current = setTimeout(() => updateFilter('q', value), 250)
        }}
      />

      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={selectedProject} onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString())
        if (event.target.value) params.set('project', event.target.value)
        else params.delete('project')
        params.delete('phase')
        params.delete('tower')
        params.delete('configuration')
        router.push(\`/dashboard/inventory?\${params.toString()}\`)
      }}>
        <option value="">All projects</option>
        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
      </select>

      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={searchParams.get('developer') ?? ''} onChange={(event) => updateFilter('developer', event.target.value)}>
        <option value="">All developers</option>
        {developers.map((developer) => <option key={developer.id} value={developer.id}>{developer.name}</option>)}
      </select>

      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={selectedPhase} onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString())
        if (event.target.value) params.set('phase', event.target.value)
        else params.delete('phase')
        params.delete('tower')
        router.push(\`/dashboard/inventory?\${params.toString()}\`)
      }}>
        <option value="">All phases</option>
        {visiblePhases.map((phase) => <option key={phase.id} value={phase.id}>{phase.name}</option>)}
      </select>

      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={searchParams.get('tower') ?? ''} onChange={(event) => updateFilter('tower', event.target.value)}>
        <option value="">All towers</option>
        {visibleTowers.map((tower) => <option key={tower.id} value={tower.id}>{tower.name}{tower.towerCode ? \` (\${tower.towerCode})\` : ''}</option>)}
      </select>

      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={searchParams.get('configuration') ?? ''} onChange={(event) => updateFilter('configuration', event.target.value)}>
        <option value="">All configurations</option>
        {visibleConfigurations.map((configuration) => <option key={configuration.id} value={configuration.id}>{configuration.name}</option>)}
      </select>

      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={searchParams.get('status') ?? ''} onChange={(event) => updateFilter('status', event.target.value)}>
        <option value="">All statuses</option>
        {UNIT_STATUSES.map((status) => <option key={status} value={status}>{formatUnitStatus(status)}</option>)}
      </select>

      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={searchParams.get('bedrooms') ?? ''} onChange={(event) => updateFilter('bedrooms', event.target.value)}>
        <option value="">All BHK</option>
        <option value="1">1 BHK</option>
        <option value="2">2 BHK</option>
        <option value="2.5">2.5 BHK</option>
        <option value="3">3 BHK</option>
        <option value="3.5">3.5 BHK</option>
        <option value="4">4 BHK</option>
        <option value="5">5 BHK</option>
      </select>

      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={searchParams.get('propertyType') ?? ''} onChange={(event) => updateFilter('propertyType', event.target.value)}>
        <option value="">All property types</option>
        {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{formatPropertyType(type)}</option>)}
      </select>

      <select className="h-9 rounded-md border bg-background px-3 text-sm" value={searchParams.get('listingType') ?? ''} onChange={(event) => updateFilter('listingType', event.target.value)}>
        <option value="">All listing types</option>
        {LISTING_TYPES.map((type) => <option key={type} value={type}>{formatListingType(type)}</option>)}
      </select>
    </div>
  )
}
