import Link from 'next/link'

import { Badge } from '@/components/ui/badge'

type Props = {
  name: string
  phone: string | null
  email: string | null
  temperature: string
  priority: string
  stage: string | null
  owner: string | null
}

export default function LeadHeader({
  name,
  phone,
  email,
  temperature,
  priority,
  stage,
  owner,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {name}
            </h1>

            <Badge variant="outline">
              {temperature}
            </Badge>

            <Badge variant="secondary">
              {priority}
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {phone && <span>{phone}</span>}
            {email && <span>{email}</span>}
          </div>
        </div>

        <Link
          href="/dashboard/leads"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to leads
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <span>
          Stage: <strong className="font-medium text-foreground">
            {stage ?? 'New'}
          </strong>
        </span>

        <span>•</span>

        <span>
          Owner: <strong className="font-medium text-foreground">
            {owner ?? 'Unassigned'}
          </strong>
        </span>
      </div>
    </div>
  )
}