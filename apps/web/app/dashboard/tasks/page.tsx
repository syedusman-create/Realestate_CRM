import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import CompleteTaskButton from './complete-task-button'

const tabs = [
  ['all', 'All'],
  ['overdue', 'Overdue'],
  ['today', 'Today'],
  ['upcoming', 'Upcoming'],
] as const

function taskTone(status: string, dueAt: string | null, scheduledAt: string) {
  if (status !== 'pending' && status !== 'in_progress') return 'cold'
  const now = Date.now()
  if (dueAt && new Date(dueAt).getTime() < now) return 'hot'
  if (new Date(scheduledAt).toDateString() === new Date().toDateString()) return 'warm'
  return 'cold'
}

function formatDate(value: string | null) {
  if (!value) return 'No due date'
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const params = await searchParams
  const view = params.view && tabs.some(([key]) => key === params.view) ? params.view : 'all'
  const supabase = await createClient()

  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub as string | undefined
  if (!userId) return <main className="page"><div className="empty">Unauthorized · <Link className="table-link" href="/login">Sign in</Link></div></main>

  const now = new Date()
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0)
  const startOfTomorrow = new Date(startOfToday); startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)
  const endOfUpcoming = new Date(startOfToday); endOfUpcoming.setDate(endOfUpcoming.getDate() + 14)

  let query = supabase
    .from('tasks')
    .select('id, lead_id, person_id, task_type, title, description, priority, scheduled_at, due_at, status, assigned_to')
    .in('status', ['pending', 'in_progress'])
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('scheduled_at', { ascending: true })
    .limit(150)

  if (view === 'overdue') query = query.lt('due_at', now.toISOString())
  if (view === 'today') query = query.gte('scheduled_at', startOfToday.toISOString()).lt('scheduled_at', startOfTomorrow.toISOString())
  if (view === 'upcoming') query = query.gte('scheduled_at', startOfTomorrow.toISOString()).lt('scheduled_at', endOfUpcoming.toISOString())

  const { data: tasks, error } = await query
  const leadIds = [...new Set((tasks ?? []).map((task) => task.lead_id).filter(Boolean))] as string[]
  const personIds = [...new Set((tasks ?? []).map((task) => task.person_id).filter(Boolean))] as string[]
  const [{ data: leads }, { data: people }] = await Promise.all([
    leadIds.length ? supabase.from('leads').select('id, assigned_user_id, temperature').in('id', leadIds) : Promise.resolve({ data: [] as { id: string; assigned_user_id: string | null; temperature: string }[] }),
    personIds.length ? supabase.from('people').select('id, display_name').in('id', personIds) : Promise.resolve({ data: [] as { id: string; display_name: string }[] }),
  ])

  const leadMap = new Map((leads ?? []).map((lead) => [lead.id, lead]))
  const peopleMap = new Map((people ?? []).map((person) => [person.id, person.display_name]))
  const mine = (tasks ?? []).filter((task) => !task.assigned_to || task.assigned_to === userId || leadMap.get(task.lead_id ?? '')?.assigned_user_id === userId)

  const counts = {
    all: mine.length,
    overdue: mine.filter((task) => task.due_at && new Date(task.due_at).getTime() < Date.now()).length,
    today: mine.filter((task) => new Date(task.scheduled_at) >= startOfToday && new Date(task.scheduled_at) < startOfTomorrow).length,
    upcoming: mine.filter((task) => new Date(task.scheduled_at) >= startOfTomorrow && new Date(task.scheduled_at) < endOfUpcoming).length,
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">EXECUTION</div>
          <h1>Tasks</h1>
          <p className="muted">Your follow-up queue, callbacks, property shares and viewing actions.</p>
        </div>
        <Link className="button secondary" href="/dashboard">Overview</Link>
      </div>

      <section className="panel">
        <div className="chips">
          {tabs.map(([key, label]) => <Link key={key} className={`chip ${view === key ? 'active' : ''}`} href={`/dashboard/tasks?view=${key}`}>{label} · {counts[key]}</Link>)}
        </div>

        {error ? <div className="empty">Unable to load tasks: {error.message}</div> : null}
        {!error && !mine.length ? <div className="empty"><strong>Nothing in this queue.</strong><p className="muted">Completed and cancelled tasks disappear from the execution queue automatically.</p></div> : null}

        {mine.length ? <div style={{ marginTop: 18 }}>
          {mine.map((task) => {
            const lead = task.lead_id ? leadMap.get(task.lead_id) : null
            const personName = task.person_id ? peopleMap.get(task.person_id) : null
            const tone = taskTone(task.status, task.due_at, task.scheduled_at)
            return <div className="task-row" key={task.id}>
              <div className="task-main">
                <div className="row-between">
                  <div className="actions-inline">
                    <span className={`badge ${tone}`}>{task.task_type.replaceAll('_', ' ')}</span>
                    <span className="badge">{task.priority}</span>
                    {lead?.temperature ? <span className={`badge ${lead.temperature === 'hot' ? 'hot' : lead.temperature === 'warm' ? 'warm' : 'cold'}`}>{lead.temperature}</span> : null}
                  </div>
                  <span className="muted small">{formatDate(task.due_at ?? task.scheduled_at)}</span>
                </div>
                <strong>{task.title}</strong>
                <div className="muted small">{personName ?? 'Customer'}{task.description ? ` · ${task.description}` : ''}</div>
              </div>
              <div className="actions-inline">
                {task.lead_id ? <Link className="button secondary" href={`/dashboard/leads/${task.lead_id}`}>Open lead</Link> : null}
                <CompleteTaskButton taskId={task.id} />
              </div>
            </div>
          })}
        </div> : null}
      </section>
    </main>
  )
}
