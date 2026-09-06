import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'

function money(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; city?: string }> }) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const status = params.status?.trim() ?? ''
  const city = params.city?.trim() ?? ''
  const supabase = await createClient()

  const { data: role } = await supabase.rpc('crm_current_user_role')
  const canManage = ['admin', 'manager', 'super_admin', 'owner'].includes(String(role ?? '').toLowerCase())

  let query = supabase
    .from('projects')
    .select('id, name, slug, property_category, property_type, city, state, status, possession_date, price_min, price_max, developer_id, location_id, total_units, total_towers')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (q) query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%`)
  if (status) query = query.eq('status', status)
  if (city) query = query.ilike('city', `%${city}%`)

  const { data: projects, error } = await query
  const developerIds = [...new Set((projects ?? []).map((project) => project.developer_id).filter(Boolean))] as string[]
  const { data: developers } = developerIds.length
    ? await supabase.from('developers').select('id, name').in('id', developerIds)
    : { data: [] as { id: string; name: string }[] }
  const developerMap = new Map((developers ?? []).map((developer) => [developer.id, developer.name]))

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">PORTFOLIO</div>
          <h1>Inventory</h1>
          <p className="muted">Projects, configurations, units and listings from the shared property master.</p>
        </div>
        <div className="actions-inline">
          <Link className="button secondary" href="/dashboard">Overview</Link>
          {canManage ? <Link className="button" href="/dashboard/inventory/new">Add project</Link> : null}
        </div>
      </div>

      <section className="panel">
        <form className="filters" method="get">
          <div className="search-form">
            <input name="q" defaultValue={q} placeholder="Search project, city or state…" />
            <button className="button" type="submit">Search</button>
          </div>
          <select name="status" defaultValue={status} aria-label="Project status">
            <option value="">All status</option>
            {['upcoming', 'pre_launch', 'launched', 'under_construction', 'ready_to_move', 'completed', 'sold_out', 'inactive'].map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
        </form>

        {error ? <div className="empty">Unable to load inventory: {error.message}</div> : null}
        {!error && !projects?.length ? (
          <div className="empty">
            <strong>No projects in the property master yet.</strong>
            <p className="muted">The inventory schema is ready. Managers can add projects now; configurations, units and listings can then be loaded against the project.</p>
            {canManage ? <p style={{ marginTop: 14 }}><Link className="button" href="/dashboard/inventory/new">Add the first project</Link></p> : null}
          </div>
        ) : null}

        {projects?.length ? (
          <div className="panel table-wrap" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>Project</th><th>Developer</th><th>Location</th><th>Type</th><th>Status</th><th>Price</th></tr></thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td><Link className="table-link" href={`/dashboard/inventory/${project.id}`}>{project.name}</Link><div className="muted small">{project.total_units ?? 0} units · {project.total_towers ?? 0} towers</div></td>
                    <td>{project.developer_id ? developerMap.get(project.developer_id) ?? '—' : '—'}</td>
                    <td>{[project.city, project.state].filter(Boolean).join(', ') || '—'}</td>
                    <td className="capitalize">{String(project.property_type).replaceAll('_', ' ')}</td>
                    <td><span className={`badge ${project.status === 'ready_to_move' || project.status === 'launched' ? 'warm' : 'cold'}`}>{String(project.status).replaceAll('_', ' ')}</span></td>
                    <td>{money(project.price_min)}{project.price_max ? ` – ${money(project.price_max)}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  )
}
