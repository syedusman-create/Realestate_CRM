import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'

const money = (value: number) => {
  if (!value) return '₹0'
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) return <main className="page"><div className="notice">Please sign in to view reports.</div></main>

  const db = supabase as any
  const [{ data: metrics }, { data: agents }, { data: stages }, { data: sources }, { data: deals }] = await Promise.all([
    db.from('tenant_dashboard_metrics').select('total_leads, open_leads, hot_leads, calls_last_24h, overdue_tasks, active_projects, available_units, active_listings').maybeSingle(),
    db.from('agent_sales_performance').select('*').order('weighted_pipeline_value', { ascending: false }),
    db.from('sales_funnel_performance').select('*').order('display_order'),
    db.from('source_sales_performance').select('*').order('won_value', { ascending: false }),
    db.from('deal_pipeline').select('deal_id, deal_name, person_name, deal_value, expected_close_date, probability, stage_probability, status, stage_name, owner_name').eq('status', 'open').order('expected_close_date', { ascending: true }).limit(12),
  ])

  const agentRows = agents ?? []
  const stageRows = stages ?? []
  const sourceRows = sources ?? []
  const dealRows = deals ?? []
  const totalPipeline = agentRows.reduce((sum: number, row: any) => sum + Number(row.pipeline_value ?? 0), 0)
  const weightedPipeline = agentRows.reduce((sum: number, row: any) => sum + Number(row.weighted_pipeline_value ?? 0), 0)
  const wonValue = agentRows.reduce((sum: number, row: any) => sum + Number(row.won_value ?? 0), 0)
  const wonDeals = agentRows.reduce((sum: number, row: any) => sum + Number(row.won_opportunities ?? 0), 0)
  const opportunityCount = agentRows.reduce((sum: number, row: any) => sum + Number(row.opportunities ?? 0), 0)
  const maxAgentPipeline = Math.max(...agentRows.map((row: any) => Number(row.pipeline_value ?? 0)), 1)
  const maxStage = Math.max(...stageRows.map((row: any) => Number(row.opportunities ?? 0)), 1)

  return <main className="page">
    <div className="page-header"><div><div className="eyebrow">MANAGEMENT INTELLIGENCE</div><h1>Reports</h1><p className="muted">Understand where revenue is sitting, who is converting, and which channels are producing opportunities.</p></div><Link className="button secondary" href="/dashboard/deals">Open pipeline</Link></div>

    <div className="metric-grid">
      <div className="metric-card"><span>Total leads</span><strong>{metrics?.total_leads ?? 0}</strong></div>
      <div className="metric-card"><span>Open pipeline</span><strong>{money(totalPipeline)}</strong></div>
      <div className="metric-card"><span>Weighted pipeline</span><strong>{money(weightedPipeline)}</strong></div>
      <div className="metric-card"><span>Won value</span><strong>{money(wonValue)}</strong></div>
    </div>

    <div className="content-grid">
      <section className="panel"><div className="section-title"><div><h2>Funnel</h2><p className="muted small">Opportunity count and weighted value by sales stage.</p></div></div>{stageRows.length ? stageRows.map((stage: any) => <div className="report-row" key={stage.stage_id ?? stage.stage_name}><div className="report-label"><strong>{stage.stage_name ?? 'Unstaged'}</strong><span className="muted small">{stage.stage_type ?? ''} · {stage.opportunities ?? 0} opportunities</span></div><div className="report-bar"><span style={{ width: `${Math.max(3, Number(stage.opportunities ?? 0) / maxStage * 100)}%` }} /></div><div className="report-value"><strong>{money(Number(stage.value ?? 0))}</strong><span className="muted small">{Number(stage.win_probability ?? 0)}% target</span></div></div>) : <div className="empty">No opportunity data yet.</div>}</section>

      <section className="panel"><div className="section-title"><div><h2>Sales team</h2><p className="muted small">Pipeline ownership and conversion activity.</p></div></div>{agentRows.length ? agentRows.slice(0, 8).map((agent: any) => { const pipeline = Number(agent.pipeline_value ?? 0); const winRate = Number(agent.opportunities ?? 0) ? Number(agent.won_opportunities ?? 0) / Number(agent.opportunities) * 100 : 0; return <div className="report-row compact" key={agent.agent_id ?? agent.agent_name}><div className="report-label"><strong>{agent.agent_name}</strong><span className="muted small">{agent.leads ?? 0} leads · {agent.opportunities ?? 0} opps · {agent.won_opportunities ?? 0} won</span></div><div className="report-bar"><span style={{ width: `${Math.max(3, pipeline / maxAgentPipeline * 100)}%` }} /></div><div className="report-value"><strong>{money(pipeline)}</strong><span className="muted small">{winRate.toFixed(0)}% win rate</span></div></div> }) : <div className="empty">No agent data yet.</div>}</section>
    </div>

    <div className="content-grid">
      <section className="panel"><div className="section-title"><div><h2>Lead source performance</h2><p className="muted small">From lead generation through booked revenue.</p></div></div>{sourceRows.length ? sourceRows.slice(0, 10).map((source: any) => <div className="list-row" key={`${source.platform}-${source.source_name}`}><div><strong>{source.source_name}</strong><div className="muted small">{source.platform} · {source.leads} leads · {source.opportunities} opportunities</div></div><div className="deal-summary"><strong>{money(Number(source.won_value ?? 0))}</strong><span className="muted small">{source.won_opportunities ?? 0} won</span></div></div>) : <div className="empty">No source attribution data yet.</div>}</section>
      <section className="panel"><div className="section-title"><div><h2>Pipeline health</h2><p className="muted small">Current open opportunities ordered by expected close.</p></div><span className="badge warm">{opportunityCount} total opps</span></div>{dealRows.length ? dealRows.map((deal: any) => <div className="list-row" key={deal.deal_id}><div><strong>{deal.deal_name}</strong><div className="muted small"><Link className="table-link" href={`/dashboard/leads/${deal.lead_id ?? ''}`}>{deal.person_name}</Link> · {deal.stage_name ?? 'No stage'} · {deal.owner_name ?? 'Unassigned'}</div></div><div className="deal-summary"><strong>{money(Number(deal.deal_value ?? 0))}</strong><span className="muted small">{deal.expected_close_date ? `Close ${deal.expected_close_date}` : 'No close date'} · {deal.probability ?? deal.stage_probability ?? 0}%</span></div></div>) : <div className="empty">No open opportunities.</div>}</section>
    </div>

    <section className="panel" style={{ marginTop: 14 }}><div className="section-title"><div><h2>Executive snapshot</h2><p className="muted small">A compact operating view for the current tenant.</p></div></div><div className="detail-grid"><div><span>Hot leads</span><strong>{metrics?.hot_leads ?? 0}</strong></div><div><span>Calls · 24h</span><strong>{metrics?.calls_last_24h ?? 0}</strong></div><div><span>Overdue tasks</span><strong>{metrics?.overdue_tasks ?? 0}</strong></div><div><span>Active projects</span><strong>{metrics?.active_projects ?? 0}</strong></div><div><span>Available units</span><strong>{metrics?.available_units ?? 0}</strong></div><div><span>Won opportunities</span><strong>{wonDeals}</strong></div></div></section>
  </main>
}
