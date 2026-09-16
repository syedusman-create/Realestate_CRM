import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import { ensureDefaultSequence, runDueAutomation } from './actions'

export default async function FollowUpsPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) return <main className="page"><div className="empty">Unauthorized · <Link className="table-link" href="/login">Sign in</Link></div></main>

  const { data: profile } = await supabase.from('users').select('role, workspace_id').eq('id', userId).maybeSingle()
  const role = (profile?.role ?? '').toLowerCase()
  const canManage = ['admin', 'manager', 'administrator', 'sales_manager', 'team_lead', 'owner', 'super_admin'].includes(role)
  if (!canManage) return <main className="page"><div className="notice">Manager access is required to configure follow-up automation.</div></main>

  const db = supabase as any
  const { data: sequences, error } = await db.from('followup_sequences').select('id, name, description, is_default, is_active, created_at').order('created_at', { ascending: false })
  const sequenceIds = (sequences ?? []).map((item: { id: string }) => item.id)
  const { data: steps } = sequenceIds.length ? await db.from('followup_sequence_steps').select('id, sequence_id, step_order, delay_minutes, task_type, channel, title, priority, is_active').in('sequence_id', sequenceIds).order('step_order') : { data: [] }

  return <main className="page">
    <div className="page-header">
      <div><div className="eyebrow">AUTOMATION</div><h1>Follow-up automation</h1><p className="muted">Manage lead cadences and generate the next execution tasks from due sequence steps.</p></div>
      <div className="header-actions"><Link className="button secondary" href="/dashboard/tasks">Task queue</Link><Link className="button secondary" href="/dashboard/leads">Leads</Link></div>
    </div>

    <section className="panel">
      <div className="section-title"><div><h2>Automation controls</h2><p className="muted small">The database engine is tenant-scoped and uses row locking so due enrollments are not generated twice by concurrent workers.</p></div></div>
      <div className="actions-inline" style={{ marginTop: 12 }}>
        <form action={ensureDefaultSequence}><button className="button" type="submit">Create default sequence</button></form>
        <form action={runDueAutomation}><button className="button secondary" type="submit">Run due automation now</button></form>
      </div>
      <p className="muted small" style={{ marginTop: 10 }}>Scheduled execution still requires a Supabase Cron job; this page provides a safe manual trigger while that scheduler is configured.</p>
    </section>

    <section className="panel" style={{ marginTop: 14 }}>
      <div className="section-title"><h2>Sequences</h2><span className="muted small">{sequences?.length ?? 0} configured</span></div>
      {error ? <div className="empty">Unable to load sequences: {error.message}</div> : null}
      {!error && !sequences?.length ? <div className="empty">No sequence exists yet. Create the default sequence to start.</div> : null}
      {sequences?.map((sequence: any) => {
        const sequenceSteps = (steps ?? []).filter((step: any) => step.sequence_id === sequence.id)
        return <article className="panel" style={{ marginTop: 12 }} key={sequence.id}>
          <div className="row-between"><div><div className="actions-inline"><span className={`badge ${sequence.is_active ? 'warm' : 'cold'}`}>{sequence.is_active ? 'active' : 'inactive'}</span>{sequence.is_default ? <span className="badge">default</span> : null}</div><h3>{sequence.name}</h3><p className="muted small">{sequence.description ?? 'No description'}</p></div><span className="muted small">{sequenceSteps.length} steps</span></div>
          {sequenceSteps.length ? <div style={{ marginTop: 12 }}>{sequenceSteps.map((step: any) => <div className="list-row" key={step.id}><div><strong>Step {step.step_order} · {step.title}</strong><div className="muted small">{step.task_type.replaceAll('_', ' ')} · {step.channel} · {step.priority}</div></div><span className="muted small">{step.delay_minutes === 0 ? 'Immediately' : `${Math.round(step.delay_minutes / 60)}h delay`}</span></div>)}</div> : <div className="empty" style={{ marginTop: 12 }}>No active steps.</div>}
        </article>
      })}
    </section>
  </main>
}
