'use client'

import { useActionState } from 'react'
import { updateLead, updateRequirement, reassignLead, type LeadActionState } from './actions'

type Stage = { id: string; name: string; pipeline_id: string }
type Agent = { id: string; full_name: string }
type Requirement = {
  id: string; requirement_type: string; purpose: string | null; bedrooms_min: number | null; bedrooms_max: number | null
  budget_min: number | null; budget_max: number | null; area_min_sqft: number | null; area_max_sqft: number | null
  bathrooms_min: number | null; furnishing: string | null; preferred_facing: string | null; possession_before: string | null
  parking_required: number | null; notes: string | null
}
const initialState: LeadActionState = { ok: true, message: '' }

export default function LeadEditor({ leadId, lead, agents, stages, requirement, canManage }: {
  leadId: string
  lead: { status_id: string | null; assigned_user_id: string | null; priority: string | null; temperature: string | null; notes: string | null; pipeline_id: string | null }
  stages: Stage[]
  agents: Agent[]
  requirement: Requirement | null
  canManage: boolean
}) {
  const [leadState, leadAction, leadPending] = useActionState(updateLead, initialState)
  const [reqState, reqAction, reqPending] = useActionState(updateRequirement, initialState)
  const [assignState, assignAction, assignPending] = useActionState(reassignLead, initialState)

  return <>
    <div className="content-grid">
      <section className="panel">
        <div className="section-title"><div><h2>Lead details</h2><p className="muted small">Update pipeline, temperature, priority and context without changing ownership.</p></div></div>
        <form action={leadAction} className="form-grid">
          <input type="hidden" name="lead_id" value={leadId} />
          <label><span>Pipeline stage</span><select name="status_id" defaultValue={lead.status_id ?? ''}><option value="">No stage</option>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></label>
          <label><span>Temperature</span><select name="temperature" defaultValue={lead.temperature ?? 'cold'}><option value="cold">Cold</option><option value="warm">Warm</option><option value="hot">Hot</option></select></label>
          <label><span>Priority</span><select name="priority" defaultValue={lead.priority ?? 'normal'}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
          <label className="field-wide"><span>Lead notes</span><textarea name="notes" rows={4} defaultValue={lead.notes ?? ''} placeholder="Customer context, objections, preferred projects, next conversation..." /></label>
          <div className="form-actions field-wide"><button className="button" type="submit" disabled={leadPending}>{leadPending ? 'Saving…' : 'Save lead'}</button>{leadState.message ? <span className={leadState.ok ? 'muted small' : 'error-text'}>{leadState.message}</span> : null}</div>
        </form>

        {canManage ? <div className="subsection" style={{ marginTop: 18 }}>
          <div className="subsection-title"><h3>Reassign lead</h3><span className="muted small">Manager/admin only. Previous ownership remains in history.</span></div>
          <form action={assignAction} className="inline-form">
            <input type="hidden" name="lead_id" value={leadId} />
            <select name="assigned_user_id" defaultValue={lead.assigned_user_id ?? ''} aria-label="New owner"><option value="">Select active agent</option>{agents.filter((agent) => agent.id !== lead.assigned_user_id).map((agent) => <option key={agent.id} value={agent.id}>{agent.full_name}</option>)}</select>
            <input name="reason" maxLength={240} placeholder="Reason (optional)" />
            <button className="button secondary" type="submit" disabled={assignPending}>{assignPending ? 'Reassigning…' : 'Reassign'}</button>
          </form>
          {assignState.message ? <p className={assignState.ok ? 'muted small' : 'error-text'}>{assignState.message}</p> : null}
        </div> : null}
      </section>

      <section className="panel">
        <div className="section-title"><div><h2>Buyer requirement</h2><p className="muted small">Keep matching inputs current as customer needs change.</p></div></div>
        <form action={reqAction} className="form-grid">
          <input type="hidden" name="lead_id" value={leadId} />
          <label><span>Type</span><select name="requirement_type" defaultValue={requirement?.requirement_type ?? 'buy'}><option value="buy">Buy</option><option value="rent">Rent</option><option value="resale">Resale</option><option value="lease">Lease</option></select></label>
          <label><span>Purpose</span><select name="purpose" defaultValue={requirement?.purpose ?? ''}><option value="">Not specified</option><option value="end_use">End use</option><option value="investment">Investment</option><option value="rental_income">Rental income</option><option value="resale">Resale</option></select></label>
          <label><span>Bedrooms min</span><input type="number" min="0" step="0.5" name="bedrooms_min" defaultValue={requirement?.bedrooms_min ?? ''} /></label>
          <label><span>Bedrooms max</span><input type="number" min="0" step="0.5" name="bedrooms_max" defaultValue={requirement?.bedrooms_max ?? ''} /></label>
          <label><span>Budget min (₹)</span><input type="number" min="0" name="budget_min" defaultValue={requirement?.budget_min ?? ''} /></label>
          <label><span>Budget max (₹)</span><input type="number" min="0" name="budget_max" defaultValue={requirement?.budget_max ?? ''} /></label>
          <label><span>Area min (sq ft)</span><input type="number" min="0" name="area_min_sqft" defaultValue={requirement?.area_min_sqft ?? ''} /></label>
          <label><span>Area max (sq ft)</span><input type="number" min="0" name="area_max_sqft" defaultValue={requirement?.area_max_sqft ?? ''} /></label>
          <label><span>Bathrooms min</span><input type="number" min="0" step="0.5" name="bathrooms_min" defaultValue={requirement?.bathrooms_min ?? ''} /></label>
          <label><span>Furnishing</span><select name="furnishing" defaultValue={requirement?.furnishing ?? ''}><option value="">Any</option><option value="unfurnished">Unfurnished</option><option value="semi_furnished">Semi furnished</option><option value="fully_furnished">Fully furnished</option></select></label>
          <label><span>Facing</span><input name="preferred_facing" defaultValue={requirement?.preferred_facing ?? ''} placeholder="East, West..." /></label>
          <label><span>Parking required</span><input type="number" min="0" name="parking_required" defaultValue={requirement?.parking_required ?? ''} /></label>
          <label><span>Possession before</span><input type="date" name="possession_before" defaultValue={requirement?.possession_before ?? ''} /></label>
          <label className="field-wide"><span>Requirement notes</span><textarea name="notes" rows={3} defaultValue={requirement?.notes ?? ''} placeholder="Location preferences, floor, amenities, constraints..." /></label>
          <div className="form-actions field-wide"><button className="button" type="submit" disabled={reqPending}>{reqPending ? 'Saving…' : 'Save requirement'}</button>{reqState.message ? <span className={reqState.ok ? 'muted small' : 'error-text'}>{reqState.message}</span> : null}</div>
        </form>
      </section>
    </div>
  </>
}
