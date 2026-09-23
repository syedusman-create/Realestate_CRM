import {
  Building2,
  Home,
  Layers3,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PortfolioPulseProps = {
  activeProjects?: number | null
  availableUnits?: number | null
  activeListings?: number | null
}

export default function PortfolioPulse({
  activeProjects,
  availableUnits,
  activeListings,
}: PortfolioPulseProps) {
  const items = [
    {
      label: 'Active Projects',
      value: activeProjects ?? 0,
      icon: Building2,
    },
    {
      label: 'Available Units',
      value: availableUnits ?? 0,
      icon: Home,
    },
    {
      label: 'Active Listings',
      value: activeListings ?? 0,
      icon: Layers3,
    },
  ]

  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold-dark">
          Inventory
        </div>

        <CardTitle className="text-xl tracking-tight">
          Portfolio Pulse
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="rounded-xl border border-border/70 bg-muted/25 p-4 transition-colors hover:bg-muted/45"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="size-4 text-brand-gold-dark"
                    aria-hidden="true"
                  />

                  <div className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </div>
                </div>

                <div className="mt-3 text-2xl font-semibold tracking-tight">
                  {item.value}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}