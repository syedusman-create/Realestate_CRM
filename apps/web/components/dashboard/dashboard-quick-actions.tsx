import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  FileSpreadsheet,
  Plus,
  UserPlus,
} from 'lucide-react'

type QuickAction = {
  title: string
  description: string
  href: string
  icon: typeof Plus
}

const actions: QuickAction[] = [
  {
    title: 'Add lead',
    description: 'Create a new prospect',
    href: '/dashboard/leads/new',
    icon: UserPlus,
  },
  {
    title: 'Add property',
    description: 'Create inventory',
    href: '/dashboard/inventory/projects/new',
    icon: Building2,
  },
  {
    title: 'Import data',
    description: 'Bring in CRM records',
    href: '/dashboard/imports',
    icon: FileSpreadsheet,
  },
]

export default function DashboardQuickActions() {
  return (
    <section aria-label="Quick actions">
      <div className="rounded-xl border border-white/10 bg-brand-navy p-5 text-brand-ivory shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold-light">
              Quick actions
            </p>

            <h2 className="col-span-2 text-lg font-semibold">
              Keep the workspace moving
            </h2>

            <p className="mt-1 text-sm text-brand-ivory/60">
              Jump directly into a common sales operation.
            </p>
          </div>

          <Link
            href="/dashboard/leads"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-gold-light transition-colors hover:text-brand-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            View workspace
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-lg border border-white/10 bg-white/[0.055] p-4 transition-colors hover:bg-white/[0.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className="size-4 text-brand-gold-light"
                    aria-hidden="true"
                  />

                  <ArrowRight
                    className="size-3.5 text-brand-ivory/30 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-gold-light"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-4 text-sm font-semibold text-brand-ivory">
                  {action.title}
                </p>

                <p className="mt-1 text-xs text-brand-ivory/50">
                  {action.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}