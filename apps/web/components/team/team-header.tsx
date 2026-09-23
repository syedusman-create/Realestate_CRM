import Link from 'next/link'

import { Button, buttonVariants } from '@/components/ui/button'

export function TeamHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Organization
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          Team
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your sales team, roles, workspaces, and
          account status.
        </p>
      </div>

      <Link
        href="/dashboard/tasks?create=1"
        className={buttonVariants()}
      >
        Add team member
      </Link>
    </div>
  )
}