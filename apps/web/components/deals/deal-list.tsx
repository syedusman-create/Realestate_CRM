import Link from 'next/link'
import type { DealPipelineRow } from '@/lib/crm/deals/types'

type DealListProps = {
  deals: DealPipelineRow[]
}

function formatMoney(value: number | null): string {
  if (!value) return '₹0'

  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(2)} Cr`
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)} L`
  }

  return `₹${value.toLocaleString('en-IN')}`
}

function statusClass(status: string): string {
  switch (status) {
    case 'won':
      return 'hot'

    case 'lost':
      return 'cold'

    case 'paused':
      return 'muted'

    default:
      return 'warm'
  }
}

export function DealList({ deals }: DealListProps) {
  if (!deals.length) {
    return (
      <section className="panel">
        <div className="empty">
          No opportunities match the current filters.
        </div>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <h2>Opportunities</h2>
          <span className="muted small">
            {deals.length} records
          </span>
        </div>
      </div>

      <div className="list">
        {deals.map((deal) => {
          const probability =
            deal.probability ??
            deal.stage_probability ??
            0

          return (
            <article
              className="list-row"
              key={deal.deal_id}
            >
              <div className="list-main">
                <div className="row-between">
                  <strong>{deal.deal_name}</strong>

                  <span
                    className={`badge ${statusClass(deal.status)}`}
                  >
                    {deal.status}
                  </span>
                </div>

                <div className="muted small">
                  <Link
                    href={`/dashboard/leads/${deal.lead_id}`}
                  >
                    {deal.person_name}
                  </Link>

                  {' · '}

                  {deal.stage_name ?? 'No stage'}

                  {' · '}

                  {deal.owner_name ?? 'Unassigned'}
                </div>
              </div>

              <div className="deal-summary">
                <strong>
                  {formatMoney(deal.deal_value)}
                </strong>

                <span className="muted small">
                  {deal.expected_close_date
                    ? `Close ${deal.expected_close_date}`
                    : 'No close date'}
                  {' · '}
                  {probability}%
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}