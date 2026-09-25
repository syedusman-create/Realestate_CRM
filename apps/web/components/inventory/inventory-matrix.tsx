import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InventoryStatusBadge } from './inventory-status-badge'
import { buildInventoryMatrix } from '@/lib/crm/inventory/matrix'
import {
  formatCurrency,
  formatNumber,
  formatUnitStatus,
  type InventoryItem,
  type UnitStatus,
} from '@/lib/crm/inventory/types'

type Props = {
  items: InventoryItem[]
}

const statusClasses: Record<UnitStatus, string> = {
  available: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
  reserved: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
  sold: 'border-red-200 bg-red-50 hover:bg-red-100',
  leased: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
  under_maintenance: 'border-slate-200 bg-slate-50 hover:bg-slate-100',
  off_market: 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100',
}

export function InventoryMatrix({ items }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">No inventory matches these filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Change the filters or add a property to populate the matrix.
          </p>
        </CardContent>
      </Card>
    )
  }

  const towers = buildInventoryMatrix(items)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-4 text-xs text-muted-foreground">
          {(['available', 'reserved', 'sold', 'leased', 'under_maintenance', 'off_market'] as UnitStatus[]).map(
            (status) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-sm border ${statusClasses[status]}`} />
                {formatUnitStatus(status)}
              </div>
            ),
          )}
        </CardContent>
      </Card>

      {towers.map((tower) => (
        <Card key={tower.towerId}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-baseline gap-2">
              {tower.towerName}
              {tower.phaseName ? (
                <span className="text-sm font-normal text-muted-foreground">
                  {tower.phaseName}
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[720px] space-y-2">
              {tower.rows.map((row) => (
                <div key={row.floor} className="flex items-stretch gap-2">
                  <div className="flex w-16 shrink-0 items-center justify-center rounded-md bg-muted/50 text-xs font-medium text-muted-foreground">
                    {row.floor > 0 ? `F${row.floor}` : '—'}
                  </div>
                  <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                    {row.cells.map(({ unit }) => (
                      <Link
                        key={unit.id}
                        href={`/dashboard/inventory/${unit.id}`}
                        className={`rounded-md border p-2 text-left transition-colors ${statusClasses[unit.status]}`}
                        title={`${unit.unit_number} · ${formatUnitStatus(unit.status)}`}
                      >
                        <div className="font-semibold">{unit.unit_number}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {unit.configuration?.configuration_name ??
                            (unit.bedrooms != null
                              ? `${formatNumber(unit.bedrooms)} BHK`
                              : 'No config')}
                        </div>
                        <div className="mt-1 text-xs font-medium">{formatCurrency(unit.asking_price)}</div>
                        <div className="mt-1"><InventoryStatusBadge status={unit.status} /></div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
