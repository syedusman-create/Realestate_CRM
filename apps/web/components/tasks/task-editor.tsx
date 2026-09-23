'use client'

import { useActionState } from 'react'

import { createTask } from '@/app/dashboard/tasks/actions'
import {
  TASK_PRIORITIES,
  TASK_TYPES,
  taskPriorityLabel,
  taskTypeLabel,
} from '@/lib/crm/tasks/types'

type TaskEditorProps = {
  users: Array<{
    id: string
    full_name: string
  }>

  leads?: Array<{
    id: string
    person_id: string
    person_name: string
  }>
}

const initialState = {
  ok: true,
  message: '',
}

export function TaskEditor({
  users,
  leads = [],
}: TaskEditorProps) {
  const [state, action, pending] = useActionState(
    createTask,
    initialState,
  )

  return (
    <form
      action={action}
      className="space-y-5 rounded-xl border bg-card p-5"
    >
      <div>
        <h2 className="text-lg font-semibold">
          Create task
        </h2>

        <p className="text-sm text-muted-foreground">
          Add a manual CRM action for an agent or follow-up workflow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="title"
            className="text-sm font-medium"
          >
            Title
          </label>

          <input
            id="title"
            name="title"
            required
            maxLength={200}
            placeholder="Call client about property shortlist"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="task_type"
            className="text-sm font-medium"
          >
            Task type
          </label>

          <select
            id="task_type"
            name="task_type"
            defaultValue="custom"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {TASK_TYPES.map((type) => (
              <option
                key={type}
                value={type}
              >
                {taskTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="priority"
            className="text-sm font-medium"
          >
            Priority
          </label>

          <select
            id="priority"
            name="priority"
            defaultValue="normal"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {TASK_PRIORITIES.map(
              (priority) => (
                <option
                  key={priority}
                  value={priority}
                >
                  {taskPriorityLabel(
                    priority,
                  )}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="assigned_to"
            className="text-sm font-medium"
          >
            Assigned to
          </label>

          <select
            id="assigned_to"
            name="assigned_to"
            defaultValue=""
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">
              Unassigned
            </option>

            {users.map((user) => (
              <option
                key={user.id}
                value={user.id}
              >
                {user.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="lead_id"
            className="text-sm font-medium"
          >
            Lead / contact
          </label>

          <select
            id="lead_id"
            name="lead_id"
            defaultValue=""
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">
              No lead
            </option>

            {leads.map((lead) => (
              <option
                key={lead.id}
                value={lead.id}
              >
                {lead.person_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="scheduled_at"
            className="text-sm font-medium"
          >
            Scheduled at
          </label>

          <input
            id="scheduled_at"
            name="scheduled_at"
            type="datetime-local"
            required
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="due_at"
            className="text-sm font-medium"
          >
            Due at
          </label>

          <input
            id="due_at"
            name="due_at"
            type="datetime-local"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="description"
            className="text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Add notes or instructions..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {!state.ok && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.message}
        </div>
      )}

      {state.ok && state.message && (
        <div className="rounded-md border px-3 py-2 text-sm">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {pending
          ? 'Creating...'
          : 'Create task'}
      </button>
    </form>
  )
}