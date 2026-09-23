import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProjectList } from '@/components/inventory/project-list'
import type {
  ProjectWithDeveloper,
} from '@/lib/crm/inventory/project-types'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const [
    projectsResult,
    developersResult,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .order('name')
      .limit(1000),

    supabase
      .from('developers')
      .select('*')
      .order('name')
      .limit(1000),
  ])

  if (projectsResult.error) {
    throw new Error(projectsResult.error.message)
  }

  if (developersResult.error) {
    throw new Error(developersResult.error.message)
  }

  const developerMap = new Map(
    (developersResult.data ?? []).map(
      (developer) => [
        developer.id,
        developer,
      ],
    ),
  )

  const projects: ProjectWithDeveloper[] =
    (projectsResult.data ?? []).map(
      (project) => ({
        ...project,
        developer: project.developer_id
          ? developerMap.get(
              project.developer_id,
            ) ?? null
          : null,
      }),
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/dashboard/inventory"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to inventory
          </Link>

          <h1 className="mt-3 text-2xl font-semibold">
            Projects
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage real-estate projects and their
            configurations.
          </p>
        </div>

        <Link
          href="/dashboard/inventory/projects/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New project
        </Link>
      </div>

      <ProjectList projects={projects} />
    </div>
  )
}