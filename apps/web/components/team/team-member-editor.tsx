'use client'

import {
  useActionState,
  useEffect,
} from 'react'

import {
  createTeamMember,
  updateTeamMember,
} from '@/lib/crm/team/actions'

import {
  TEAM_ROLES,
  type TeamActionState,
  type TeamMember,
} from '@/lib/crm/team/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState: TeamActionState = {
  ok: false,
  message: '',
}

type TeamMemberEditorProps = {
  member?: TeamMember | null
}

export function TeamMemberEditor({
  member = null,
}: TeamMemberEditorProps) {
  const isEditing = member !== null

  const action = isEditing
    ? updateTeamMember
    : createTeamMember

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    action,
    initialState,
  )

  useEffect(() => {
    if (!state.message) {
      return
    }

    window.dispatchEvent(
      new CustomEvent(
        'team-member-action',
        {
          detail: state,
        },
      ),
    )
  }, [state])

  return (
    <div
      id={
        isEditing
          ? undefined
          : 'add-team-member'
      }
      className="rounded-lg border bg-card p-5"
    >
      <div className="mb-5">
        <h2 className="font-semibold">
          {isEditing
            ? 'Edit team member'
            : 'Add team member'}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {isEditing
            ? 'Update the member profile and workspace assignment.'
            : 'Add a team member to the current tenant.'}
        </p>
      </div>

      <form
        action={formAction}
        className="space-y-4"
      >
        {isEditing && (
          <input
            type="hidden"
            name="member_id"
            value={member.id}
          />
        )}

        <div className="space-y-2">
          <label
            htmlFor="full_name"
            className="text-sm font-medium"
          >
            Full name
          </label>

          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={
              member?.full_name ?? ''
            }
            placeholder="e.g. Sales Agent 03"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={
                member?.email ?? ''
              }
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium"
            >
              Phone
            </label>

            <Input
              id="phone"
              name="phone"
              defaultValue={
                member?.phone ?? ''
              }
              placeholder="+91..."
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="role"
              className="text-sm font-medium"
            >
              Role
            </label>

            <select
              id="role"
              name="role"
              defaultValue={
                member?.role ?? 'agent'
              }
              className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
            >
              {TEAM_ROLES.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role.replaceAll(
                      '_',
                      ' ',
                    )}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="workspace_id"
              className="text-sm font-medium"
            >
              Workspace ID
            </label>

            <Input
              id="workspace_id"
              name="workspace_id"
              defaultValue={
                member?.workspace_id ?? ''
              }
              placeholder="Workspace UUID"
            />
          </div>
        </div>

        {state.message && (
          <div
            className={
              state.ok
                ? 'rounded-md border p-3 text-sm'
                : 'rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive'
            }
          >
            {state.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={pending}
        >
          {pending
            ? 'Saving...'
            : isEditing
              ? 'Save changes'
              : 'Add team member'}
        </Button>
      </form>
    </div>
  )
}