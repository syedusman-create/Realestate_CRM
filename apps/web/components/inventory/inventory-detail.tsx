import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InventoryStatusBadge } from './inventory-status-badge'
import {
  formatCurrency,
  formatNumber,
  formatPropertyType,
  type Developer,
  type Listing,
  type Project,
  type ProjectConfiguration,
  type ProjectPhase,
  type ProjectTower,
  type Unit,
} from '@/lib/crm/inventory/types'

type Props = {
  unit: Unit
  project: Project | null
  developer: Developer | null
  configuration: ProjectConfiguration | null
  phase: ProjectPhase | null
  tower: ProjectTower | null
  listing: Listing | null
}

export function InventoryDetail({
  unit,
  project,
  developer,
  configuration,
  phase,
  tower,
  listing,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Unit {unit.unit_number}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">
              Project
            </div>
            <div className="mt-1 font-medium">
              {project?.name ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Developer
            </div>
            <div className="mt-1 font-medium">
              {developer?.name ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Phase
            </div>
            <div className="mt-1 font-medium">{phase?.name ?? '—'}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Tower
            </div>
            <div className="mt-1 font-medium">{tower?.name ?? '—'}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Property type
            </div>
            <div className="mt-1 font-medium">
              {project
                ? formatPropertyType(project.property_type)
                : '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Configuration
            </div>
            <div className="mt-1 font-medium">
              {configuration?.configuration_name ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Floor
            </div>
            <div className="mt-1 font-medium">
              {unit.floor_number ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Status
            </div>
            <div className="mt-1">
              <InventoryStatusBadge status={unit.status} />
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Bedrooms
            </div>
            <div className="mt-1 font-medium">
              {formatNumber(unit.bedrooms)}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Bathrooms
            </div>
            <div className="mt-1 font-medium">
              {formatNumber(unit.bathrooms)}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Facing
            </div>
            <div className="mt-1 font-medium">
              {unit.facing ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Carpet area
            </div>
            <div className="mt-1 font-medium">
              {unit.carpet_area_sqft
                ? `${formatNumber(unit.carpet_area_sqft)} sq.ft`
                : '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Built-up area
            </div>
            <div className="mt-1 font-medium">
              {unit.builtup_area_sqft
                ? `${formatNumber(unit.builtup_area_sqft)} sq.ft`
                : '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Super built-up
            </div>
            <div className="mt-1 font-medium">
              {unit.super_builtup_area_sqft
                ? `${formatNumber(unit.super_builtup_area_sqft)} sq.ft`
                : '—'}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Asking price
            </div>
            <div className="mt-1 text-lg font-semibold">
              {formatCurrency(unit.asking_price)}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">
              Price / sq.ft
            </div>
            <div className="mt-1 font-medium">
              {formatCurrency(unit.price_per_sqft)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listing</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {listing ? (
            <>
              <div>
                <div className="text-xs text-muted-foreground">
                  Type
                </div>
                <div className="mt-1 font-medium">
                  {listing.listing_type}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Status
                </div>
                <div className="mt-1 font-medium">
                  {listing.status}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Asking price
                </div>
                <div className="mt-1 font-medium">
                  {formatCurrency(listing.asking_price)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Rent
                </div>
                <div className="mt-1 font-medium">
                  {formatCurrency(listing.rent_amount)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Maintenance
                </div>
                <div className="mt-1 font-medium">
                  {formatCurrency(listing.maintenance_amount)}
                </div>
              </div>

              {listing.description && (
                <div>
                  <div className="text-xs text-muted-foreground">
                    Description
                  </div>
                  <p className="mt-1 text-sm">
                    {listing.description}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              This unit does not have a listing yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}