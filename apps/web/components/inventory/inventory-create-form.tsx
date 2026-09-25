'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createUnit,
  type CreateUnitState,
} from '@/app/dashboard/inventory/actions'
import {
  UNIT_STATUSES,
  type Project,
  type ProjectConfiguration,
  type ProjectPhase,
  type ProjectTower,
} from '@/lib/crm/inventory/types'

type Props = {
  projects: Project[]
  phases: ProjectPhase[]
  towers: ProjectTower[]
  configurations: ProjectConfiguration[]
  initialProjectId: string
}

const initialState: CreateUnitState = {
  ok: true,
  message: '',
}

export function InventoryCreateForm({
  projects,
  phases,
  towers,
  configurations,
  initialProjectId,
}: Props) {
  const router = useRouter()

  const [state, formAction, pending] =
    useActionState(
      createUnit,
      initialState,
    )

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState(initialProjectId)

  const [selectedPhaseId, setSelectedPhaseId] =
    useState('')

  useEffect(() => {
    if (state.ok && state.unitId) {
      router.push(
        `/dashboard/inventory/${state.unitId}`,
      )
    }
  }, [router, state])

  const visiblePhases = useMemo(
    () =>
      selectedProjectId
        ? phases.filter(
            (phase) =>
              phase.project_id ===
              selectedProjectId,
          )
        : [],
    [phases, selectedProjectId],
  )

  const visibleTowers = useMemo(
    () =>
      selectedPhaseId
        ? towers.filter(
            (tower) =>
              tower.phase_id ===
              selectedPhaseId,
          )
        : [],
    [towers, selectedPhaseId],
  )

  const visibleConfigurations =
    useMemo(
      () =>
        selectedProjectId
          ? configurations.filter(
              (configuration) =>
                configuration.project_id ===
                selectedProjectId,
            )
          : [],
      [
        configurations,
        selectedProjectId,
      ],
    )

  return (
    <form
      action={formAction}
      className="space-y-8 rounded-lg border bg-card p-6"
    >
      {state.message && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            state.ok
              ? 'bg-muted/30'
              : 'border-destructive/40 bg-destructive/5 text-destructive'
          }`}
        >
          {state.message}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">
            Property hierarchy
          </h2>

          <p className="text-sm text-muted-foreground">
            Identify exactly where this unit
            belongs.
          </p>
        </div>

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
              <option value="">
                Select project
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

              {visiblePhases.map((phase) => (
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
              disabled={!selectedPhaseId}
              className="h-9 w-full rounded-md border bg-background px-3 disabled:opacity-50"
            >
              <option value="">
                No tower
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
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Unit number
            </span>

            <input
              name="unit_number"
              placeholder="e.g. A-1204"
              className="h-9 w-full rounded-md border bg-background px-3"
              required
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Floor
            </span>

            <input
              name="floor_number"
              type="number"
              placeholder="e.g. 12"
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Configuration
            </span>

            <select
              name="configuration_id"
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              <option value="">
                No configuration
              </option>

              {visibleConfigurations.map(
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
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">
            Unit details
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Status
            </span>

            <select
              name="status"
              defaultValue="available"
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
              Bedrooms
            </span>

            <input
              name="bedrooms"
              type="number"
              step="0.5"
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
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Facing
            </span>

            <input
              name="facing"
              placeholder="East"
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
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">
            Areas & pricing
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Carpet area
            </span>

            <input
              name="carpet_area_sqft"
              type="number"
              step="0.01"
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
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">
            Optional listing
          </h2>

          <p className="text-sm text-muted-foreground">
            Leave listing type empty if this unit
            should remain inventory-only.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Listing type
            </span>

            <select
              name="listing_type"
              defaultValue=""
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              <option value="">
                No listing
              </option>

              <option value="primary_sale">
                Primary sale
              </option>

              <option value="resale">
                Resale
              </option>

              <option value="rent">
                Rent
              </option>

              <option value="lease">
                Lease
              </option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Listing status
            </span>

            <select
              name="listing_status"
              defaultValue="draft"
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              <option value="draft">
                Draft
              </option>

              <option value="active">
                Active
              </option>

              <option value="reserved">
                Reserved
              </option>

              <option value="under_offer">
                Under offer
              </option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Listing asking price
            </span>

            <input
              name="listing_asking_price"
              type="number"
              step="0.01"
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Rent
            </span>

            <input
              name="rent_amount"
              type="number"
              step="0.01"
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Deposit
            </span>

            <input
              name="deposit_amount"
              type="number"
              step="0.01"
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Maintenance
            </span>

            <input
              name="maintenance_amount"
              type="number"
              step="0.01"
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={() =>
            router.push(
              '/dashboard/inventory',
            )
          }
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending
            ? 'Creating...'
            : 'Create property'}
        </button>
      </div>
    </form>
  )
}