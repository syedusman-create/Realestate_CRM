import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InventoryDetail } from '@/components/inventory/inventory-detail'
import { InventoryEditor } from '@/components/inventory/inventory-editor'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function InventoryDetailPage({
  params,
}: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (unitError) {
    throw new Error(unitError.message)
  }

  if (!unit) {
    notFound()
  }

  const [
    projectResult,
    configurationResult,
    listingResult,
    projectsResult,
    configurationsResult,
    developerResult,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('id', unit.project_id)
      .maybeSingle(),

    unit.configuration_id
      ? supabase
          .from('project_configurations')
          .select('*')
          .eq('id', unit.configuration_id)
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        }),

    supabase
      .from('listings')
      .select('*')
      .eq('unit_id', unit.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('projects')
      .select('*')
      .order('name')
      .limit(500),

    supabase
      .from('project_configurations')
      .select('*')
      .eq('project_id', unit.project_id)
      .order('configuration_name')
      .limit(500),

    supabase
      .from('projects')
      .select('developer_id')
      .eq('id', unit.project_id)
      .maybeSingle(),
  ])

  const firstError =
    projectResult.error ??
    configurationResult.error ??
    listingResult.error ??
    projectsResult.error ??
    configurationsResult.error ??
    developerResult.error

  if (firstError) {
    throw new Error(firstError.message)
  }

  const project = projectResult.data
  const configuration = configurationResult.data
  const listing = listingResult.data

  let developer = null

  if (developerResult.data?.developer_id) {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .eq('id', developerResult.data.developer_id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    developer = data
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/inventory"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to inventory
        </Link>

        <div className="mt-3">
          <h1 className="text-2xl font-semibold">
            Unit {unit.unit_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            {project?.name ?? 'Inventory unit'}
          </p>
        </div>
      </div>

      <InventoryDetail
        unit={unit}
        project={project}
        developer={developer}
        configuration={configuration}
        listing={listing}
      />

      <InventoryEditor
        unit={unit}
        projects={projectsResult.data ?? []}
        configurations={configurationsResult.data ?? []}
      />
    </div>
  )
}