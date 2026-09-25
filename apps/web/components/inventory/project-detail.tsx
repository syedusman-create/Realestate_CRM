import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatProjectCurrency,
  formatProjectNumber,
  formatProjectStatus,
  formatPropertyCategory,
  formatPropertyType,
  type ProjectWithDeveloper,
} from '@/lib/crm/inventory/project-types'

type Props = {
  project: ProjectWithDeveloper
  unitCount: number
  configurationCount: number
  unitStatusCounts: {
    available: number
    reserved: number
    sold: number
    leased: number
  }
}

export function ProjectDetail({
  project,
  unitCount,
  configurationCount,
  unitStatusCounts,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/dashboard/inventory/projects"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to projects
          </Link>

          <h1 className="mt-3 text-2xl font-semibold">
            {project.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {project.developer?.name ?? 'No developer'} ·{' '}
            {formatPropertyType(project.property_type)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/inventory/new?project=${project.id}`} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
            Add property
          </Link>
          <Link href={`/dashboard/inventory?project=${project.id}`} className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted">
            View inventory
          </Link>
          <Link
          href={`/dashboard/inventory/projects/${project.id}/edit`}
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
          >
            Edit project
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Configurations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {configurationCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {unitCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Project status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {formatProjectStatus(project.status)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Inventory snapshot</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><div className="text-xs text-muted-foreground">Available</div><div className="mt-1 text-2xl font-semibold">{unitStatusCounts.available}</div></div>
          <div><div className="text-xs text-muted-foreground">Reserved</div><div className="mt-1 text-2xl font-semibold">{unitStatusCounts.reserved}</div></div>
          <div><div className="text-xs text-muted-foreground">Sold</div><div className="mt-1 text-2xl font-semibold">{unitStatusCounts.sold}</div></div>
          <div><div className="text-xs text-muted-foreground">Leased</div><div className="mt-1 text-2xl font-semibold">{unitStatusCounts.leased}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">
              Category
            </div>
            <div className="mt-1 font-medium">
              {formatPropertyCategory(
                project.property_category,
              )}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Property type
            </div>
            <div className="mt-1 font-medium">
              {formatPropertyType(
                project.property_type,
              )}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Developer
            </div>
            <div className="mt-1 font-medium">
              {project.developer?.name ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              RERA
            </div>
            <div className="mt-1 font-medium">
              {project.rera_number ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Location
            </div>
            <div className="mt-1 font-medium">
              {[
                project.city,
                project.state,
                project.postal_code,
              ]
                .filter(Boolean)
                .join(', ') || '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Land area
            </div>
            <div className="mt-1 font-medium">
              {project.land_area_sqft
                ? `${formatProjectNumber(
                    project.land_area_sqft,
                  )} sq.ft`
                : '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Towers
            </div>
            <div className="mt-1 font-medium">
              {project.total_towers ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Floors
            </div>
            <div className="mt-1 font-medium">
              {project.total_floors ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Launch
            </div>
            <div className="mt-1 font-medium">
              {project.launch_date ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Possession
            </div>
            <div className="mt-1 font-medium">
              {project.possession_date ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Price from
            </div>
            <div className="mt-1 font-medium">
              {formatProjectCurrency(project.price_min)}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Price to
            </div>
            <div className="mt-1 font-medium">
              {formatProjectCurrency(project.price_max)}
            </div>
          </div>
        </CardContent>
      </Card>

      {(project.description ||
        project.highlights) && (
        <Card>
          <CardHeader>
            <CardTitle>Project overview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {project.description && (
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Description
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                  {project.description}
                </p>
              </div>
            )}

            {project.highlights && (
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Highlights
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                  {project.highlights}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}