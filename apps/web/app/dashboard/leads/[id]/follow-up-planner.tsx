'use client'

import { useActionState } from 'react'
import { createLeadFollowUp, type FollowUpActionState } from './follow-up-actions'

const initialState: FollowUpActionState = { ok: true, message: '' }

function defaultDateTime() {
  const value = new Date(Date.now() + 60 * 60 * 1000)
  value.setSeconds(0, 0)
  return value.toISOString().slice(0, 16)
}

export default function FollowUpPlanner({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(createLeadFollowUp, initialState)

  return <section className="panel" style={{ marginTop: 14 }}>
    <div className="section-title">
      <div>
        <h2>Schedule next follow-up</h2>
        <p className="muted small">Create a tracked task and keep the lead's next-follow-up timestamp in sync.</p>
      </div>
    </div>
    <form action={action} className="form-grid">
      <input type="hidden" name="lead_id" value={leadId} />
      <label><span>Action</span><select name="task_type" defaultValue="followup"><option value="followup">Follow-up</option><option value="call">Call</option><option value="callback">Callback</option><option value="send_properties">Send properties</option><option value="confirm_viewing">Confirm viewing</option></select></label>
      <label><span>Priority</span><select name="priority" defaultValue="normal"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
      <label className="field-wide"><span>Title</span><input name="title" required maxLength={160} placeholder="Call customer about shortlisted properties" /></label>
      <label><span>Scheduled</span><input name="scheduled_at" type="datetime-local" required defaultValue={defaultDateTime()} /></label>
      <label><span>Due</span><input name="due_at" type="datetime-local" defaultValue={defaultDateTime()} /></label>
      <label className="field-wide"><span>Notes</span><textarea name="description" rows={3} maxLength={1000} placeholder="What should be covered or prepared?" /></label>
      <div className="form-actions field-wide">
        <button className="button" type="submit" disabled={pending}>{pending ? 'Scheduling…' : 'Schedule follow-up'}</button>
        {state.message ? <span className={state.ok ? 'muted small' : 'error-text'}>{state.message}</span> : null}
      </div>
    </form>
  </section>
}
