'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Tables } from '@realestate-crm/database'
import { createUnit } from '@/app/dashboard/inventory/actions'
import {
  EMPTY_INVENTORY_ACTION_STATE,
  FURNISHING_OPTIONS,
  LISTING_STATUSES,
  LISTING_TYPES,
  UNIT_STATUSES,
  formatListingType,
  formatUnitStatus,
} from '@/lib/crm/inventory/types'

type Project = Tables<'projects'>
type Phase = Tables<'project_phases'>
type Tower = Tables<'project_towers'>
type Configuration = Tables<'project_configurations'>

type Props = {
  projects: Project[]
  phases: Phase[]
  towers: Tower[]
  configurations: Configuration[]
  initialProjectId: string
}

export function InventoryCreateForm({
  projects,
  phases,
  towers,
  configurations,
  initialProjectId,
}: Props) {
  const [projectId, setProjectId] = useState(initialProjectId)
  const [phaseId, setPhaseId] = useState('')
  const [createListing, setCreateListing] = useState(false)

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

  const router = useRouter()

  const [state, formAction, pending] = useActionState(
    createUnit,
    EMPTY_INVENTORY_ACTION_STATE,
  )

  useEffect(() => {
    if (state.ok && state.unitId) {
      router.push(`/dashboard/inventory/${state.unitId}`)
    }
  }, [router, state.ok, state.unitId])

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className={`rounded-md border px-4 py-3 text-sm ${
          state.ok ? 'border-border bg-muted/30' : 'border-destructive/30 text-destructive'
        }`}>
          {state.message}
        </div>
      ) : null}

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Location</h2>
          <p className="text-sm text-muted-foreground">Place the unit inside the existing project hierarchy.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Project *</span>
            <select name="project_id" required value={projectId} onChange={(event) => { setProjectId(event.target.value); setPhaseId('') }} className="h-9 w-full rounded-md border bg-background px-3">
              <option value="">Select project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Phase</span>
            <select name="phase_id" value={phaseId} onChange={(event) => setPhaseId(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3" disabled={!projectId}>
              <option value="">No phase</option>
              {phasesForProject.map((phase) => <option key={phase.id} value={phase.id}>{phase.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Tower</span>
            <select name="tower_id" defaultValue="" className="h-9 w-full rounded-md border bg-background px-3" disabled={!phaseId}>
              <option value="">No tower</option>
              {towersForPhase.map((tower) => <option key={tower.id} value={tower.id}>{tower.name}{tower.tower_code ? ` (${tower.tower_code})` : ''}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Unit number *</span>
            <input name="unit_number" required className="h-9 w-full rounded-md border bg-background px-3" placeholder="A-1204" />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Floor</span>
            <input name="floor_number" type="number" min="0" step="1" className="h-9 w-full rounded-md border bg-background px-3" />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">Configuration</h2>
          <p className="text-sm text-muted-foreground">Choose a project configuration or enter unit-level specifications.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm lg:col-span-2">
            <span className="font-medium">Configuration</span>
            <select name="configuration_id" defaultValue="" className="h-9 w-full rounded-md border bg-background px-3" disabled={!projectId}>
              <option value="">No configuration</option>
              {configurationsForProject.map((configuration) => <option key={configuration.id} value={configuration.id}>{configuration.configuration_name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm"><span className="font-medium">Bedrooms</span><input name="bedrooms" type="number" step="0.5" className="h-9 w-full rounded-md border bg-background px-3" /></label>
          <label className="space-y-1.5 text-sm"><span className="font-medium">Bathrooms</span><input name="bathrooms" type="number" step="0.5" className="h-9 w-full rounded-md border bg-background px-3" /></label>
          <label className="space-y-1.5 text-sm"><span className="font-medium">Facing</span><input name="facing" className="h-9 w-full rounded-md border bg-background px-3" placeholder="East" /></label>
          <label className="space-y-1.5 text-sm"><span className="font-medium">Parking spaces</span><input name="parking_count" type="number" min="0" step="1" className="h-9 w-full rounded-md border bg-background px-3" /></label>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Area</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['carpet_area_sqft', 'Carpet area'],
            ['builtup_area_sqft', 'Built-up area'],
            ['super_builtup_area_sqft', 'Super built-up area'],
            ['balcony_area_sqft', 'Balcony area'],
          ].map(([name, label]) => (
            <label key={name} className="space-y-1.5 text-sm">
              <span className="font-medium">{label}</span>
              <input name={name} type="number" min="0" step="0.01" className="h-9 w-full rounded-md border bg-background px-3" />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Commercial</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm"><span className="font-medium">Asking price</span><input name="asking_price" type="number" min="0" step="0.01" className="h-9 w-full rounded-md border bg-background px-3" /></label>
          <label className="space-y-1.5 text-sm"><span className="font-medium">Price / sq.ft</span><input name="price_per_sqft" type="number" min="0" step="0.01" className="h-9 w-full rounded-md border bg-background px-3" /></label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Status</span>
            <select name="status" defaultValue="available" className="h-9 w-full rounded-md border bg-background px-3">
              {UNIT_STATUSES.map((status) => <option key={status} value={status}>{formatUnitStatus(status)}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-6">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="create_listing" value="yes" checked={createListing} onChange={(event) => setCreateListing(event.target.checked)} className="mt-1" />
          <span><span className="font-medium">Create a listing too</span><span className="mt-1 block text-sm text-muted-foreground">Keep the inventory unit and market listing as separate records.</span></span>
        </label>

        {createListing ? (
          <div className="grid gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5 text-sm"><span className="font-medium">Listing type</span><select name="listing_type" defaultValue="primary_sale" className="h-9 w-full rounded-md border bg-background px-3">{LISTING_TYPES.map((type) => <option key={type} value={type}>{formatListingType(type)}</option>)}</select></label>
            <label className="space-y-1.5 text-sm"><span className="font-medium">Listing status</span><select name="listing_status" defaultValue="draft" className="h-9 w-full rounded-md border bg-background px-3">{LISTING_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
            <label className="space-y-1.5 text-sm"><span className="font-medium">Listing asking price</span><input name="listing_asking_price" type="number" min="0" step="0.01" className="h-9 w-full rounded-md border bg-background px-3" /></label>
            <label className="space-y-1.5 text-sm"><span className="font-medium">Rent</span><input name="rent_amount" type="number" min="0" step="0.01" className="h-9 w-full rounded-md border bg-background px-3" /></label>
            <label className="space-y-1.5 text-sm"><span className="font-medium">Deposit</span><input name="deposit_amount" type="number" min="0" step="0.01" className="h-9 w-full rounded-md border bg-background px-3" /></label>
            <label className="space-y-1.5 text-sm"><span className="font-medium">Maintenance</span><input name="maintenance_amount" type="number" min="0" step="0.01" className="h-9 w-full rounded-md border bg-background px-3" /></label>
            <label className="space-y-1.5 text-sm"><span className="font-medium">Available from</span><input name="available_from" type="date" className="h-9 w-full rounded-md border bg-background px-3" /></label>
            <label className="space-y-1.5 text-sm"><span className="font-medium">Furnishing</span><select name="furnishing" defaultValue="" className="h-9 w-full rounded-md border bg-background px-3"><option value="">Not specified</option>{FURNISHING_OPTIONS.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}</select></label>
            <label className="space-y-1.5 text-sm"><span className="font-medium">Expires at</span><input name="expires_at" type="datetime-local" className="h-9 w-full rounded-md border bg-background px-3" /></label>
            <label className="space-y-1.5 text-sm md:col-span-2 lg:col-span-3"><span className="font-medium">Listing description</span><textarea name="description" rows={4} className="w-full rounded-md border bg-background px-3 py-2" /></label>
          </div>
        ) : null}
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50">
          {pending ? 'Creating property…' : 'Create property'}
        </button>
        <a href="/dashboard/inventory" className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted">Cancel</a>
      </div>
    </form>
  )
}
