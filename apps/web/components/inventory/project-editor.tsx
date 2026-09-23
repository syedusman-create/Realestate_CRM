'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import {
  createProject,
  updateProject,
} from '@/lib/crm/inventory/project-actions'
import {
  EMPTY_PROJECT_ACTION_STATE,
  PROJECT_STATUSES,
  PROPERTY_CATEGORIES,
  PROPERTY_TYPES,
  formatProjectStatus,
  formatPropertyCategory,
  formatPropertyType,
  type InventoryDeveloper,
  type InventoryProject,
} from '@/lib/crm/inventory/project-types'

type Props = {
  project?: InventoryProject
  developers: InventoryDeveloper[]
}

export function ProjectEditor({
  project,
  developers,
}: Props) {
  const action = project
    ? updateProject.bind(null, project.id)
    : createProject

  const [state, formAction, pending] = useActionState(
    action,
    EMPTY_PROJECT_ACTION_STATE,
  )

  return (
    <form
      action={formAction}
      className="space-y-8"
    >
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

      <section className="space-y-5 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Project identity
          </h2>
          <p className="text-sm text-muted-foreground">
            Basic information used throughout the CRM.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Project name
            </span>
            <input
              name="name"
              defaultValue={project?.name ?? ''}
              required
              className="h-9 w-full rounded-md border bg-background px-3"
              placeholder="Prestige Residence"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Slug
            </span>
            <input
              name="slug"
              defaultValue={project?.slug ?? ''}
              className="h-9 w-full rounded-md border bg-background px-3"
              placeholder="prestige-residence"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Developer
            </span>
            <select
              name="developer_id"
              defaultValue={
                project?.developer_id ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              <option value="">
                No developer
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
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Property category
            </span>
            <select
              name="property_category"
              defaultValue={
                project?.property_category ??
                'primary_sale'
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              {PROPERTY_CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {formatPropertyCategory(category)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Property type
            </span>
            <select
              name="property_type"
              defaultValue={
                project?.property_type ??
                'apartment'
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              {PROPERTY_TYPES.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {formatPropertyType(type)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Project status
            </span>
            <select
              name="status"
              defaultValue={
                project?.status ?? 'upcoming'
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              {PROJECT_STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatProjectStatus(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              RERA number
            </span>
            <input
              name="rera_number"
              defaultValue={
                project?.rera_number ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Location
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-sm md:col-span-2">
            <span className="font-medium">
              Address line 1
            </span>
            <input
              name="address_line_1"
              defaultValue={
                project?.address_line_1 ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm md:col-span-2">
            <span className="font-medium">
              Address line 2
            </span>
            <input
              name="address_line_2"
              defaultValue={
                project?.address_line_2 ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">City</span>
            <input
              name="city"
              defaultValue={project?.city ?? ''}
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">State</span>
            <input
              name="state"
              defaultValue={project?.state ?? ''}
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Postal code
            </span>
            <input
              name="postal_code"
              defaultValue={
                project?.postal_code ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Location ID
            </span>
            <input
              name="location_id"
              defaultValue={
                project?.location_id ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Latitude
            </span>
            <input
              name="latitude"
              type="number"
              step="any"
              defaultValue={
                project?.latitude ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Longitude
            </span>
            <input
              name="longitude"
              type="number"
              step="any"
              defaultValue={
                project?.longitude ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Project scale
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Land area (sq.ft)
            </span>
            <input
              name="land_area_sqft"
              type="number"
              step="any"
              defaultValue={
                project?.land_area_sqft ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Total units
            </span>
            <input
              name="total_units"
              type="number"
              defaultValue={
                project?.total_units ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Total towers
            </span>
            <input
              name="total_towers"
              type="number"
              defaultValue={
                project?.total_towers ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Total floors
            </span>
            <input
              name="total_floors"
              type="number"
              defaultValue={
                project?.total_floors ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Dates & pricing
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Launch date
            </span>
            <input
              name="launch_date"
              type="date"
              defaultValue={
                project?.launch_date ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Possession date
            </span>
            <input
              name="possession_date"
              type="date"
              defaultValue={
                project?.possession_date ?? ''
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
                project?.price_min ?? ''
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
                project?.price_max ?? ''
              }
              className="h-9 w-full rounded-md border bg-background px-3"
            />
          </label>
        </div>
      </section>

      <section className="space-y-5 rounded-lg border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Description
          </h2>
        </div>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">
            Description
          </span>
          <textarea
            name="description"
            defaultValue={
              project?.description ?? ''
            }
            rows={5}
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">
            Highlights
          </span>
          <textarea
            name="highlights"
            defaultValue={
              project?.highlights ?? ''
            }
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {pending
            ? 'Saving...'
            : project
              ? 'Save project'
              : 'Create project'}
        </button>

        <Link
          href={
            project
              ? `/dashboard/inventory/projects/${project.id}`
              : '/dashboard/inventory/projects'
          }
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}