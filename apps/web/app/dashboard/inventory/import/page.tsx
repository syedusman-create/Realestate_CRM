import Link from 'next/link'
import PropertyImportForm from './import-form'

export default function PropertyImportPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">PORTFOLIO · IMPORT CENTER</div>
          <h1>Property Import Center</h1>
          <p className="muted">Bulk-load project inventory into the shared property master with a preview-first CSV workflow.</p>
        </div>
        <Link className="button secondary" href="/dashboard/inventory">Back to inventory</Link>
      </div>
      <PropertyImportForm />
    </main>
  )
}
