'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { updateUnit } from '@/app/dashboard/inventory/actions'
import {
  UNIT_STATUSES,
  type Project,
  type ProjectConfiguration,
  type ProjectPhase,
  type ProjectTower,
  type Unit,
} from '@/lib/crm/inventory/types'

type Props = {
  unit: Unit
  projects: Project[]
  phases: ProjectPhase[]
  towers: ProjectTower[]
  configurations: ProjectConfiguration[]
}

export function InventoryEditor({
  unit,
  projects,
  phases,
  towers,
  configurations,
}: Props) {
  const [message, setMessage] =
    useState('')

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState(unit.project_id)

  const [selectedPhaseId, setSelectedPhaseId] =
    useState(unit.phase_id ?? '')

  const projectPhases = useMemo(
    () =>
      phases.filter(
        (phase) =>
          phase.project_id ===
          selectedProjectId,
      ),
    [phases, selectedProjectId],
  )

  const projectTowers = useMemo(
    () =>
      towers.filter(
        (tower) =>
          tower.phase_id ===
          selectedPhaseId,
      ),
    [towers, selectedPhaseId],
  )

  const projectConfigurations =
    useMemo(
      () =>
        configurations.filter(
          (configuration) =>
            configuration.project_id ===
            selectedProjectId,
        ),
      [
        configurations,
        selectedProjectId,
      ],
    )

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const formData = new FormData(
      event.currentTarget,
    )

    const result = await updateUnit(
      unit.id,
      formData,
    )

    setMessage(result.message)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border bg-card p-6"
    >
      <div>
        <h2 className="text-lg font-semibold">
          Unit details
        </h2>

        <p className="text-sm text-muted-foreground">
          Update physical inventory and pricing
          information.
        </p>
      </div>

      {message && (
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Project
          </span>

          <select
            name="project_id"
            value={selectedProjectId}
            onChange={(event) => {
              setSelectedProjectId(
                event.target.value,
              )
              setSelectedPhaseId('')
            }}
            className="h-9 w-full rounded-md border bg-background px-3"
            required
          >
            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Phase
          </span>

          <select
            name="phase_id"
            value={selectedPhaseId}
            onChange={(event) =>
              setSelectedPhaseId(
                event.target.value,
              )
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          >
            <option value="">
              No phase
            </option>

            {projectPhases.map((phase) => (
              <option
                key={phase.id}
                value={phase.id}
              >
                {phase.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Tower
          </span>

          <select
            name="tower_id"
            defaultValue={
              unit.tower_id ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          >
            <option value="">
              No tower
            </option>

            {projectTowers.map((tower) => (
              <option
                key={tower.id}
                value={tower.id}
              >
                {tower.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Unit number
          </span>

          <input
            name="unit_number"
            defaultValue={unit.unit_number}
            className="h-9 w-full rounded-md border bg-background px-3"
            required
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Status
          </span>

          <select
            name="status"
            defaultValue={unit.status}
            className="h-9 w-full rounded-md border bg-background px-3"
          >
            {UNIT_STATUSES.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status.replaceAll(
                  '_',
                  ' ',
                )}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Configuration
          </span>

          <select
            name="configuration_id"
            defaultValue={
              unit.configuration_id ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          >
            <option value="">
              No configuration
            </option>

            {projectConfigurations.map(
              (configuration) => (
                <option
                  key={configuration.id}
                  value={configuration.id}
                >
                  {
                    configuration.configuration_name
                  }
                </option>
              ),
            )}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Floor
          </span>

          <input
            name="floor_number"
            type="number"
            defaultValue={
              unit.floor_number ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Facing
          </span>

          <input
            name="facing"
            defaultValue={
              unit.facing ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Bedrooms
          </span>

          <input
            name="bedrooms"
            type="number"
            step="0.5"
            defaultValue={
              unit.bedrooms ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Bathrooms
          </span>

          <input
            name="bathrooms"
            type="number"
            step="0.5"
            defaultValue={
              unit.bathrooms ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Parking
          </span>

          <input
            name="parking_count"
            type="number"
            defaultValue={
              unit.parking_count ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Carpet area
          </span>

          <input
            name="carpet_area_sqft"
            type="number"
            step="0.01"
            defaultValue={
              unit.carpet_area_sqft ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Built-up area
          </span>

          <input
            name="builtup_area_sqft"
            type="number"
            step="0.01"
            defaultValue={
              unit.builtup_area_sqft ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Super built-up area
          </span>

          <input
            name="super_builtup_area_sqft"
            type="number"
            step="0.01"
            defaultValue={
              unit.super_builtup_area_sqft ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Balcony area
          </span>

          <input
            name="balcony_area_sqft"
            type="number"
            step="0.01"
            defaultValue={
              unit.balcony_area_sqft ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Asking price
          </span>

          <input
            name="asking_price"
            type="number"
            step="0.01"
            defaultValue={
              unit.asking_price ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Price / sq.ft
          </span>

          <input
            name="price_per_sqft"
            type="number"
            step="0.01"
            defaultValue={
              unit.price_per_sqft ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Save unit
      </button>
    </form>
  )
}