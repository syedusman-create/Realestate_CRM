import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'

export function TaskHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Manage follow-ups, calls, viewings, documents, and other CRM actions.
        </p>
      </div>

      <Link
        href="/dashboard/tasks?create=1"
        className={buttonVariants()}
      >
        Create task
      </Link>
    </div>
  )
}