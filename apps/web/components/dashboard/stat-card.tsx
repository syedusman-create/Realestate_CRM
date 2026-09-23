import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

type StatCardProps = {
  label: string
  value: ReactNode
  description?: string
}

export default function StatCard({
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardContent className="p-5">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>

        <div className="mt-2 text-2xl font-semibold tracking-tight">
          {value}
        </div>

        {description && (
          <div className="mt-1 text-xs text-muted-foreground">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  )
}