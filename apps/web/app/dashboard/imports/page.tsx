import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  FileSpreadsheet,
  UsersRound,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function ImportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary">
              Data operations
            </Badge>

            <span className="text-xs text-muted-foreground">
              Import Center
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Import Center
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
            Bring leads and property inventory into Global
            Enterprises using structured CSV files.
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UsersRound className="size-6" />
              </div>

              <Badge variant="outline">
                Leads
              </Badge>
            </div>

            <CardTitle className="pt-2 text-xl">
              Import Leads
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="max-w-lg text-sm leading-6 text-muted-foreground">
              Import prospective customers, contact details,
              lead priority, temperature, scoring, and related
              profile information from CSV.
            </p>

            
              <Link href="/dashboard/imports/leads"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80">
                Open lead importer
                <ArrowRight className="size-4" />
              </Link>
            
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="size-6" />
              </div>

              <Badge variant="outline">
                Properties
              </Badge>
            </div>

            <CardTitle className="pt-2 text-xl">
              Import Properties
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="max-w-lg text-sm leading-6 text-muted-foreground">
              Import projects, configurations, and units into
              inventory with CSV mapping and validation.
            </p>

            
              <Link href="/dashboard/imports/properties"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80">
                Open property importer
                <ArrowRight className="size-4" />
              </Link>
            
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileSpreadsheet className="size-5 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            <p className="font-medium">
              CSV workflow
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Upload, map columns, preview records, validate
              data, and execute the import from the dedicated
              importer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}