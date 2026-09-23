'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Input } from '@/components/ui/input'

import { TEAM_ROLES } from '@/lib/crm/team/types'

export function TeamFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search =
    searchParams.get('search') ?? ''

  const role =
    searchParams.get('role') ?? 'all'

  const status =
    searchParams.get('status') ?? 'all'

  function updateParams(
    updates: Record<
      string,
      string
    >,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      )

    for (const [
      key,
      value,
    ] of Object.entries(updates)) {
      if (
        !value ||
        value === 'all'
      ) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }

    router.push(
      `${pathname}?${params.toString()}`,
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center">
      <Input
        value={search}
        placeholder="Search team members..."
        onChange={(event) =>
          updateParams({
            search:
              event.target.value,
          })
        }
        className="md:max-w-sm"
      />

      <select
        value={role}
        onChange={(event) =>
          updateParams({
            role: event.target.value,
          })
        }
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="all">
          All roles
        </option>

        {TEAM_ROLES.map(
          (teamRole) => (
            <option
              key={teamRole}
              value={teamRole}
            >
              {teamRole.replaceAll(
                '_',
                ' ',
              )}
            </option>
          ),
        )}
      </select>

      <select
        value={status}
        onChange={(event) =>
          updateParams({
            status:
              event.target.value,
          })
        }
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="all">
          All statuses
        </option>

        <option value="active">
          Active
        </option>

        <option value="inactive">
          Inactive
        </option>
      </select>
    </div>
  )
}