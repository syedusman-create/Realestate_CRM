import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LeadCreateForm } from '@/components/leads/lead-create-form'
import { getLeadCreateUsers } from '@/lib/crm/leads/create-actions'

export const metadata = {
  title: 'Create Lead',
}

export default async function CreateLeadPage() {
  const context = await getLeadCreateUsers()

  if (!context.ok || !context.currentUserId) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <h1 className="text-lg font-semibold text-foreground">
            Unable to create a lead
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {context.message ??
              'Your account could not be prepared for lead creation.'}
          </p>

          <div className="mt-5">
            <Link
              href="/dashboard/leads"
              className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to leads
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold-dark">
            <UserPlus className="size-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/leads"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Leads
              </Link>

              <span className="text-muted-foreground/50">
                /
              </span>

              <span className="text-sm text-foreground">
                Create
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Create a new lead
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Add a prospect to your workspace and start managing the
              relationship from one place.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/leads"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to leads
        </Link>
      </header>

      <LeadCreateForm
        currentUserId={context.currentUserId}
        canAssign={context.canAssign}
        users={context.users}
      />
    </div>
  )
}