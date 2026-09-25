import { createClient } from '@/lib/supabase/server'
import { InventoryCreateForm } from '@/components/inventory/inventory-create-form'

type Props = {
  searchParams: Promise<{
    project?: string
  }>
}

export default async function NewInventoryPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  const [
    projectsResult,
    phasesResult,
    towersResult,
    configurationsResult,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .order('name')
      .limit(500),

    supabase
      .from('project_phases')
      .select('*')
      .order('phase_number')
      .order('name')
      .limit(1000),

    supabase
      .from('project_towers')
      .select('*')
      .order('name')
      .limit(2000),

    supabase
      .from('project_configurations')
      .select('*')
      .order('configuration_name')
      .limit(2000),
  ])

  const firstError =
    projectsResult.error ??
    phasesResult.error ??
    towersResult.error ??
    configurationsResult.error

  if (firstError) {
    throw new Error(firstError.message)
  }

  return (
    <div className="space-y-6">
      <div>
        <a
          href="/dashboard/inventory"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to inventory
        </a>

        <h1 className="mt-3 text-2xl font-semibold">
          Add property
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Add one inventory unit to a project, with an optional market listing.
        </p>
      </div>

      <InventoryCreateForm
        projects={projectsResult.data ?? []}
        phases={phasesResult.data ?? []}
        towers={towersResult.data ?? []}
        configurations={configurationsResult.data ?? []}
        initialProjectId={params.project ?? ''}
      />
    </div>
  )
}