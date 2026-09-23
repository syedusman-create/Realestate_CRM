import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectDetail } from '@/components/inventory/project-detail'
import { ProjectConfigurations } from '@/components/inventory/project-configurations'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectPage({
  params,
}: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    projectResult,
    configurationsResult,
    unitsResult,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle(),

    supabase
      .from('project_configurations')
      .select('*')
      .eq('project_id', id)
      .order('configuration_name'),

    supabase
      .from('units')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('project_id', id),
  ])

  if (projectResult.error) {
    throw new Error(projectResult.error.message)
  }

  if (configurationsResult.error) {
    throw new Error(
      configurationsResult.error.message,
    )
  }

  if (unitsResult.error) {
    throw new Error(unitsResult.error.message)
  }

  if (!projectResult.data) {
    notFound()
  }

  let developer = null

  if (projectResult.data.developer_id) {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .eq(
        'id',
        projectResult.data.developer_id,
      )
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    developer = data
  }

  return (
    <div className="space-y-8">
      <ProjectDetail
        project={{
          ...projectResult.data,
          developer,
        }}
        unitCount={unitsResult.count ?? 0}
        configurationCount={
          configurationsResult.data?.length ?? 0
        }
      />

      <ProjectConfigurations
        projectId={id}
        configurations={
          configurationsResult.data ?? []
        }
      />

      <div>
        <Link
          href={`/dashboard/inventory?project=${id}`}
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          View project inventory
        </Link>
      </div>
    </div>
  )
}