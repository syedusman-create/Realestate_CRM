'use client'

import { useActionState } from 'react'
import { enrollLeadFollowUp, updateLeadFollowUpStatus, type FollowUpAutomationState } from './automation-actions'

const initial: FollowUpAutomationState = { ok: true, message: '' }

function formatNext(value: string | null) {
  return value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled'
}

export default function FollowUpAutomation({ leadId, enrollment }: { leadId: string; enrollment: { id: string; sequence_id: string; status: string; current_step: number; next_run_at: string | null } | null }) {
  const [enrollState, enrollAction, enrollPending] = useActionState(enrollLeadFollowUp, initial)
  const [statusState, statusAction, statusPending] = useActionState(updateLeadFollowUpStatus, initial)
  const state = statusState.message ? statusState : enrollState

  return <section className="panel" style={{ marginTop: 14 }}>
    <div className="section-title">
      <div><h2>Follow-up automation</h2><p className="muted small">Enroll this lead in the default cadence and let the automation engine create tracked tasks as steps become due.</p></div>
      {enrollment ? <span className={`badge ${enrollment.status === 'active' ? 'warm' : enrollment.status === 'completed' ? 'hot' : 'cold'}`}>{enrollment.status}</span> : null}
    </div>
    {enrollment ? <>
      <div className="stats-inline" style={{ marginTop: 12 }}><span>Step {enrollment.current_step}</span><span>Next run · {formatNext(enrollment.next_run_at)}</span></div>
      <div className="actions-inline" style={{ marginTop: 12 }}>
        {enrollment.status === 'active' ? <form action={statusAction}><input type="hidden" name="lead_id" value={leadId} /><input type="hidden" name="enrollment_id" value={enrollment.id} /><input type="hidden" name="status" value="paused" /><button className="button secondary" type="submit" disabled={statusPending}>Pause</button></form> : <form action={statusAction}><input type="hidden" name="lead_id" value={leadId} /><input type="hidden" name="enrollment_id" value={enrollment.id} /><input type="hidden" name="status" value="active" /><button className="button secondary" type="submit" disabled={statusPending}>Resume</button></form>}
        {enrollment.status !== 'cancelled' && enrollment.status !== 'completed' ? <form action={statusAction}><input type="hidden" name="lead_id" value={leadId} /><input type="hidden" name="enrollment_id" value={enrollment.id} /><input type="hidden" name="status" value="cancelled" /><button className="button secondary" type="submit" disabled={statusPending}>Cancel</button></form> : null}
      </div>
    </> : <form action={enrollAction}><input type="hidden" name="lead_id" value={leadId} /><button className="button" type="submit" disabled={enrollPending}>{enrollPending ? 'Enrolling…' : 'Enroll in default cadence'}</button></form>}
    {state.message ? <p className={state.ok ? 'muted small' : 'error-text'} style={{ marginTop: 10 }}>{state.message}</p> : null}
  </section>
}
