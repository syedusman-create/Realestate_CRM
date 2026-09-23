import Link from 'next/link'
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckSquare,
  GitBranch,
  Sparkles,
  UsersRound,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type WorkspaceCardProps = {
  title: string
  description: string
  href: string
  action?: string
}

const iconMap = {
  'Lead Workspace': UsersRound,
  'Sales Pipeline': GitBranch,
  'Task Queue': CheckSquare,
  'Property Matching': Sparkles,
  Inventory: Building2,
  Reports: BarChart3,
} as const

export default function WorkspaceCard({
  title,
  description,
  href,
  action = 'Open workspace',
}: WorkspaceCardProps) {
  const Icon =
    iconMap[title as keyof typeof iconMap] ?? ArrowUpRight

  return (
    <Card className="group flex h-full flex-col border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/25 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg border border-brand-gold/20 bg-brand-gold/10 text-brand-gold-dark">
            <Icon className="size-4" aria-hidden="true" />
          </div>

          <ArrowUpRight
            className="size-4 text-muted-foreground/50 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold-dark"
            aria-hidden="true"
          />
        </div>

        <CardTitle className="pt-3 text-base">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <p className="text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        <div className="mt-auto pt-6">
          <Link
            href={href}
            className="inline-flex items-center text-sm font-semibold text-brand-gold-dark transition-colors hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            {action}

            <span
              className="ml-1.5 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}