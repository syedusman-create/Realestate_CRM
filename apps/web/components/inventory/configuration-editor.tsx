'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import {
  createConfiguration,
  updateConfiguration,
} from '@/lib/crm/inventory/configuration-actions'
import {
  EMPTY_CONFIGURATION_ACTION_STATE,
  type InventoryConfiguration,
} from '@/lib/crm/inventory/project-types'

type Props = {
  projectId: string
  configuration?: InventoryConfiguration
}

export function ConfigurationEditor({
  projectId,
  configuration,
}: Props) {
  const action = configuration
    ? updateConfiguration.bind(
        null,
        configuration.id,
        projectId,
      )
    : createConfiguration

  const [state, formAction, pending] =
    useActionState(
      action,
      EMPTY_CONFIGURATION_ACTION_STATE,
    )

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-lg border bg-card p-6"
    >
      {!configuration && (
        <input
          type="hidden"
          name="project_id"
          value={projectId}
        />
      )}

      {state.message && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            state.ok
              ? 'bg-muted/30'
              : 'border-destructive/30 text-destructive'
          }`}
        >
          {state.message}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold">
          {configuration
            ? 'Edit configuration'
            : 'Add configuration'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Define the inventory specification and pricing
          range for this configuration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Configuration name
          </span>
          <input
            name="configuration_name"
            required
            defaultValue={
              configuration?.configuration_name ?? ''
            }
            placeholder="3 BHK"
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Bedrooms
          </span>
          <input
            name="bedrooms"
            required
            type="number"
            step="0.5"
            defaultValue={
              configuration?.bedrooms ?? ''
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
              configuration?.bathrooms ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Phase ID
          </span>
          <input
            name="phase_id"
            defaultValue={
              configuration?.phase_id ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Minimum carpet area
          </span>
          <input
            name="carpet_area_min"
            type="number"
            step="any"
            defaultValue={
              configuration?.carpet_area_min ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Maximum carpet area
          </span>
          <input
            name="carpet_area_max"
            type="number"
            step="any"
            defaultValue={
              configuration?.carpet_area_max ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Minimum built-up area
          </span>
          <input
            name="builtup_area_min"
            type="number"
            step="any"
            defaultValue={
              configuration?.builtup_area_min ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Maximum built-up area
          </span>
          <input
            name="builtup_area_max"
            type="number"
            step="any"
            defaultValue={
              configuration?.builtup_area_max ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Minimum super built-up
          </span>
          <input
            name="super_builtup_area_min"
            type="number"
            step="any"
            defaultValue={
              configuration?.super_builtup_area_min ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Maximum super built-up
          </span>
          <input
            name="super_builtup_area_max"
            type="number"
            step="any"
            defaultValue={
              configuration?.super_builtup_area_max ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Minimum price
          </span>
          <input
            name="price_min"
            type="number"
            step="any"
            defaultValue={
              configuration?.price_min ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Maximum price
          </span>
          <input
            name="price_max"
            type="number"
            step="any"
            defaultValue={
              configuration?.price_max ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Minimum price / sq.ft
          </span>
          <input
            name="price_per_sqft_min"
            type="number"
            step="any"
            defaultValue={
              configuration?.price_per_sqft_min ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Maximum price / sq.ft
          </span>
          <input
            name="price_per_sqft_max"
            type="number"
            step="any"
            defaultValue={
              configuration?.price_per_sqft_max ?? ''
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">
            Available units
          </span>
          <input
            name="total_available_units"
            type="number"
            min="0"
            defaultValue={
              configuration?.total_available_units ?? 0
            }
            className="h-9 w-full rounded-md border bg-background px-3"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {pending
            ? 'Saving...'
            : configuration
              ? 'Save configuration'
              : 'Create configuration'}
        </button>

        <Link
          href={`/dashboard/inventory/projects/${projectId}`}
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}