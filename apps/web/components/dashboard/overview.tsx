import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import DashboardQuickActions from './dashboard-quick-actions'
import KpiGrid from './kpi-grid'
import PortfolioPulse from './portfolio-pulse'
import SectionHeader from './section-header'
import WorkspaceGrid from './workspace-grid'

type DashboardMetrics = {
  total_leads?: number | null
  open_leads?: number | null
  hot_leads?: number | null
  calls_last_24h?: number | null
  overdue_tasks?: number | null
  active_projects?: number | null
  available_units?: number | null
  active_listings?: number | null
}

type DashboardOverviewProps = {
  metrics: DashboardMetrics | null
  workspaceItems: Array<{
    title: string
    description: string
    href: string
  }>
}

export default function DashboardOverview({
  metrics,
  workspaceItems,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-8 pb-4">
      <section>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold-dark">
              Workspace
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground md:text-4xl">
              Overview
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Monitor sales activity, lead health and property inventory from
              one place.
            </p>
          </div>

          <Link
            href="/dashboard/reports"
            className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-md border border-border/70 bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground lg:self-auto"
          >
            View reports
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-7">
          <KpiGrid metrics={metrics} />
        </div>
      </section>

      <DashboardQuickActions />

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Navigation"
          title="Workspaces"
          description="Jump directly into the areas that need your attention."
        />

        <WorkspaceGrid items={workspaceItems} />
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Inventory"
          title="Portfolio overview"
          description="A quick view of the property inventory currently available to your workspace."
        />

        <PortfolioPulse
          activeProjects={metrics?.active_projects}
          availableUnits={metrics?.available_units}
          activeListings={metrics?.active_listings}
        />
      </section>
    </div>
  )
}