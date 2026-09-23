import Link from 'next/link'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ImportTypeCardProps = {
  title: string
  description: string
  href: string
  fields: string[]
}

export function ImportTypeCard({
  title,
  description,
  href,
  fields,
}: ImportTypeCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {description}
        </p>

        <div className="flex flex-wrap gap-2">
          {fields.map((field) => (
            <span
              key={field}
              className="rounded-md border px-2 py-1 text-xs"
            >
              {field}
            </span>
          ))}
        </div>

        <Link
          href={href}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Start Import
        </Link>
      </CardContent>
    </Card>
  )
}