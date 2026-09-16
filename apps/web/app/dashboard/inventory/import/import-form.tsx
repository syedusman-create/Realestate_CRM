'use client'

import { useActionState, useMemo, useState } from 'react'
import { importProperties, type PropertyImportState } from './actions'

const columns = [
  'name', 'developer_name', 'location_name', 'city', 'state', 'country', 'postal_code', 'address_line_1', 'address_line_2', 'latitude', 'longitude',
  'property_category', 'property_type', 'status', 'price_min', 'price_max', 'total_units', 'total_towers', 'total_floors', 'land_area_sqft',
  'launch_date', 'possession_date', 'rera_number', 'description', 'highlights',
]

const template = [
  columns.join(','),
  'Prestige Lakeside Habitat,Prestige Group,Varthur,Bengaluru,Karnataka,India,560087,"Varthur Main Road",,12.9719,77.7501,primary_sale,apartment,ready_to_move,12000000,25000000,2718,4,28,102000,2015-01-01,2019-12-31,,Large township,"Clubhouse; lake views; schools nearby"',
].join('\n')

function parseCsv(input: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    const next = input[i + 1]
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; continue }
    if (char === '"') { quoted = !quoted; continue }
    if (char === ',' && !quoted) { row.push(cell.trim()); cell = ''; continue }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1
      row.push(cell.trim()); cell = ''
      if (row.some(Boolean)) rows.push(row)
      row = []
      continue
    }
    cell += char
  }
  if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row) }
  if (!rows.length) return []

  const headers = rows[0]?.map((header) => header.toLowerCase().trim().replace(/\s+/g, '_')) ?? []
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

const initialState: PropertyImportState = { ok: true, message: '', imported: 0, failed: 0, errors: [] }

export default function PropertyImportForm() {
  const [state, formAction, pending] = useActionState(importProperties, initialState)
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [fileError, setFileError] = useState('')

  const payload = useMemo(() => JSON.stringify(rows), [rows])

  function handleFile(file: File | undefined) {
    setFileError('')
    setRows([])
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) { setFileError('Upload a CSV file.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result ?? ''))
      if (!parsed.length) { setFileError('The CSV has no data rows.'); return }
      if (parsed.length > 5000) { setFileError('Maximum 5,000 properties per import.'); return }
      const firstRow = parsed[0]
      if (!firstRow) { setFileError('The CSV has no usable data rows.'); return }
      const missing = ['name'].filter((key) => !Object.keys(firstRow).includes(key))
      if (missing.length) { setFileError(`Missing required column: ${missing.join(', ')}`); return }
      setRows(parsed)
    }
    reader.onerror = () => setFileError('Unable to read the CSV file.')
    reader.readAsText(file)
  }

  return (
    <div className="detail-grid">
      <section className="panel">
        <div className="section-title"><div><h2>Upload property inventory</h2><p className="muted">One row per project. Existing projects are updated when the name and city match. Location names and coordinates are matched into the CRM location graph.</p></div></div>
        <div className="form-grid">
          <label>CSV file<input type="file" accept=".csv,text/csv" onChange={(event) => handleFile(event.target.files?.[0])} /></label>
        </div>
        <div className="form-actions" style={{ marginTop: 14 }}>
          <a className="button secondary" href={`data:text/csv;charset=utf-8,${encodeURIComponent(template)}`} download="property-import-template.csv">Download template</a>
          <span className="muted small">Required: name · Optional: developer, location, coordinates, pricing, inventory, RERA and dates</span>
        </div>
        {fileError ? <div className="form-message error" style={{ marginTop: 14 }}>{fileError}</div> : null}
      </section>

      <section className="panel">
        <div className="section-title"><div><h2>Preview</h2><p className="muted">Showing the first 10 rows before anything is written.</p></div><strong>{rows.length} rows</strong></div>
        {!rows.length ? <div className="empty">Choose a CSV to preview the property records.</div> : (
          <div className="table-wrap" style={{ padding: 0 }}>
            <table>
              <thead><tr>{columns.slice(0, 9).map((column) => <th key={column}>{column.replaceAll('_', ' ')}</th>)}</tr></thead>
              <tbody>{rows.slice(0, 10).map((row, index) => <tr key={`${index}-${row.name}`}>
                {columns.slice(0, 9).map((column) => <td key={column}>{row[column] || '—'}</td>)}
              </tr>)}</tbody>
            </table>
          </div>
        )}

        <form action={formAction} style={{ marginTop: 16 }}>
          <input type="hidden" name="rows" value={payload} />
          <button className="button" type="submit" disabled={pending || !rows.length}>{pending ? 'Importing…' : `Import ${rows.length} properties`}</button>
        </form>
        {state.message ? <div className={`form-message ${state.ok ? 'success' : 'error'}`} style={{ marginTop: 14 }}>{state.message}</div> : null}
        {state.errors.length ? <div className="empty" style={{ marginTop: 14 }}>{state.errors.map((error) => <div key={`${error.row}-${error.message}`}>Row {error.row}: {error.message}</div>)}</div> : null}
      </section>
    </div>
  )
}
