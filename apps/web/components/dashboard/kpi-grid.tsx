import {
  Flame,
  ListTodo,
  PhoneCall,
  Target,
  UsersRound,
} from 'lucide-react'

import KpiCard from './kpi-card'

type DashboardMetrics = {
  total_leads?: number | null
  open_leads?: number | null
  hot_leads?: number | null
  calls_last_24h?: number | null
  overdue_tasks?: number | null
}

type KpiGridProps = {
  metrics: DashboardMetrics | null
}

export default function KpiGrid({
  metrics,
}: KpiGridProps) {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      aria-label="Dashboard metrics"
    >
      <KpiCard
        icon={UsersRound}
        label="Total Leads"
        value={metrics?.total_leads ?? 0}
        description="Across this workspace"
      />

      <KpiCard
        icon={Target}
        label="Open Leads"
        value={metrics?.open_leads ?? 0}
        description="Require attention"
      />

      <KpiCard
        icon={Flame}
        label="Hot Leads"
        value={metrics?.hot_leads ?? 0}
        description="High-priority opportunities"
        emphasis="attention"
      />

      <KpiCard
        icon={PhoneCall}
        label="Calls · 24h"
        value={metrics?.calls_last_24h ?? 0}
        description="Recent calling activity"
      />

      <KpiCard
        icon={ListTodo}
        label="Overdue Tasks"
        value={metrics?.overdue_tasks ?? 0}
        description="Need follow-up"
        emphasis="attention"
      />
    </section>
  )
}