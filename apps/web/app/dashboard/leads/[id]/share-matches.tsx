'use client'

import { useActionState } from 'react'
import { shareMatchedProperties, type ShareMatchesState } from './share-actions'

type Match = {
  project_id: string
  project_name: string
  developer_name: string | null
  location_name: string | null
  unit_id: string | null
  unit_number: string | null
  listing_id: string | null
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqft: number | null
  facing: string | null
}

const initialState: ShareMatchesState = { ok: false, message: '' }

function formatMoney(value: number | null) {
  if (value == null) return 'Price on request'
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

export default function ShareMatches({ leadId, phone, matches }: { leadId: string; phone: string | null; matches: Match[] }) {
  const [state, formAction, pending] = useActionState(shareMatchedProperties, initialState)

  if (!matches.length) return null

  const directWhatsApp = phone ? `https://wa.me/${phone.replace(/^\+/, '')}` : null

  return (
    <form action={formAction} className="share-form">
      <input type="hidden" name="lead_id" value={leadId} />
      {matches.map((match) => {
        const value = `${match.project_id}|${match.unit_id ?? ''}|${match.listing_id ?? ''}`
        return (
          <label className="share-choice" key={`${match.project_id}-${match.unit_id ?? match.listing_id ?? 'project'}`}>
            <input type="checkbox" name="match" value={value} />
            <span>
              <strong>{match.project_name}</strong>
              <span className="muted small">{match.unit_number ?? 'Matched property'} · {match.bedrooms ?? '—'} BHK · {match.area_sqft ? `${Number(match.area_sqft).toLocaleString('en-IN')} sq ft` : 'Area —'} · {formatMoney(match.price)}</span>
            </span>
          </label>
        )
      })}
      <div className="form-actions">
        <button className="button" type="submit" disabled={pending}>{pending ? 'Preparing…' : 'Create WhatsApp share'}</button>
        {directWhatsApp ? <a className="button secondary" href={directWhatsApp} target="_blank" rel="noreferrer">Open chat</a> : null}
      </div>
      {state.message ? <div className={`form-message ${state.ok ? 'success' : 'error'}`}>{state.message}</div> : null}
      {state.whatsappUrl ? <a className="share-result" href={state.whatsappUrl} target="_blank" rel="noreferrer">Open WhatsApp with selected properties →</a> : null}
    </form>
  )
}
