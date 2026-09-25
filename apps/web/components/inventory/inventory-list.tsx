import Link from 'next/link'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

import { InventoryStatusBadge } from './inventory-status-badge'

import {
  formatCurrency,
  formatListingType,
  formatNumber,
  type InventoryItem,
} from '@/lib/crm/inventory/types'

type Props = {
  items: InventoryItem[]
}

export function InventoryList({
  items,
}: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">
            No inventory found.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your filters or add a property to the inventory.
          </p>

          <Link
            href="/dashboard/inventory/new"
            className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Add property
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">
                  Unit
                </th>

                <th className="px-4 py-3 font-medium">
                  Project
                </th>

                <th className="px-4 py-3 font-medium">
                  Phase / Tower
                </th>

                <th className="px-4 py-3 font-medium">
                  Configuration
                </th>

                <th className="px-4 py-3 font-medium">
                  Floor
                </th>

                <th className="px-4 py-3 font-medium">
                  Area
                </th>

                <th className="px-4 py-3 font-medium">
                  Price
                </th>

                <th className="px-4 py-3 font-medium">
                  Listing
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/inventory/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.unit_number}
                    </Link>

                    <div className="text-xs text-muted-foreground">
                      {[
                        item.facing &&
                          `${item.facing} facing`,
                        item.parking_count !=
                          null &&
                          `${item.parking_count} parking`,
                      ]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {item.project?.name ??
                      '—'}

                    {item.project?.city ? (
                      <div className="text-xs text-muted-foreground">
                        {item.project.city}
                      </div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      {item.tower?.name ??
                        'No tower'}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {item.phase?.name ??
                        'No phase'}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {item.configuration
                      ?.configuration_name ??
                      '—'}

                    <div className="text-xs text-muted-foreground">
                      {item.bedrooms !==
                      null
                        ? `${formatNumber(
                            item.bedrooms,
                          )} BHK`
                        : 'BHK not specified'}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {item.floor_number ??
                      '—'}
                  </td>

                  <td className="px-4 py-3">
                    {item.super_builtup_area_sqft
                      ? `${formatNumber(
                          item.super_builtup_area_sqft,
                        )} sq.ft`
                      : item.builtup_area_sqft
                        ? `${formatNumber(
                            item.builtup_area_sqft,
                          )} sq.ft`
                        : item.carpet_area_sqft
                          ? `${formatNumber(
                              item.carpet_area_sqft,
                            )} sq.ft carpet`
                          : '—'}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(
                      item.asking_price,
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {item.listing ? (
                      <div>
                        <div className="font-medium">
                          {formatListingType(
                            item.listing
                              .listing_type,
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {item.listing.status}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Unlisted
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <InventoryStatusBadge
                      status={item.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}