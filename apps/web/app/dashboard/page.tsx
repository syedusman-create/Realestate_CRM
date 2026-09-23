import DashboardOverview from '@/components/dashboard/overview'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: metrics } = await supabase
    .from('tenant_dashboard_metrics')
    .select(
      'total_leads, open_leads, hot_leads, calls_last_24h, overdue_tasks, active_projects, available_units, active_listings',
    )
    .maybeSingle()

  const workspaceItems = [
    {
      title: 'Lead Workspace',
      description:
        'Review, qualify and follow up with leads.',
      href: '/dashboard/leads',
    },
    {
      title: 'Sales Pipeline',
      description:
        'Track opportunities from qualification to closure.',
      href: '/dashboard/deals',
    },
    {
      title: 'Task Queue',
      description:
        'Stay on top of calls, meetings and follow-ups.',
      href: '/dashboard/tasks',
    },
    {
      title: 'Property Matching',
      description:
        'Find inventory that fits a lead’s requirements.',
      href: '/dashboard/recommendations',
    },
    {
      title: 'Inventory',
      description:
        'Explore projects, configurations and available units.',
      href: '/dashboard/inventory',
    },
  ]

  return (
    <DashboardOverview
      metrics={metrics}
      workspaceItems={workspaceItems}
    />
  )
}