import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatProjectCurrency,
  formatProjectNumber,
  type InventoryConfiguration,
} from '@/lib/crm/inventory/project-types'

type Props = {
  projectId: string
  configurations: InventoryConfiguration[]
}

export function ProjectConfigurations({
  projectId,
  configurations,
}: Props) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div>
            <h2 className="font-semibold">
              Configurations
            </h2>
            <p className="text-sm text-muted-foreground">
              Unit specifications available in this project.
            </p>
          </div>

          <Link
            href={`/dashboard/inventory/projects/${projectId}/configurations/new`}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Add configuration
          </Link>
        </div>

        {configurations.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="font-medium">
              No configurations yet.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the first BHK/configuration for this
              project.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="border-b bg-muted/40">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">
                    Configuration
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Bedrooms
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Bathrooms
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Carpet area
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Super built-up
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Price
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Available
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {configurations.map(
                  (configuration) => (
                    <tr key={configuration.id}>
                      <td className="px-4 py-3 font-medium">
                        {
                          configuration.configuration_name
                        }
                      </td>

                      <td className="px-4 py-3">
                        {formatProjectNumber(
                          configuration.bedrooms,
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {formatProjectNumber(
                          configuration.bathrooms,
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {configuration.carpet_area_min !==
                          null ||
                        configuration.carpet_area_max !==
                          null
                          ? `${formatProjectNumber(
                              configuration.carpet_area_min,
                            )} – ${formatProjectNumber(
                              configuration.carpet_area_max,
                            )} sq.ft`
                          : '—'}
                      </td>

                      <td className="px-4 py-3">
                        {configuration.super_builtup_area_min !==
                          null ||
                        configuration.super_builtup_area_max !==
                          null
                          ? `${formatProjectNumber(
                              configuration.super_builtup_area_min,
                            )} – ${formatProjectNumber(
                              configuration.super_builtup_area_max,
                            )} sq.ft`
                          : '—'}
                      </td>

                      <td className="px-4 py-3">
                        {configuration.price_min !==
                            null ||
                        configuration.price_max !==
                            null
                          ? `${formatProjectCurrency(
                              configuration.price_min,
                            )} – ${formatProjectCurrency(
                              configuration.price_max,
                            )}`
                          : '—'}
                      </td>

                      <td className="px-4 py-3">
                        {
                          configuration.total_available_units
                        }
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/inventory/projects/${projectId}/configurations/${configuration.id}/edit`}
                          className="text-sm font-medium hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}