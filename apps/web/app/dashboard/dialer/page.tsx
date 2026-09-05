import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { claimNextDialerItem, recordDialerDisposition, skipDialerItem, startCampaign, stopDialerSession } from './actions'

const outcomeLabels = {
  connected: 'Connected',
  not_connected: 'Not connected',
  busy: 'Busy',
  no_answer: 'No answer',
  wrong_number: 'Wrong number',
  voicemail: 'Voicemail',
  callback_requested: 'Callback requested',
} as const

export default async function DialerPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session: sessionId } = await searchParams
  const supabase = await createClient()

  const [{ data: campaigns, error }, activeSession] = await Promise.all([
    supabase
      .from('dialer_campaigns')
      .select('id, name, description, status, dialing_mode, max_attempts, allow_callbacks, allow_voicemail, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    sessionId
      ? supabase.from('dialer_sessions').select('id, campaign_id, status, current_queue_item_id, started_at').eq('id', sessionId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  let currentLead: { id: string; display_name: string; phone: string; lead_id: string; attempt_count: number; status: string } | null = null
  if (activeSession.data?.current_queue_item_id) {
    const { data: item } = await supabase
      .from('dialer_campaign_leads')
      .select('id, lead_id, person_id, phone_id, status, attempt_count')
      .eq('id', activeSession.data.current_queue_item_id)
      .maybeSingle()
    if (item) {
      const [{ data: person }, { data: phone }] = await Promise.all([
        supabase.from('people').select('display_name').eq('id', item.person_id).maybeSingle(),
        supabase.from('person_phones').select('phone_number, normalized_phone, is_whatsapp').eq('id', item.phone_id).maybeSingle(),
      ])
      if (person && phone) {
        currentLead = {
          id: item.id,
          display_name: person.display_name,
          phone: phone.phone_number,
          lead_id: item.lead_id,
          attempt_count: item.attempt_count,
          status: item.status,
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
          <Link className="button secondary" href="/dashboard/leads">Leads</Link>
          {activeSession.data ? <form action={stopDialerSession.bind(null, activeSession.data.id)}><button className="button danger" type="submit">Stop session</button></form> : null}
        </div>
      </div>

      {activeSession.data?.status === 'running' ? (
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
              <form className="dialer-disposition" action={recordDialerDisposition.bind(null, activeSession.data.id, currentLead.id)}>
                <label>
                  Disposition
                  <select name="outcome" defaultValue="connected" required>
                    {Object.entries(outcomeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label>
                  Notes
                  <textarea name="notes" rows={3} placeholder="Capture what happened, objections, follow-up context…" />
                </label>
                <div className="actions-inline">
                  <button className="button" type="submit">Save & clear</button>
                  <button className="button secondary" type="submit" formAction={skipDialerItem.bind(null, activeSession.data.id, currentLead.id)}>Skip lead</button>
                </div>
              </form>
              <form className="next-lead-form" action={async () => {
                'use server'
                await claimNextDialerItem(activeSession.data!.campaign_id, activeSession.data!.id)
              }}>
                <button className="link-button" type="submit">Claim next available lead →</button>
              </form>
            </>
          ) : (
            <div className="empty">
              <strong>Queue is clear.</strong>
              <p className="muted">No eligible leads are available right now. Leads with a future retry time will become claimable automatically.</p>
            </div>
          )}
        </section>
      ) : null}

      <section className="panel">
        <div className="section-title"><h2>Campaigns</h2><span className="muted small">{campaigns?.length ?? 0} available</span></div>
        {error ? <div className="empty">Unable to load campaigns: {error.message}</div> : null}
        {!error && !campaigns?.length ? <div className="empty">No dialer campaigns yet. Create one from the campaign admin flow.</div> : null}
        {campaigns?.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} activeSessionId={activeSession.data?.id ?? null} />)}
      </section>
    </main>
  )
}

async function CampaignCard({ campaign, activeSessionId }: { campaign: { id: string; name: string; description: string | null; status: string; dialing_mode: string; max_attempts: number; allow_callbacks: boolean; allow_voicemail: boolean; created_at: string }; activeSessionId: string | null }) {
  const supabase = await createClient()
  const [{ count: queued }, { count: active }, { count: completed }] = await Promise.all([
    supabase.from('dialer_campaign_leads').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'queued'),
    supabase.from('dialer_campaign_leads').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'dialing'),
    supabase.from('dialer_campaign_leads').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'completed'),
  ])

  return (
    <article className="campaign-card">
      <div>
        <div className="row-between"><h3>{campaign.name}</h3><span className={`badge ${campaign.status === 'running' ? 'warm' : 'cold'}`}>{campaign.status}</span></div>
        <p className="muted">{campaign.description ?? 'No description'}</p>
        <div className="stats-inline"><span><strong>{queued ?? 0}</strong> queued</span><span><strong>{active ?? 0}</strong> dialing</span><span><strong>{completed ?? 0}</strong> completed</span><span>Mode: <strong>{campaign.dialing_mode}</strong></span></div>
      </div>
      {campaign.status === 'running' && !activeSessionId ? (
        <form action={startCampaign.bind(null, campaign.id)}><button className="button" type="submit">Start session</button></form>
      ) : campaign.status !== 'running' ? (
        <button className="button secondary" type="button" disabled>{campaign.status}</button>
      ) : (
        <span className="muted small">Session already active</span>
      )}
    </article>
  )
}
