import Link from 'next/link'
import { createCampaign } from '../actions'

export default function NewCampaignPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <Link className="back-link" href="/dashboard/dialer">← Dialer</Link>
          <div className="eyebrow">CAMPAIGN ADMIN</div>
          <h1>Create campaign</h1>
          <p className="muted">Define the queue rules first. Audience loading happens after the campaign is created.</p>
        </div>
      </div>

      <form className="panel form-grid" action={createCampaign}>
        <label>Campaign name<input name="name" required placeholder="September hot leads" /></label>
        <label>Dialing mode<select name="dialing_mode" defaultValue="assisted"><option value="assisted">Assisted</option><option value="automatic">Automatic (native transport required)</option></select></label>
        <label>Status<select name="status" defaultValue="draft"><option value="draft">Draft</option><option value="running">Running</option><option value="paused">Paused</option></select></label>
        <label>Maximum attempts<input name="max_attempts" type="number" min="1" max="20" defaultValue="3" /></label>
        <label>Retry interval (minutes)<input name="retry_after_minutes" type="number" min="1" max="43200" defaultValue="60" /></label>
        <label>Description<textarea name="description" rows={4} placeholder="Purpose, audience, script context…" /></label>
        <div className="form-actions"><Link className="button secondary" href="/dashboard/dialer">Cancel</Link><button className="button" type="submit">Create campaign</button></div>
      </form>
    </main>
  )
}
