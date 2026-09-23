import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type KpiCardProps = {
  label: string
  value: number | string
  description?: string
  icon?: LucideIcon
  emphasis?: 'default' | 'attention'
}

export default function KpiCard({
  label,
  value,
  description,
  icon: Icon,
  emphasis = 'default',
}: KpiCardProps) {
  const isAttention = emphasis === 'attention'

  return (
    <Card
      className={[
        'group relative overflow-hidden border-border/70 bg-card shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-brand-gold/25 hover:shadow-md',
      ].join(' ')}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </div>

            <div className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
              {value}
            </div>

            {description ? (
              <div className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {description}
              </div>
            ) : null}
          </div>

          {Icon ? (
            <div
              className={[
                'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                isAttention
                  ? 'border-brand-gold/30 bg-brand-gold/10 text-brand-gold-dark'
                  : 'border-border/70 bg-muted/50 text-muted-foreground',
              ].join(' ')}
            >
              <Icon className="size-4" aria-hidden="true" />
            </div>
          ) : null}
        </div>

        <div
          className={[
            'absolute inset-x-0 bottom-0 h-0.5 origin-left transition-transform duration-200 group-hover:scale-x-100',
            isAttention ? 'bg-brand-gold' : 'bg-brand-navy/15',
          ].join(' ')}
          aria-hidden="true"
        />
      </CardContent>
    </Card>
  )
}