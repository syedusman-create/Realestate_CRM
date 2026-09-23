import Link from 'next/link'

type DealHeaderProps = {
  query?: string
  status?: string
}

export function DealHeader({
  query = '',
  status = 'all',
}: DealHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">SALES PIPELINE</div>

        <h1>Opportunities</h1>

        <p className="muted">
          Move qualified leads through viewing, negotiation and closure.
        </p>
      </div>

      <Link
        href="/dashboard/leads"
        className="button primary"
      >
        View leads
      </Link>
    </div>
  )
}