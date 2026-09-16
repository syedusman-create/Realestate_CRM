'use client'

import { useActionState, useMemo, useState } from 'react'
import { importLeads, type LeadImportState } from './actions'

const initialState: LeadImportState = { ok: true, message: '', imported: 0, failed: 0 }
const columns = ['first_name', 'last_name', 'phone', 'email', 'source_name', 'external_lead_id', 'external_campaign_id', 'external_ad_id', 'external_form_id', 'budget_min', 'budget_max', 'bedrooms_min', 'bedrooms_max', 'preferred_location', 'notes']

type Row = Record<string, string>

function parseCsv(input: string): Row[] {
  const lines: string[][] = []
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
      if (row.some(Boolean)) lines.push(row)
      row = []
      continue
    }
    cell += char
  }
  if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) lines.push(row) }
  if (lines.length < 2) return []

  const firstLine = lines[0]
  if (!firstLine) return []
  const headers = firstLine.map((header) => header.trim().toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

function csvTemplate() {
  return `${columns.join(',')}\nJohn,Doe,+919999999999,john@example.com,website,EXT-001,CAMPAIGN-1,AD-1,FORM-1,5000000,8000000,2,3,Bengaluru,Looking for a 2-3 BHK`
}

export default function LeadImportForm() {
  const [state, action, pending] = useActionState(importLeads, initialState)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [parseError, setParseError] = useState('')
  const payload = useMemo(() => JSON.stringify(rows), [rows])

  function onFile(file: File | undefined) {
    setParseError('')
    setFileName(file?.name ?? '')
    if (!file) { setRows([]); return }
    if (!file.name.toLowerCase().endsWith('.csv')) { setRows([]); setParseError('Please choose a CSV file.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result ?? ''))
      if (!parsed.length) { setRows([]); setParseError('The CSV needs a header row and at least one data row.'); return }
      if (!parsed.some((row) => row.first_name || row.last_name || row.phone || row.email)) { setRows([]); setParseError('Each lead needs at least a name, phone, or email.'); return }
      if (parsed.length > 5000) { setRows(parsed.slice(0, 5000)); setParseError('Only the first 5,000 rows will be imported.'); return }
      setRows(parsed)
    }
    reader.onerror = () => setParseError('Unable to read the CSV file.')
    reader.readAsText(file)
  }

  return (
    <>
      <section className="panel">
        <div className="section-title"><h2>1. Choose CSV</h2></div>
        <p className="muted">Upload up to 5,000 leads. Existing people are matched by the existing ingestion flow and existing ownership is preserved.</p>
        <div className="quick-grid">
          <label className="quick-card" style={{ cursor: 'pointer' }}>
            <strong>{fileName || 'Choose CSV file'}</strong>
            <span>Required columns: first_name, last_name, phone, email. Other columns are optional.</span>
            <input type="file" accept=".csv,text/csv" onChange={(event) => onFile(event.target.files?.[0])} style={{ marginTop: 12 }} />
          </label>
          <button className="quick-card" type="button" onClick={() => { const blob = new Blob([csvTemplate()], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'lead-import-template.csv'; anchor.click(); URL.revokeObjectURL(url) }}>
            <strong>Download template</strong><span>Use the CRM field names as your CSV headers.</span>
          </button>
        </div>
        {parseError ? <div className="empty" style={{ marginTop: 16 }}>{parseError}</div> : null}
      </section>

      <section className="panel">
        <div className="section-title"><h2>2. Review</h2><span className="muted">{rows.length} rows ready</span></div>
        {rows.length === 0 ? <div className="empty">Upload a CSV to preview the first rows before importing.</div> : (
          <>
            <div className="table-wrap">
              <table><thead><tr><th>Customer</th><th>Phone</th><th>Email</th><th>Source</th><th>Budget</th><th>Location</th></tr></thead>
                <tbody>{rows.slice(0, 10).map((row, index) => <tr key={index}><td>{[row.first_name, row.last_name].filter(Boolean).join(' ') || '—'}</td><td>{row.phone || '—'}</td><td>{row.email || '—'}</td><td>{row.source_name || 'csv_import'}</td><td>{row.budget_min || row.budget_max ? `${row.budget_min || '0'} – ${row.budget_max || '0'}` : '—'}</td><td>{row.preferred_location || '—'}</td></tr>)}</tbody>
              </table>
            </div>
            <form action={action} style={{ marginTop: 20 }}>
              <input type="hidden" name="rows" value={payload} />
              <button className="button" type="submit" disabled={pending}>{pending ? 'Importing…' : `Import ${rows.length} leads`}</button>
            </form>
          </>
        )}
        {state.message ? <div className="empty" style={{ marginTop: 16 }}>{state.message}</div> : null}
      </section>
    </>
  )
}
