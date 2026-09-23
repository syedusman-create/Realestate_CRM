import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConfigurationEditor } from '@/components/inventory/configuration-editor'

type Props = {
  params: Promise<{
    id: string
    configurationId: string
  }>
}

export default async function EditConfigurationPage({
  params,
}: Props) {
  const {
    id,
    configurationId,
  } = await params

  const supabase = await createClient()

  const { data: configuration, error } =
    await supabase
      .from('project_configurations')
      .select('*')
      .eq('id', configurationId)
      .eq('project_id', id)
      .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!configuration) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/inventory/projects/${id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to project
        </Link>

        <h1 className="mt-3 text-2xl font-semibold">
          Edit configuration
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {configuration.configuration_name}
        </p>
      </div>

      <ConfigurationEditor
        projectId={id}
        configuration={configuration}
      />
    </div>
  )
}