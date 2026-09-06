import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/server'
import { createConfiguration, createUnit } from '../actions'

function money(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

function date(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export default async function InventoryProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, slug, property_category, property_type, city, state, postal_code, address_line_1, address_line_2, status, launch_date, possession_date, rera_number, description, highlights, price_min, price_max, land_area_sqft, total_units, total_towers, total_floors, developer_id, location_id')
    .eq('id', id)
    .maybeSingle()
  if (error || !project) notFound()

  const [{ data: configurations }, { data: developers }, { data: media }, { data: units }, { data: roleData }] = await Promise.all([
    supabase.from('project_configurations').select('id, configuration_name, bedrooms, bathrooms, super_builtup_area_min, super_builtup_area_max, price_min, price_max, total_available_units').eq('project_id', id).order('bedrooms').order('price_min'),
    project.developer_id ? supabase.from('developers').select('id, name, website').eq('id', project.developer_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('property_media').select('id, media_type, url, thumbnail_url, title, is_primary, sort_order').eq('project_id', id).order('sort_order').limit(20),
    supabase.from('units').select('id, unit_number, floor_number, bedrooms, bathrooms, super_builtup_area_sqft, asking_price, status, facing, parking_count, configuration_id').eq('project_id', id).order('asking_price').limit(100),
    supabase.rpc('crm_current_user_role'),
  ])

  const canManage = ['admin', 'manager', 'super_admin', 'owner'].includes(String(roleData ?? '').toLowerCase())
  const availableUnits = (units ?? []).filter((unit) => unit.status === 'available')
  const primaryMedia = (media ?? []).find((item) => item.is_primary) ?? media?.[0]
  const description = project.description || project.highlights

  return (
    <main className="page">
      <Link className="back-link" href="/dashboard/inventory">← Inventory</Link>
      <div className="page-header">
        <div>
          <div className="eyebrow">PROJECT</div>
          <h1>{project.name}</h1>
          <p className="muted">{[project.city, project.state].filter(Boolean).join(', ') || 'Location pending'} · {String(project.property_type).replaceAll('_', ' ')}</p>
        </div>
        <span className={`badge ${project.status === 'ready_to_move' || project.status === 'launched' ? 'warm' : 'cold'}`}>{String(project.status).replaceAll('_', ' ')}</span>
      </div>

      {primaryMedia ? <div className="inventory-hero" style={{ backgroundImage: `url(${primaryMedia.thumbnail_url || primaryMedia.url})` }}><span>{primaryMedia.title || 'Project media'}</span></div> : null}

      <div className="content-grid">
        <section className="panel">
          <div className="section-title"><h2>Project details</h2></div>
          <div className="detail-grid">
            <div><span>Developer</span><strong>{developers?.name ?? '—'}</strong></div>
            <div><span>RERA</span><strong>{project.rera_number ?? '—'}</strong></div>
            <div><span>Launch</span><strong>{date(project.launch_date)}</strong></div>
            <div><span>Possession</span><strong>{date(project.possession_date)}</strong></div>
            <div><span>Total land</span><strong>{project.land_area_sqft ? `${project.land_area_sqft.toLocaleString('en-IN')} sq ft` : '—'}</strong></div>
            <div><span>Price band</span><strong>{money(project.price_min)}{project.price_max ? ` – ${money(project.price_max)}` : ''}</strong></div>
            <div><span>Units</span><strong>{project.total_units ?? '—'}</strong></div>
            <div><span>Towers / floors</span><strong>{project.total_towers ?? '—'} / {project.total_floors ?? '—'}</strong></div>
          </div>
          {description ? <p className="muted" style={{ marginTop: 22, lineHeight: 1.7 }}>{description}</p> : null}
          {project.address_line_1 || project.address_line_2 ? <p className="muted small" style={{ marginTop: 14 }}>{[project.address_line_1, project.address_line_2, project.city, project.state, project.postal_code].filter(Boolean).join(', ')}</p> : null}
        </section>

        <section className="panel">
          <div className="section-title"><h2>Availability</h2><span className="muted small">{availableUnits.length} visible</span></div>
          {configurations?.length ? <div className="list-row" style={{ fontSize: 12, color: 'var(--muted)' }}><span>Configuration</span><span>Available · Price</span></div> : null}
          {(configurations ?? []).map((configuration) => <div className="list-row" key={configuration.id}><span><strong>{configuration.configuration_name}</strong><br /><span className="muted small">{configuration.bedrooms} BHK · {configuration.super_builtup_area_min ?? '—'}–{configuration.super_builtup_area_max ?? '—'} sq ft</span></span><span style={{ textAlign: 'right' }}><strong>{configuration.total_available_units}</strong><br /><span className="muted small">{money(configuration.price_min)}{configuration.price_max ? ` – ${money(configuration.price_max)}` : ''}</span></span></div>)}
          {!configurations?.length ? <div className="empty">No configurations have been loaded for this project.</div> : null}
        </section>
      </div>

      {canManage ? (
        <div className="content-grid" style={{ marginTop: 14 }}>
          <section className="panel">
            <div className="section-title"><h2>Add configuration</h2><span className="muted small">Manager only</span></div>
            <form action={createConfiguration.bind(null, id)} className="form-grid">
              <input type="hidden" name="project_name" value={project.name} />
              <label>Configuration name<input name="configuration_name" placeholder="3 BHK" required /></label>
              <label>Bedrooms<input name="bedrooms" type="number" min="0" step="1" required /></label>
              <label>Bathrooms<input name="bathrooms" type="number" min="0" step="0.5" /></label>
              <label>Super built-up min<input name="super_builtup_area_min" type="number" min="0" step="1" placeholder="1400" /></label>
              <label>Super built-up max<input name="super_builtup_area_max" type="number" min="0" step="1" placeholder="1800" /></label>
              <label>Price min<input name="price_min" type="number" min="0" step="1" placeholder="15000000" /></label>
              <label>Price max<input name="price_max" type="number" min="0" step="1" placeholder="19000000" /></label>
              <label>Available units<input name="total_available_units" type="number" min="0" step="1" defaultValue="0" /></label>
              <div className="form-actions"><button className="button primary" type="submit">Add configuration</button></div>
            </form>
          </section>

          <section className="panel">
            <div className="section-title"><h2>Add unit</h2><span className="muted small">Manager only</span></div>
            <form action={createUnit.bind(null, id)} className="form-grid">
              <label>Unit number<input name="unit_number" placeholder="A-1204" required /></label>
              <label>Configuration<select name="configuration_id" defaultValue=""><option value="">Not specified</option>{(configurations ?? []).map((configuration) => <option key={configuration.id} value={configuration.id}>{configuration.configuration_name}</option>)}</select></label>
              <label>Floor<input name="floor_number" type="number" min="0" step="1" /></label>
              <label>Bedrooms<input name="bedrooms" type="number" min="0" step="1" /></label>
              <label>Bathrooms<input name="bathrooms" type="number" min="0" step="0.5" /></label>
              <label>Area (sq ft)<input name="super_builtup_area_sqft" type="number" min="0" step="1" /></label>
              <label>Asking price<input name="asking_price" type="number" min="0" step="1" /></label>
              <label>Price / sq ft<input name="price_per_sqft" type="number" min="0" step="1" /></label>
              <label>Parking<input name="parking_count" type="number" min="0" step="1" /></label>
              <label>Facing<input name="facing" placeholder="East" /></label>
              <label>Status<select name="status" defaultValue="available"><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option><option value="leased">Leased</option><option value="under_maintenance">Under maintenance</option><option value="off_market">Off market</option></select></label>
              <div className="form-actions"><button className="button primary" type="submit">Add unit</button></div>
            </form>
          </section>
        </div>
      ) : null}

      <section className="panel" style={{ marginTop: 14 }}>
        <div className="section-title"><h2>Unit inventory</h2><span className="muted small">{units?.length ?? 0} loaded</span></div>
        {units?.length ? (
          <div className="panel table-wrap" style={{ padding: 0, marginTop: 14 }}>
            <table>
              <thead><tr><th>Unit</th><th>Configuration</th><th>Floor</th><th>Area</th><th>Price</th><th>Status</th><th>Facing</th></tr></thead>
              <tbody>
                {units.map((unit) => {
                  const configuration = configurations?.find((item) => item.id === unit.configuration_id)
                  return <tr key={unit.id}>
                    <td><strong>{unit.unit_number}</strong></td>
                    <td>{configuration?.configuration_name ?? `${unit.bedrooms ?? '—'} BHK`}</td>
                    <td>{unit.floor_number ?? '—'}</td>
                    <td>{unit.super_builtup_area_sqft ? `${unit.super_builtup_area_sqft.toLocaleString('en-IN')} sq ft` : '—'}</td>
                    <td>{money(unit.asking_price)}</td>
                    <td><span className={`badge ${unit.status === 'available' ? 'warm' : 'cold'}`}>{String(unit.status).replaceAll('_', ' ')}</span></td>
                    <td>{unit.facing ?? '—'}</td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="empty">No units have been loaded for this project.</div>}
      </section>
    </main>
  )
}
