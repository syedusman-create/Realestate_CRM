import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InventoryMetrics } from '@/lib/crm/inventory/types'

type Props = {
  metrics: InventoryMetrics
}

const cards = [
  {
    key: 'total',
    label: 'Total units',
  },
  {
    key: 'available',
    label: 'Available',
  },
  {
    key: 'reserved',
    label: 'Reserved',
  },
  {
    key: 'sold',
    label: 'Sold',
  },
  {
    key: 'leased',
    label: 'Leased',
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
  },
  {
    key: 'offMarket',
    label: 'Off market',
  },
] as const

export function InventoryMetrics({ metrics }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {metrics[card.key]}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}