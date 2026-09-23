import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatProjectStatus,
  formatPropertyType,
  formatProjectCurrency,
  type ProjectWithDeveloper,
} from '@/lib/crm/inventory/project-types'

type Props = {
  projects: ProjectWithDeveloper[]
}

export function ProjectList({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">
            No projects found.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to start building
            inventory.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">
                  Project
                </th>
                <th className="px-4 py-3 font-medium">
                  Developer
                </th>
                <th className="px-4 py-3 font-medium">
                  Type
                </th>
                <th className="px-4 py-3 font-medium">
                  Location
                </th>
                <th className="px-4 py-3 font-medium">
                  Units
                </th>
                <th className="px-4 py-3 font-medium">
                  Price range
                </th>
                <th className="px-4 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/inventory/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>

                    <div className="text-xs text-muted-foreground">
                      {project.slug}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {project.developer?.name ?? '—'}
                  </td>

                  <td className="px-4 py-3">
                    {formatPropertyType(
                      project.property_type,
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {[
                      project.city,
                      project.state,
                    ]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </td>

                  <td className="px-4 py-3">
                    {project.total_units ?? '—'}
                  </td>

                  <td className="px-4 py-3">
                    {project.price_min !== null ||
                    project.price_max !== null
                      ? `${formatProjectCurrency(
                          project.price_min,
                        )} – ${formatProjectCurrency(
                          project.price_max,
                        )}`
                      : '—'}
                  </td>

                  <td className="px-4 py-3">
                    {formatProjectStatus(project.status)}
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