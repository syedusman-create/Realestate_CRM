import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/server'
import { populateCampaign } from '../actions'

export default async function CampaignAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: campaign }, { data: queue }] = await Promise.all([
    supabase.from('dialer_campaigns').select('id, name, description, status, dialing_mode, max_attempts, retry_after_minutes, created_at').eq('id', id).maybeSingle(),
    supabase.from('dialer_campaign_leads').select('id, lead_id, person_id, status, attempt_count, priority, last_attempt_at').eq('campaign_id', id).order('priority', { ascending: false }).order('created_at', { ascending: false }).limit(100),
  ])
  if (!campaign) notFound()

  const peopleIds = [...new Set((queue ?? []).map((item) => item.person_id))]
  const { data: people } = peopleIds.length ? await supabase.from('people').select('id, display_name').in('id', peopleIds) : { data: [] as { id: string; display_name: string }[] }
  const personMap = new Map((people ?? []).map((person) => [person.id, person.display_name]))

  const counts = (queue ?? []).reduce<Record<string, number>>((result, item) => {
    result[item.status] = (result[item.status] ?? 0) + 1
    return result
  }, {})

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <Link className="back-link" href="/dashboard/dialer">← Dialer</Link>
          <div className="eyebrow">CAMPAIGN ADMIN</div>
          <h1>{campaign.name}</h1>
          <p className="muted">{campaign.description ?? 'Configure audience and monitor queue state.'}</p>
        </div>
        <div className="actions-inline"><span className={`badge ${campaign.status === 'running' ? 'warm' : 'cold'}`}>{campaign.status}</span><Link className="button secondary" href="/dashboard/dialer">Back to dialer</Link></div>
      </div>

      <div className="metric-grid">
        <div className="metric-card"><span>Queued</span><strong>{counts.queued ?? 0}</strong></div>
        <div className="metric-card"><span>Dialing</span><strong>{counts.dialing ?? 0}</strong></div>
        <div className="metric-card"><span>Completed</span><strong>{counts.completed ?? 0}</strong></div>
        <div className="metric-card"><span>Total loaded</span><strong>{queue?.length ?? 0}</strong></div>
      </div>

      <section className="panel">
        <div className="section-title"><div><h2>Populate audience</h2><p className="muted small">Only assigned leads with a usable phone are loaded. Existing lead ownership is never changed.</p></div></div>
        <form className="form-grid" action={populateCampaign.bind(null, id)}>
          <label>Temperature<select name="temperature" defaultValue="any"><option value="any">Any</option><option value="hot">Hot</option><option value="warm">Warm</option><option value="cold">Cold</option></select></label>
          <label>Max leads<input name="limit" type="number" min="1" max="5000" defaultValue="100" /></label>
          <label>Queue priority<input name="priority" type="number" min="0" max="100" defaultValue="10" /></label>
          <div className="form-actions"><button className="button primary" type="submit">Load eligible leads</button></div>
        </form>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <div className="section-title"><h2>Campaign queue</h2><span className="muted small">Latest 100</span></div>
        {queue?.length ? <div className="panel table-wrap" style={{ padding: 0, marginTop: 14 }}><table><thead><tr><th>Customer</th><th>Status</th><th>Attempts</th><th>Priority</th><th>Last attempt</th></tr></thead><tbody>{queue.map((item) => <tr key={item.id}><td><Link className="table-link" href={`/dashboard/leads/${item.lead_id}`}>{personMap.get(item.person_id) ?? 'Customer'}</Link><div className="muted small">Lead {item.lead_id}</div></td><td><span className={`badge ${item.status === 'queued' ? 'warm' : 'cold'}`}>{item.status.replaceAll('_', ' ')}</span></td><td>{item.attempt_count}</td><td>{item.priority}</td><td>{item.last_attempt_at ? new Date(item.last_attempt_at).toLocaleString() : 'Never'}</td></tr>)}</tbody></table></div> : <div className="empty">No leads loaded yet. Use the audience form above to populate this campaign.</div>}
      </section>
    </main>
  )
}
