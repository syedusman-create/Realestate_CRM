import Link from 'next/link'
import {
  buildInventoryMatrix,
  getMatrixStatusClass,
} from '@/lib/crm/inventory/matrix'
import {
  formatCurrency,
  formatUnitStatus,
  type InventoryItem,
} from '@/lib/crm/inventory/types'
import { InventoryStatusBadge } from './inventory-status-badge'

type Props = {
  items: InventoryItem[]
}

export function InventoryMatrix({
  items,
}: Props) {
  const towers = buildInventoryMatrix(items)

  if (towers.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center">
        <h2 className="text-lg font-semibold">
          No inventory found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Adjust the filters or add a property
          to see the inventory matrix.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">
          Status
        </span>

        <div className="flex flex-wrap gap-2">
          {[
            'available',
            'reserved',
            'sold',
            'leased',
            'under_maintenance',
            'off_market',
          ].map((status) => (
            <div
              key={status}
              className="flex items-center gap-1.5"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full border ${getMatrixStatusClass(
                  status as Parameters<
                    typeof getMatrixStatusClass
                  >[0],
                )}`}
              />

              <span className="text-xs text-muted-foreground">
                {formatUnitStatus(
                  status as Parameters<
                    typeof formatUnitStatus
                  >[0],
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {towers.map((tower) => (
        <section
          key={tower.id}
          className="overflow-hidden rounded-lg border bg-card"
        >
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">
              {tower.name}
            </h2>

            <p className="text-xs text-muted-foreground">
              {tower.rows.reduce(
                (total, row) =>
                  total + row.units.length,
                0,
              )}{' '}
              units
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px] p-4">
              {tower.rows.map((row) => (
                <div
                  key={
                    row.floor === null
                      ? 'unassigned'
                      : row.floor
                  }
                  className="grid grid-cols-[100px_minmax(0,1fr)] border-b last:border-b-0"
                >
                  <div className="flex items-start border-r px-3 py-3 text-xs font-medium text-muted-foreground">
                    {row.label}
                  </div>

                  <div className="flex flex-wrap gap-2 p-3">
                    {row.units.map(
                      ({ unit }) => (
                        <Link
                          key={unit.id}
                          href={`/dashboard/inventory/${unit.id}`}
                          title={`${unit.unit_number} · ${formatUnitStatus(
                            unit.status,
                          )}`}
                          className={`group flex min-h-16 min-w-24 flex-col justify-between rounded-md border p-2 text-left transition ${getMatrixStatusClass(
                            unit.status,
                          )}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold">
                              {unit.unit_number}
                            </span>

                            <InventoryStatusBadge
                              status={
                                unit.status
                              }
                            />
                          </div>

                          <div className="mt-2 text-xs opacity-80">
                            {formatCurrency(
                              unit.asking_price,
                            )}
                          </div>
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}