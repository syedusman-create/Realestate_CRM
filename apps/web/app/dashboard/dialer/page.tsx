import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { claimNextForSession, recordDialerDisposition, skipDialerItem, startCampaign, stopDialerSession } from './actions'

const outcomeLabels = {
  connected: 'Connected',
  not_connected: 'Not connected',
  busy: 'Busy',
  no_answer: 'No answer',
  wrong_number: 'Wrong number',
  voicemail: 'Voicemail',
  callback_requested: 'Callback requested',
} as const

type Session = { id: string; campaign_id: string; status: string; current_queue_item_id: string | null; started_at: string }

export default async function DialerPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session: sessionId } = await searchParams
  const supabase = await createClient()

  const [{ data: campaigns, error }, { data: roleData }] = await Promise.all([
    supabase
      .from('dialer_campaigns')
      .select('id, name, description, status, dialing_mode, max_attempts, allow_callbacks, allow_voicemail, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.rpc('crm_current_user_role'),
  ])
  const canManage = ['admin', 'manager', 'super_admin', 'owner'].includes(String(roleData ?? '').toLowerCase())

  let activeSession: Session | null = null
  if (sessionId) {
    const { data } = await supabase
      .from('dialer_sessions')
      .select('id, campaign_id, status, current_queue_item_id, started_at')
      .eq('id', sessionId)
      .maybeSingle()
    activeSession = data as Session | null
  }

  let currentLead: { id: string; display_name: string; phone: string; lead_id: string; attempt_count: number } | null = null
  if (activeSession?.current_queue_item_id) {
    const { data: item } = await supabase
      .from('dialer_campaign_leads')
      .select('id, lead_id, person_id, phone_id, attempt_count')
      .eq('id', activeSession.current_queue_item_id)
      .maybeSingle()
    if (item) {
      const [{ data: person }, { data: phone }] = await Promise.all([
        supabase.from('people').select('display_name').eq('id', item.person_id).maybeSingle(),
        supabase.from('person_phones').select('phone_number').eq('id', item.phone_id).maybeSingle(),
      ])
      if (person && phone) {
        currentLead = {
          id: item.id,
          display_name: person.display_name,
          phone: phone.phone_number,
          lead_id: item.lead_id,
          attempt_count: item.attempt_count,
        }
      }
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">CALLING</div>
          <h1>Campaign dialer</h1>
          <p className="muted">Queue-aware assisted calling with atomic lead claiming and canonical CRM call history.</p>
        </div>
        <div className="actions-inline">
          {canManage ? <Link className="button secondary" href="/dashboard/dialer/admin/new">Create campaign</Link> : null}
          <Link className="button secondary" href="/dashboard/leads">Leads</Link>
          {activeSession?.status === 'running' ? (
            <form action={stopDialerSession.bind(null, activeSession.id)}><button className="button danger" type="submit">Stop session</button></form>
          ) : null}
        </div>
      </div>

      {activeSession?.status === 'running' ? (
        <section className="panel dialer-focus">
          <div className="section-title"><h2>Current call</h2><span className="badge warm">Session active</span></div>
          {currentLead ? (
            <>
              <div className="dialer-contact">
                <div>
                  <div className="eyebrow">NEXT LEAD · ATTEMPT {currentLead.attempt_count}</div>
                  <h2>{currentLead.display_name}</h2>
                  <p className="phone-number">{currentLead.phone}</p>
                  <p className="muted small">Lead ID {currentLead.lead_id}</p>
                </div>
                <div className="actions-inline">
                  <a className="button" href={`tel:${currentLead.phone}`}>Call</a>
                  <Link className="button secondary" href={`/dashboard/leads/${currentLead.lead_id}`}>Open lead</Link>
                </div>
              </div>
              <form className="dialer-disposition" action={recordDialerDisposition.bind(null, activeSession.id, currentLead.id)}>
                <label>Disposition<select name="outcome" defaultValue="connected" required>{Object.entries(outcomeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label>Notes<textarea name="notes" rows={3} placeholder="Capture objections, follow-up context, or call notes…" /></label>
                <div className="actions-inline"><button className="button" type="submit">Save disposition</button><button className="button secondary" type="submit" formAction={skipDialerItem.bind(null, activeSession.id, currentLead.id)}>Skip lead</button></div>
              </form>
              <form className="next-lead-form" action={claimNextForSession.bind(null, activeSession.id, activeSession.campaign_id)}><button className="link-button" type="submit">Claim next available lead →</button></form>
            </>
          ) : <div className="empty"><strong>Queue is clear.</strong><p className="muted">No eligible leads are available right now. Leads with a future retry time become claimable automatically.</p></div>}
        </section>
      ) : null}

      <section className="panel">
        <div className="section-title"><h2>Campaigns</h2><span className="muted small">{campaigns?.length ?? 0} available</span></div>
        {error ? <div className="empty">Unable to load campaigns: {error.message}</div> : null}
        {!error && !campaigns?.length ? <div className="empty">No dialer campaigns yet. Managers can create one and load eligible leads.</div> : null}
        {campaigns?.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} activeSessionId={activeSession?.id ?? null} canManage={canManage} />)}
      </section>
    </main>
  )
}

async function CampaignCard({ campaign, activeSessionId, canManage }: { campaign: { id: string; name: string; description: string | null; status: string; dialing_mode: string; max_attempts: number; allow_callbacks: boolean; allow_voicemail: boolean; created_at: string }; activeSessionId: string | null; canManage: boolean }) {
  const supabase = await createClient()
  const [{ count: queued }, { count: dialing }, { count: completed }] = await Promise.all([
    supabase.from('dialer_campaign_leads').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'queued'),
    supabase.from('dialer_campaign_leads').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'dialing'),
    supabase.from('dialer_campaign_leads').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'completed'),
  ])

  return (
    <article className="campaign-card">
      <div>
        <div className="row-between"><h3>{campaign.name}</h3><span className={`badge ${campaign.status === 'running' ? 'warm' : 'cold'}`}>{campaign.status}</span></div>
        <p className="muted">{campaign.description ?? 'No description'}</p>
        <div className="stats-inline"><span><strong>{queued ?? 0}</strong> queued</span><span><strong>{dialing ?? 0}</strong> dialing</span><span><strong>{completed ?? 0}</strong> completed</span><span>Mode: <strong>{campaign.dialing_mode}</strong></span></div>
      </div>
      <div className="actions-inline">
        {canManage ? <Link className="button secondary" href={`/dashboard/dialer/admin/${campaign.id}`}>Manage</Link> : null}
        {campaign.status === 'running' && !activeSessionId ? <form action={startCampaign.bind(null, campaign.id)}><button className="button" type="submit">Start session</button></form> : campaign.status !== 'running' ? <button className="button secondary" type="button" disabled>{campaign.status}</button> : <span className="muted small">Session already active</span>}
      </div>
    </article>
  )
}
