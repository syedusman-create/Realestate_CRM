import Link from 'next/link'

import {
    TASK_PRIORITIES,
    TASK_STATUSES,
    TASK_TYPES,
    taskPriorityLabel,
    taskStatusLabel,
    taskTypeLabel,
    type TaskListFilters,
} from '@/lib/crm/tasks/types'

type TaskFiltersProps = {
    filters: TaskListFilters
    users: Array<{
        id: string
        full_name: string
    }>
}

export function TaskFilters({
    filters,
    users,
}: TaskFiltersProps) {
    const buildUrl = (
        changes: Partial<TaskListFilters>,
    ) => {
        const next = {
            ...filters,
            ...changes,
        }

        const params = new URLSearchParams()

        if (next.q) {
            params.set('q', next.q)
        }

        if (next.status !== 'all') {
            params.set('status', next.status)
        }

        if (next.taskType !== 'all') {
            params.set('taskType', next.taskType)
        }

        if (next.priority !== 'all') {
            params.set('priority', next.priority)
        }

        if (next.assignedTo !== 'all') {
            params.set('assignedTo', next.assignedTo)
        }

        if (next.scope !== 'all') {
            params.set('scope', next.scope)
        }

        return `/dashboard/tasks?${params.toString()}`
    }

    const scopes: Array<{
        value: TaskListFilters['scope']
        label: string
    }> = [
            {
                value: 'all',
                label: 'All',
            },
            {
                value: 'mine',
                label: 'Mine',
            },
            {
                value: 'unassigned',
                label: 'Unassigned',
            },
        ]

    return (
        <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex flex-wrap gap-2">
                {scopes.map((scope) => (
                    <Link
                        key={scope.value}
                        href={buildUrl({
                            scope: scope.value,
                        })}
                        className={[
                            'rounded-md border px-3 py-1.5 text-sm transition-colors',
                            filters.scope === scope.value
                                ? 'border-brand-gold bg-brand-gold text-brand-navy font-semibold shadow-sm hover:bg-brand-gold-dark'
                                : 'bg-background text-foreground hover:bg-muted',
                        ].join(' ')}
                    >
                        {scope.label}
                    </Link>
                ))}
            </div>

            <form
                method="get"
                className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"
            >
                <input
                    name="q"
                    defaultValue={filters.q}
                    placeholder="Search tasks..."
                    className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <select
                    name="status"
                    defaultValue={filters.status}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">All statuses</option>

                    {TASK_STATUSES.map((status) => (
                        <option
                            key={status}
                            value={status}
                        >
                            {taskStatusLabel(status)}
                        </option>
                    ))}
                </select>

                <select
                    name="taskType"
                    defaultValue={filters.taskType}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">All task types</option>

                    {TASK_TYPES.map((type) => (
                        <option
                            key={type}
                            value={type}
                        >
                            {taskTypeLabel(type)}
                        </option>
                    ))}
                </select>

                <select
                    name="priority"
                    defaultValue={filters.priority}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">All priorities</option>

                    {TASK_PRIORITIES.map((priority) => (
                        <option
                            key={priority}
                            value={priority}
                        >
                            {taskPriorityLabel(priority)}
                        </option>
                    ))}
                </select>

                <select
                    name="assignedTo"
                    defaultValue={filters.assignedTo}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">
                        All assignees
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

                <div className="flex gap-2 md:col-span-2 lg:col-span-5">
                    <button
                        type="submit"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        Apply filters
                    </button>

                    <Link
                        href="/dashboard/tasks"
                        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                        Reset
                    </Link>
                </div>
            </form>
        </div>
    )
}