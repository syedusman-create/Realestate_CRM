import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { Recommendation } from '@/lib/crm/leads/types'

function formatMoney(value: number | null) {
  if (value == null) {
    return 'Price on request'
  }

  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(2)} Cr`
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)} L`
  }

  return `₹${value.toLocaleString('en-IN')}`
}

export default function LeadPropertyMatches({
  matches,
}: {
  matches: Recommendation[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property matches</CardTitle>
      </CardHeader>

      <CardContent>
        {!matches.length ? (
          <p className="text-sm text-muted-foreground">
            No property recommendations available yet.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {matches.map((match) => (
              <div
                key={`${match.project_id}-${match.unit_id ?? match.listing_id ?? match.rank}`}
                className="rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {match.project_name}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {match.location_name ?? 'Location unavailable'}
                    </div>
                  </div>

                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
                    {Number(match.total_score).toFixed(0)}
                  </span>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  {match.unit_number
                    ? `Unit ${match.unit_number}`
                    : 'Matched property'}
                  {' · '}
                  {match.bedrooms ?? '—'} BHK
                  {' · '}
                  {match.area_sqft
                    ? `${Number(match.area_sqft).toLocaleString('en-IN')} sq ft`
                    : 'Area —'}
                </div>

                <div className="mt-2 font-medium">
                  {formatMoney(match.price)}
                </div>

                {match.floor_number != null && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Floor {match.floor_number}
                    {match.facing
                      ? ` · ${match.facing} facing`
                      : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}