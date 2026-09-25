'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Tables } from '@realestate-crm/database'
import { updateUnit } from '@/app/dashboard/inventory/actions'
import {
  UNIT_STATUSES,
  type Unit,
  type Project,
  type ProjectConfiguration,
} from '@/lib/crm/inventory/types'

type Phase = Tables<'project_phases'>
type Tower = Tables<'project_towers'>

type Props = {
  unit: Unit
  projects: Project[]
  phases: Phase[]
  towers: Tower[]
  configurations: ProjectConfiguration[]
}

export function InventoryEditor({
  unit,
  projects,
  phases,
  towers,
  configurations,
}: Props) {
  const [message, setMessage] = useState('')
  const [projectId, setProjectId] = useState(unit.project_id)
  const [phaseId, setPhaseId] = useState(unit.phase_id ?? '')

  const phasesForProject = useMemo(
    () => phases.filter((phase) => phase.project_id === projectId),
    [phases, projectId],
  )
  const towersForPhase = useMemo(
    () => towers.filter((tower) => tower.phase_id === phaseId),
    [towers, phaseId],
  )
  const configurationsForProject = useMemo(
    () => configurations.filter((configuration) => configuration.project_id === projectId),
    [configurations, projectId],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const result = await updateUnit(unit.id, formData)
    setMessage(result.message)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Unit details</h2>
        <p className="text-sm text-muted-foreground">
          Update physical inventory, hierarchy, and pricing information.
        </p>
      </div>

      {message ? <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{message}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Project</span>
          <select
            name="project_id"
            value={projectId}
            onChange={(event) => { setProjectId(event.target.value); setPhaseId('') }}
            className="h-9 w-full rounded-md border bg-background px-3"
            required
          >
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Phase</span>
          <select
            name="phase_id"
            value={phaseId}
            onChange={(event) => setPhaseId(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3"
          >
            <option value="">No phase</option>
            {phasesForProject.map((phase) => <option key={phase.id} value={phase.id}>{phase.name}</option>)}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Tower</span>
          <select name="tower_id" defaultValue={unit.tower_id ?? ''} className="h-9 w-full rounded-md border bg-background px-3">
            <option value="">No tower</option>
            {towersForPhase.map((tower) => <option key={tower.id} value={tower.id}>{tower.name}{tower.tower_code ? ` (${tower.tower_code})` : ''}</option>)}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Unit number</span>
          <input name="unit_number" defaultValue={unit.unit_number} className="h-9 w-full rounded-md border bg-background px-3" required />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Status</span>
          <select name="status" defaultValue={unit.status} className="h-9 w-full rounded-md border bg-background px-3">
            {UNIT_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Configuration</span>
          <select name="configuration_id" defaultValue={unit.configuration_id ?? ''} className="h-9 w-full rounded-md border bg-background px-3">
            <option value="">No configuration</option>
            {configurationsForProject.map((configuration) => <option key={configuration.id} value={configuration.id}>{configuration.configuration_name}</option>)}
          </select>
        </label>

        {[
          ['floor_number', 'Floor', 'number', '1', unit.floor_number],
          ['bedrooms', 'Bedrooms', 'number', '0.5', unit.bedrooms],
          ['bathrooms', 'Bathrooms', 'number', '0.5', unit.bathrooms],
          ['parking_count', 'Parking', 'number', '1', unit.parking_count],
          ['carpet_area_sqft', 'Carpet area', 'number', '0.01', unit.carpet_area_sqft],
          ['builtup_area_sqft', 'Built-up area', 'number', '0.01', unit.builtup_area_sqft],
          ['super_builtup_area_sqft', 'Super built-up area', 'number', '0.01', unit.super_builtup_area_sqft],
          ['balcony_area_sqft', 'Balcony area', 'number', '0.01', unit.balcony_area_sqft],
          ['asking_price', 'Asking price', 'number', '0.01', unit.asking_price],
          ['price_per_sqft', 'Price / sq.ft', 'number', '0.01', unit.price_per_sqft],
        ].map(([name, label, type, step, value]) => (
          <label key={String(name)} className="space-y-1.5 text-sm">
            <span className="font-medium">{label}</span>
            <input name={String(name)} type={String(type)} step={String(step)} defaultValue={value == null ? '' : String(value)} className="h-9 w-full rounded-md border bg-background px-3" />
          </label>
        ))}

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Facing</span>
          <input name="facing" defaultValue={unit.facing ?? ''} className="h-9 w-full rounded-md border bg-background px-3" />
        </label>
      </div>

      <button type="submit" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
        Save unit
      </button>
    </form>
  )
}
