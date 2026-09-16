import Link from 'next/link'
import LeadImportForm from './import-form'

export default function LeadImportPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">LEADS · IMPORT CENTER</div>
          <h1>Lead Import Center</h1>
          <p className="muted">Bring external lead lists into the CRM with a preview-first CSV workflow.</p>
        </div>
        <Link className="button secondary" href="/dashboard/leads">Back to leads</Link>
      </div>
      <LeadImportForm />
    </main>
  )
}
