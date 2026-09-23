import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConfigurationEditor } from '@/components/inventory/configuration-editor'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function NewConfigurationPage({
  params,
}: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!project) {
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
          Add configuration
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {project.name}
        </p>
      </div>

      <ConfigurationEditor
        projectId={id}
      />
    </div>
  )
}