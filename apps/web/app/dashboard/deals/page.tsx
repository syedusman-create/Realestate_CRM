import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'

const statusTabs = ['all', 'open', 'won', 'lost', 'paused'] as const

type DealRow = { deal_id: string; lead_id: string; deal_name: string; deal_value: number | null; expected_close_date: string | null; probability: number | null; stage_probability: number | null; status: string; stage_name: string | null; owner_name: string | null; person_name: string }

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams
  const status = statusTabs.includes(params.status as (typeof statusTabs)[number]) ? params.status : 'all'
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) return <main className="page"><div className="notice">Please sign in to view the sales pipeline.</div></main>
  const db = supabase as any
  let query = db.from('deal_pipeline').select('*').order('updated_at', { ascending: false }).limit(200)
  if (status !== 'all') query = query.eq('status', status)
  const { data: deals, error } = await query as { data: DealRow[] | null; error: { message: string } | null }
  const rows = deals ?? []
  const openValue = rows.filter((d) => d.status === 'open').reduce((sum, d) => sum + Number(d.deal_value ?? 0), 0)
  const weightedValue = rows.filter((d) => d.status === 'open').reduce((sum, d) => sum + Number(d.deal_value ?? 0) * Number(d.probability ?? d.stage_probability ?? 0) / 100, 0)
  return <main className="page">
    <div className="page-header"><div><div className="eyebrow">SALES PIPELINE</div><h1>Opportunities</h1><p className="muted">Move qualified leads through viewing, negotiation and closure.</p></div></div>
    {error ? <div className="notice">Unable to load opportunities: {error.message}</div> : null}
    <div className="metric-grid"><div className="metric-card"><span>Opportunities</span><strong>{rows.length}</strong></div><div className="metric-card"><span>Open value</span><strong>{formatMoney(openValue)}</strong></div><div className="metric-card"><span>Weighted pipeline</span><strong>{formatMoney(weightedValue)}</strong></div><div className="metric-card"><span>Won</span><strong>{rows.filter((d) => d.status === 'won').length}</strong></div></div>
    <nav className="tabs">{statusTabs.map((tab) => <Link key={tab} className={status === tab ? 'tab active' : 'tab'} href={tab === 'all' ? '/dashboard/deals' : `/dashboard/deals?status=${tab}`}>{tab[0].toUpperCase() + tab.slice(1)}</Link>)}</nav>
    <section className="panel"><div className="section-title"><h2>Pipeline</h2><span className="muted small">{rows.length} records</span></div>{rows.length ? rows.map((deal) => <div className="list-row" key={deal.deal_id}><div><div className="row-between"><strong>{deal.deal_name}</strong><span className={`badge ${deal.status === 'won' ? 'hot' : deal.status === 'lost' ? 'cold' : 'warm'}`}>{deal.status}</span></div><div className="muted small"><Link href={`/dashboard/leads/${deal.lead_id}`}>{deal.person_name}</Link> · {deal.stage_name ?? 'No stage'} · {deal.owner_name ?? 'Unassigned'}</div></div><div className="deal-summary"><strong>{formatMoney(Number(deal.deal_value ?? 0))}</strong><span className="muted small">{deal.expected_close_date ? `Close ${deal.expected_close_date}` : 'No close date'} · {deal.probability ?? deal.stage_probability ?? 0}%</span></div></div>) : <div className="empty">No opportunities in this view yet.</div>}</section>
  </main>
}
function formatMoney(value: number) { if (!value) return '₹0'; if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`; if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`; return `₹${value.toLocaleString('en-IN')}` }
