import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'
import { refreshRecommendations } from './actions'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('lead_dashboard')
    .select('*')
    .eq('lead_id', id)
    .maybeSingle()
  if (!lead) notFound()

  const [{ data: phones }, { data: calls }, { data: tasks }, { data: requirements }, { data: recommendations, error: recommendationError }] = await Promise.all([
    supabase.from('person_phones').select('id, phone_number, normalized_phone, is_primary, is_whatsapp').eq('person_id', lead.person_id ?? ''),
    supabase.from('calls').select('id, direction, started_at, ended_at, duration_seconds, outcome, disposition, sub_disposition, notes').eq('lead_id', id).order('started_at', { ascending: false }).limit(12),
    supabase.from('tasks').select('id, task_type, title, scheduled_at, due_at, status, priority').eq('lead_id', id).order('scheduled_at', { ascending: true }).limit(12),
    supabase.from('requirements').select('id, requirement_type, purpose, bedrooms_min, bedrooms_max, budget_min, budget_max, area_min_sqft, area_max_sqft, bathrooms_min, furnishing, preferred_facing, possession_before, notes').eq('lead_id', id).eq('is_active', true).order('created_at', { ascending: false }).limit(1),
    supabase.rpc('get_property_recommendations', { p_lead_id: id, p_limit: 6 }),
  ])

  const phone = phones?.find((item) => item.is_primary) ?? phones?.[0]
  const requirement = requirements?.[0]

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <Link className="back-link" href="/dashboard/leads">← Leads</Link>
          <div className="eyebrow">LEAD DETAIL</div>
          <h1>{lead.person_name ?? 'Unknown customer'}</h1>
          <p className="muted">{lead.phone ?? lead.email ?? 'No contact information'} · {lead.assigned_user_name ?? 'Unassigned'}</p>
        </div>
        <div className="header-actions">
          {phone?.phone_number ? <a className="button" href={`tel:${phone.phone_number}`}>Call</a> : null}
          {phone?.normalized_phone ? <a className="button secondary" href={`https://wa.me/${phone.normalized_phone.replace(/^\+/, '')}`}>WhatsApp</a> : null}
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card"><span>Temperature</span><strong className="capitalize">{lead.temperature ?? 'cold'}</strong></div>
        <div className="metric-card"><span>Lead score</span><strong>{lead.lead_score ?? '—'}</strong></div>
        <div className="metric-card"><span>Pipeline</span><strong>{lead.stage_name ?? 'Unqualified'}</strong></div>
        <div className="metric-card"><span>Last contact</span><strong>{lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleDateString() : 'Never'}</strong></div>
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="section-title"><h2>Requirement</h2></div>
          {requirement ? (
            <div className="detail-grid">
              <div><span>Type</span><strong>{requirement.requirement_type}</strong></div>
              <div><span>Purpose</span><strong>{requirement.purpose ?? '—'}</strong></div>
              <div><span>Bedrooms</span><strong>{requirement.bedrooms_min ?? '—'}{requirement.bedrooms_max && requirement.bedrooms_max !== requirement.bedrooms_min ? `–${requirement.bedrooms_max}` : ''}</strong></div>
              <div><span>Budget</span><strong>{formatMoney(requirement.budget_min, requirement.budget_max)}</strong></div>
              <div><span>Area</span><strong>{formatRange(requirement.area_min_sqft, requirement.area_max_sqft)} sq ft</strong></div>
              <div><span>Bathrooms</span><strong>{requirement.bathrooms_min ?? '—'}+</strong></div>
              <div><span>Furnishing</span><strong>{requirement.furnishing ?? 'Any'}</strong></div>
              <div><span>Facing</span><strong>{requirement.preferred_facing ?? 'Any'}</strong></div>
            </div>
          ) : <div className="empty">No active requirement recorded.</div>}
        </section>

        <section className="panel">
          <div className="section-title"><h2>Next actions</h2><Link className="text-button" href="/dashboard/dialer">Dialer</Link></div>
          {tasks?.length ? tasks.map((task) => <div className="list-row" key={task.id}><div><strong>{task.title}</strong><div className="muted small">{task.task_type} · {task.priority}</div></div><div className="muted small">{new Date(task.scheduled_at).toLocaleString()}</div></div>) : <div className="empty">No tasks scheduled.</div>}
        </section>
      </div>

      <section className="panel" style={{ marginTop: 14 }}>
        <div className="section-title"><div><h2>Property matches</h2><p className="muted small">Ranked from the buyer requirement using the CRM matching engine.</p></div><form action={refreshRecommendations.bind(null, id)}><button className="button secondary" type="submit">Refresh matches</button></form></div>
        {recommendationError ? <div className="empty">Matching is unavailable: {recommendationError.message}</div> : null}
        {recommendations?.length ? (
          <div className="recommendation-grid">
            {recommendations.map((match) => <article className="recommendation-card" key={`${match.project_id}-${match.unit_id ?? match.rank}`}>
              <div className="row-between"><span className="badge warm">#{match.rank} · {Number(match.total_score).toFixed(0)}%</span><span className="muted small">{match.unit_number ?? 'Unit matched'}</span></div>
              <h3>{match.project_name}</h3>
              <p className="muted small">{match.developer_name ?? 'Developer'} · {match.location_name ?? 'Location pending'}</p>
              <div className="stats-inline"><span>{match.bedrooms ?? '—'} BHK</span><span>{match.area_sqft ? `${Number(match.area_sqft).toLocaleString('en-IN')} sq ft` : 'Area —'}</span><span>{formatMoney(match.price, match.price)}</span></div>
              <p className="muted small">{formatReasons(match.reasons)}</p>
            </article>)}
          </div>
        ) : <div className="empty">No property matches yet. Load inventory and refresh this section to rank suitable units.</div>}
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <div className="section-title"><h2>Call history</h2><span className="muted small">{calls?.length ?? 0} recent</span></div>
        {calls?.length ? calls.map((call) => <div className="list-row" key={call.id}><div><strong>{call.direction === 'outbound' ? 'Outbound' : 'Inbound'} · {call.outcome.replaceAll('_', ' ')}</strong><div className="muted small">{call.disposition ?? call.sub_disposition ?? call.notes ?? 'No disposition notes'}</div></div><div className="muted small">{new Date(call.started_at).toLocaleString()}</div></div>) : <div className="empty">No calls recorded yet.</div>}
      </section>
    </main>
  )
}

function formatMoney(min: number | null, max: number | null) {
  if (min == null && max == null) return 'Any'
  const money = (value: number) => value >= 10000000 ? `₹${(value / 10000000).toFixed(2)} Cr` : value >= 100000 ? `₹${(value / 100000).toFixed(1)} L` : `₹${value.toLocaleString('en-IN')}`
  if (min != null && max != null && min !== max) return `${money(min)} – ${money(max)}`
  return money(min ?? max ?? 0)
}

function formatRange(min: number | null, max: number | null) {
  if (min == null && max == null) return 'Any'
  if (min != null && max != null && min !== max) return `${min.toLocaleString('en-IN')}–${max.toLocaleString('en-IN')}`
  return (min ?? max ?? 0).toLocaleString('en-IN')
}

function formatReasons(reasons: unknown) {
  if (!reasons || typeof reasons !== 'object') return 'Matched against saved requirement.'
  return Object.entries(reasons as Record<string, unknown>).slice(0, 3).map(([key, value]) => `${key.replaceAll('_', ' ')}: ${String(value)}`).join(' · ')
}
