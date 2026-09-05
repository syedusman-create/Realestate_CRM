import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { claimNextDialerItem, startDialerSession } from './actions'

export default async function DialerPage() {
  const supabase = await createClient()
  const { data: campaigns, error } = await supabase
    .from('dialer_campaigns')
    .select('id, name, description, status, dialing_mode, max_attempts, allow_callbacks, allow_voicemail, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">CALLING</div>
          <h1>Campaign dialer</h1>
          <p className="muted">Queue-aware assisted calling with atomic lead claiming and CRM call history.</p>
        </div>
        <Link className="button secondary" href="/dashboard/leads">Leads</Link>
      </div>

      <section className="panel">
        <div className="section-title"><h2>Campaigns</h2><span className="muted small">{campaigns?.length ?? 0} available</span></div>
        {error ? <div className="empty">Unable to load campaigns: {error.message}</div> : null}
        {!error && !campaigns?.length ? <div className="empty">No dialer campaigns yet. Create one from the campaign API/admin flow before dialing.</div> : null}
        {campaigns?.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
      </section>
    </main>
  )
}

async function CampaignCard({ campaign }: { campaign: { id: string; name: string; description: string | null; status: string; dialing_mode: string; max_attempts: number; allow_callbacks: boolean; allow_voicemail: boolean; created_at: string } }) {
  const supabase = await createClient()
  const [{ count: queued }, { count: active }, { count: completed }] = await Promise.all([
    supabase.from('dialer_campaign_leads').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'queued'),
    supabase.from('dialer_campaign_leads').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'in_progress'),
    supabase.from('dialer_campaign_leads').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'completed'),
  ])

  return (
    <article className="campaign-card">
      <div>
        <div className="row-between"><h3>{campaign.name}</h3><span className={`badge ${campaign.status === 'active' ? 'warm' : 'cold'}`}>{campaign.status}</span></div>
        <p className="muted">{campaign.description ?? 'No description'}</p>
        <div className="stats-inline"><span><strong>{queued ?? 0}</strong> queued</span><span><strong>{active ?? 0}</strong> active</span><span><strong>{completed ?? 0}</strong> completed</span><span>Mode: <strong>{campaign.dialing_mode}</strong></span></div>
      </div>
      <form action={startCampaign.bind(null, campaign.id)}><button className="button" type="submit" disabled={campaign.status !== 'active'}>{campaign.status === 'active' ? 'Start session' : 'Not active'}</button></form>
    </article>
  )
}

async function startCampaign(campaignId: string) {
  const sessionId = await startDialerSession(campaignId)
  const item = await claimNextDialerItem(campaignId, sessionId)
  return { sessionId, item }
}
