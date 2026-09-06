import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'

const filters = ['All', 'Hot', 'Warm', 'Cold'] as const

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; temperature?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  let query = supabase
    .from('lead_dashboard')
    .select('lead_id, person_id, person_name, phone, email, assigned_user_name, priority, temperature, lead_score, stage_name, next_task_due_at, last_contact_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: leads, error } = await query
  const search = (params.q ?? '').trim().toLowerCase()
  const temperature = params.temperature && filters.includes(params.temperature as (typeof filters)[number]) ? params.temperature.toLowerCase() : 'all'

  const filtered = (leads ?? []).filter((lead) => {
    const matchesSearch = !search || [lead.person_name, lead.phone, lead.email, lead.assigned_user_name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search))
    const matchesTemp = temperature === 'all' || lead.temperature === temperature
    return matchesSearch && matchesTemp
  })

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">LEADS</div>
          <h1>Lead workspace</h1>
          <p className="muted">Every customer, owner, next action, and conversation in one place.</p>
        </div>
        <Link className="button" href="/dashboard/dialer">Open dialer</Link>
      </div>

      <section className="panel filters">
        <form className="search-form" action="/dashboard/leads">
          <input name="q" defaultValue={params.q ?? ''} placeholder="Search name, phone, email, agent" />
          <input type="hidden" name="temperature" value={params.temperature ?? 'All'} />
          <button className="button secondary" type="submit">Search</button>
        </form>
        <div className="chips">
          {filters.map((filter) => (
            <Link key={filter} className={`chip ${(temperature === filter.toLowerCase()) ? 'active' : ''}`} href={`/dashboard/leads?temperature=${filter}${params.q ? `&q=${encodeURIComponent(params.q)}` : ''}`}>{filter}</Link>
          ))}
        </div>
      </section>

      <section className="panel table-wrap">
        {error ? <div className="empty">Unable to load leads: {error.message}</div> : null}
        {!error && filtered.length === 0 ? <div className="empty">No leads match the current filters.</div> : null}
        {filtered.length > 0 ? (
          <table>
            <thead><tr><th>Customer</th><th>Stage</th><th>Temperature</th><th>Score</th><th>Owner</th><th>Next action</th></tr></thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.lead_id}>
                  <td><Link className="table-link" href={`/dashboard/leads/${lead.lead_id}`}>{lead.person_name ?? 'Unknown customer'}</Link><div className="muted small">{lead.phone ?? lead.email ?? 'No contact'} </div></td>
                  <td>{lead.stage_name ?? 'Unqualified'}</td>
                  <td><span className={`badge ${lead.temperature ?? 'cold'}`}>{lead.temperature ?? 'cold'}</span></td>
                  <td>{lead.lead_score ?? '—'}</td>
                  <td>{lead.assigned_user_name ?? 'Unassigned'}</td>
                  <td>{lead.next_task_due_at ? new Date(lead.next_task_due_at).toLocaleString() : 'No task scheduled'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </main>
  )
}
