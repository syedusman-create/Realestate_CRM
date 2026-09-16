import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'
import { CRM_ROLE_LABELS, normalizeCrmRole, type CrmRole } from '../../lib/roles'

const NAVIGATION: Record<CrmRole, { label: string; href: string }[]> = {
  admin: [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Leads', href: '/dashboard/leads' },
    { label: 'Opportunities', href: '/dashboard/deals' },
    { label: 'Dialer', href: '/dashboard/dialer' },
    { label: 'Tasks', href: '/dashboard/tasks' },
    { label: 'Inventory', href: '/dashboard/inventory' },
    { label: 'Reports', href: '/dashboard/reports' },
  ],
  manager: [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Team leads', href: '/dashboard/leads' },
    { label: 'Pipeline', href: '/dashboard/deals' },
    { label: 'Dialer', href: '/dashboard/dialer' },
    { label: 'Follow-ups', href: '/dashboard/tasks' },
    { label: 'Inventory', href: '/dashboard/inventory' },
    { label: 'Reports', href: '/dashboard/reports' },
  ],
  agent: [
    { label: 'My workspace', href: '/dashboard' },
    { label: 'My leads', href: '/dashboard/leads' },
    { label: 'Opportunities', href: '/dashboard/deals' },
    { label: 'My calls', href: '/dashboard/dialer' },
    { label: 'My tasks', href: '/dashboard/tasks' },
    { label: 'Properties', href: '/dashboard/inventory' },
  ],
  broker: [
    { label: 'My workspace', href: '/dashboard' },
    { label: 'Assigned leads', href: '/dashboard/leads' },
    { label: 'Broker opportunities', href: '/dashboard/deals' },
    { label: 'Follow-ups', href: '/dashboard/tasks' },
    { label: 'Property matching', href: '/dashboard/inventory' },
  ],
}

const ROLE_COPY: Record<CrmRole, { eyebrow: string; title: string; description: string }> = {
  admin: {
    eyebrow: 'ADMIN OPERATIONS',
    title: 'Organization overview',
    description: 'Monitor leads, pipeline, calling, follow-up execution and inventory across the organization.',
  },
  manager: {
    eyebrow: 'TEAM OPERATIONS',
    title: 'Team performance',
    description: 'Focus on team pipeline, workloads, follow-ups and the inventory needed to move deals forward.',
  },
  agent: {
    eyebrow: 'SALES DESK',
    title: 'My workspace',
    description: 'Start with your assigned leads, next follow-ups, calls and property matches.',
  },
  broker: {
    eyebrow: 'BROKER DESK',
    title: 'Broker workspace',
    description: 'Work assigned leads, active opportunities, follow-ups and relevant property inventory.',
  },
}

type DashboardMetricSet = {
  openLeads: number
  hotLeads: number
  calls24h: number
  overdueTasks: number
}

function scopedCards(role: CrmRole, metrics: DashboardMetricSet, personal: DashboardMetricSet) {
  if (role === 'admin') {
    return [
      ['Open leads', metrics.openLeads, '/dashboard/leads'],
      ['Hot leads', metrics.hotLeads, '/dashboard/leads?temperature=Hot'],
      ['Calls · 24h', metrics.calls24h, '/dashboard/dialer'],
      ['Overdue tasks', metrics.overdueTasks, '/dashboard/tasks?view=overdue'],
    ] as const
  }

  const prefix = role === 'manager' ? 'Team' : 'My'
  return [
    [`${prefix} open leads`, personal.openLeads, '/dashboard/leads'],
    [`${prefix} hot leads`, personal.hotLeads, '/dashboard/leads?temperature=Hot'],
    [`${prefix} calls · 24h`, personal.calls24h, '/dashboard/dialer'],
    [`${prefix} overdue tasks`, personal.overdueTasks, '/dashboard/tasks?view=overdue'],
  ] as const
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined

  if (!userId) return <main className="page"><div className="empty">Unauthorized · <Link className="table-link" href="/login">Sign in</Link></div></main>

  const [{ data: profile }, { data: metrics }] = await Promise.all([
    supabase.from('users').select('full_name, role, workspace_id').eq('id', userId).maybeSingle(),
    supabase.from('tenant_dashboard_metrics').select('total_leads, open_leads, hot_leads, calls_last_24h, overdue_tasks, active_projects, available_units, active_listings').maybeSingle(),
  ])

  const role = normalizeCrmRole(profile?.role)
  const copy = ROLE_COPY[role]
  const teamScope = role === 'manager' && profile?.workspace_id ? profile.workspace_id : null

  const personal: DashboardMetricSet = role === 'admin'
    ? { openLeads: 0, hotLeads: 0, calls24h: 0, overdueTasks: 0 }
    : await Promise.all([
        teamScope
          ? supabase.from('leads').select('id', { count: 'exact', head: true }).eq('workspace_id', teamScope).is('closed_at', null)
          : supabase.from('leads').select('id', { count: 'exact', head: true }).eq('assigned_user_id', userId).is('closed_at', null),
        teamScope
          ? supabase.from('leads').select('id', { count: 'exact', head: true }).eq('workspace_id', teamScope).eq('temperature', 'hot')
          : supabase.from('leads').select('id', { count: 'exact', head: true }).eq('assigned_user_id', userId).eq('temperature', 'hot'),
        teamScope
          ? supabase.from('calls').select('id', { count: 'exact', head: true }).eq('workspace_id', teamScope).gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          : supabase.from('calls').select('id', { count: 'exact', head: true }).eq('agent_id', userId).gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        teamScope
          ? supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('workspace_id', teamScope).lt('due_at', new Date().toISOString()).neq('status', 'completed')
          : supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('assigned_to', userId).lt('due_at', new Date().toISOString()).neq('status', 'completed'),
      ]).then(([open, hot, calls, tasks]) => ({
        openLeads: open.count ?? 0,
        hotLeads: hot.count ?? 0,
        calls24h: calls.count ?? 0,
        overdueTasks: tasks.count ?? 0,
      }))

  const dashboardMetrics: DashboardMetricSet = {
    openLeads: metrics?.open_leads ?? 0,
    hotLeads: metrics?.hot_leads ?? 0,
    calls24h: metrics?.calls_last_24h ?? 0,
    overdueTasks: metrics?.overdue_tasks ?? 0,
  }
  const cards = scopedCards(role, dashboardMetrics, personal)

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">RE CRM <span>01</span></div>
        <nav>
          {NAVIGATION[role].map(item => <Link className={`nav-link${item.href === '/dashboard' ? ' active' : ''}`} href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
        <div className="sidebar-footer"><div className="muted small">SIGNED IN AS</div><strong>{profile?.full_name ?? 'CRM user'}</strong><span className="muted small">{CRM_ROLE_LABELS[role]}</span></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><div className="eyebrow">{copy.eyebrow}</div><h1>{copy.title}</h1><p className="muted">{copy.description}</p></div>
          <div className="topbar-actions"><Link className="button secondary" href="/dashboard/leads">{role === 'admin' ? 'View leads' : 'Work leads'}</Link><Link className="button" href={role === 'agent' || role === 'broker' ? '/dashboard/tasks' : '/dashboard/reports'}>{role === 'agent' || role === 'broker' ? 'Open tasks' : 'Reports'}</Link></div>
        </header>

        <div className="metric-grid">
          {cards.map(([label, value, href]) => <Link className="metric-card" href={href} key={label}><span>{label}</span><strong>{value}</strong></Link>)}
        </div>

        <div className="content-grid">
          <section className="panel"><div className="section-title"><h2>{role === 'admin' ? 'Organization workspace' : role === 'manager' ? 'Team workspace' : 'Daily workspace'}</h2></div><p className="muted">{copy.description}</p><div className="quick-grid">
            {NAVIGATION[role].slice(1).map(item => <Link href={item.href} className="quick-card" key={item.href}><strong>{item.label}</strong><span>Open the {item.label.toLowerCase()} workspace.</span></Link>)}
          </div></section>
          <section className="panel"><div className="section-title"><h2>{role === 'admin' ? 'Portfolio pulse' : 'Inventory pulse'}</h2></div><div className="detail-grid"><div><span>Projects</span><strong>{metrics?.active_projects ?? 0}</strong></div><div><span>Available units</span><strong>{metrics?.available_units ?? 0}</strong></div><div><span>Active listings</span><strong>{metrics?.active_listings ?? 0}</strong></div><div><span>{role === 'admin' ? 'Total leads' : role === 'manager' ? 'Team open leads' : 'My open leads'}</span><strong>{role === 'admin' ? metrics?.total_leads ?? 0 : personal.openLeads}</strong></div></div></section>
        </div>
      </section>
    </main>
  )
}
