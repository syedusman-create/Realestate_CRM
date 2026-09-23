import type { DealMetrics } from '@/lib/crm/deals/types'

type DealMetricsProps = {
  metrics: DealMetrics
}

function formatMoney(value: number): string {
  if (!value) return '₹0'

  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(2)} Cr`
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)} L`
  }

  return `₹${value.toLocaleString('en-IN')}`
}

export function DealMetrics({ metrics }: DealMetricsProps) {
  return (
    <div className="metric-grid">
      <div className="metric-card">
        <span>Opportunities</span>
        <strong>{metrics.total}</strong>
      </div>

      <div className="metric-card">
        <span>Open value</span>
        <strong>{formatMoney(metrics.openValue)}</strong>
      </div>

      <div className="metric-card">
        <span>Weighted pipeline</span>
        <strong>{formatMoney(metrics.weightedValue)}</strong>
      </div>

      <div className="metric-card">
        <span>Won value</span>
        <strong>{formatMoney(metrics.wonValue)}</strong>
      </div>
    </div>
  )
}