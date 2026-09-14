import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined

  if (!userId) return <main className="page"><div className="empty">Unauthorized · <Link className="table-link" href="/login">Sign in</Link></div></main>

  const [{ data: profile }, { data: metrics }] = await Promise.all([
    supabase.from('users').select('full_name, role').eq('id', userId).maybeSingle(),
    supabase.from('tenant_dashboard_metrics').select('total_leads, open_leads, hot_leads, calls_last_24h, overdue_tasks, active_projects, available_units, active_listings').maybeSingle(),
  ])

  const cards = [
    ['Open leads', metrics?.open_leads ?? 0, '/dashboard/leads'],
    ['Hot leads', metrics?.hot_leads ?? 0, '/dashboard/leads?temperature=Hot'],
    ['Calls · 24h', metrics?.calls_last_24h ?? 0, '/dashboard/dialer'],
    ['Overdue tasks', metrics?.overdue_tasks ?? 0, '/dashboard/tasks?view=overdue'],
  ] as const

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">RE CRM <span>01</span></div>
        <nav>
          <Link className="nav-link active" href="/dashboard">Overview</Link>
          <Link className="nav-link" href="/dashboard/leads">Leads</Link>
          <Link className="nav-link" href="/dashboard/deals">Opportunities</Link>
          <Link className="nav-link" href="/dashboard/dialer">Dialer</Link>
          <Link className="nav-link" href="/dashboard/tasks">Tasks</Link>
          <Link className="nav-link" href="/dashboard/inventory">Inventory</Link>
          <Link className="nav-link" href="/dashboard/reports">Reports</Link>
        </nav>
        <div className="sidebar-footer"><div className="muted small">SIGNED IN AS</div><strong>{profile?.full_name ?? 'CRM user'}</strong><span className="muted small">{profile?.role ?? 'authenticated'}</span></div>
      </aside>

      <section className="workspace">
        <header className="topbar"><div><div className="eyebrow">OPERATIONS</div><h1>Overview</h1></div><div className="topbar-actions"><Link className="button secondary" href="/dashboard/leads">View leads</Link><Link className="button" href="/dashboard/reports">Reports</Link></div></header>

        <div className="metric-grid">
          {cards.map(([label, value, href]) => <Link className="metric-card" href={href} key={label}><span>{label}</span><strong>{value}</strong></Link>)}
        </div>

        <div className="content-grid">
          <section className="panel"><div className="section-title"><h2>Workspace</h2></div><p className="muted">Leads, opportunities, calling, follow-up execution and property inventory now share the same tenant-aware data model.</p><div className="quick-grid"><Link href="/dashboard/leads" className="quick-card"><strong>Lead workspace</strong><span>Search, qualify, call and follow up.</span></Link><Link href="/dashboard/deals" className="quick-card"><strong>Sales pipeline</strong><span>Track viewing, offers, contracts and closures.</span></Link><Link href="/dashboard/dialer" className="quick-card"><strong>Campaign dialer</strong><span>Claim the next lead without double-assignment.</span></Link><Link href="/dashboard/tasks" className="quick-card"><strong>Task queue</strong><span>Work overdue, today and upcoming follow-ups.</span></Link><Link href="/dashboard/inventory" className="quick-card"><strong>Inventory</strong><span>Browse projects, configurations and unit availability.</span></Link><Link href="/dashboard/reports" className="quick-card"><strong>Reports</strong><span>Measure funnel, agents, sources and revenue pipeline.</span></Link></div></section>
          <section className="panel"><div className="section-title"><h2>Portfolio pulse</h2></div><div className="detail-grid"><div><span>Projects</span><strong>{metrics?.active_projects ?? 0}</strong></div><div><span>Available units</span><strong>{metrics?.available_units ?? 0}</strong></div><div><span>Active listings</span><strong>{metrics?.active_listings ?? 0}</strong></div><div><span>Total leads</span><strong>{metrics?.total_leads ?? 0}</strong></div></div></section>
        </div>
      </section>
    </main>
  )
}
