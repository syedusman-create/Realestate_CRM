import Link from 'next/link'
import type {
  DealPipelineRow,
  DealStage,
} from '@/lib/crm/deals/types'

type DealStageBoardProps = {
  stages: DealStage[]
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

export function DealStageBoard({
  stages,
  deals,
}: DealStageBoardProps) {
  if (!stages.length) {
    return null
  }

  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <h2>Stage pipeline</h2>
          <span className="muted small">
            Opportunities by pipeline stage
          </span>
        </div>
      </div>

      <div className="deal-board">
        {stages.map((stage) => {
          const stageDeals = deals.filter(
            (deal) => deal.stage_id === stage.id,
          )

          const stageValue = stageDeals.reduce(
            (sum, deal) =>
              sum + Number(deal.deal_value ?? 0),
            0,
          )

          return (
            <div
              className="deal-column"
              key={stage.id}
            >
              <div className="deal-column-header">
                <div>
                  <strong>{stage.name}</strong>

                  <span className="muted small">
                    {stageDeals.length} opportunities
                  </span>
                </div>

                <span className="muted small">
                  {formatMoney(stageValue)}
                </span>
              </div>

              <div className="deal-column-body">
                {stageDeals.length ? (
                  stageDeals.map((deal) => (
                    <Link
                      key={deal.deal_id}
                      href={`/dashboard/leads/${deal.lead_id}`}
                      className="deal-card"
                    >
                      <strong>{deal.deal_name}</strong>

                      <span className="muted small">
                        {deal.person_name}
                      </span>

                      <div className="row-between">
                        <span className="muted small">
                          {formatMoney(deal.deal_value)}
                        </span>

                        <span className="muted small">
                          {deal.probability ??
                            deal.stage_probability ??
                            0}
                          %
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="deal-column-empty">
                    No opportunities
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}