import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectEditor } from '@/components/inventory/project-editor'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProjectPage({
  params,
}: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    projectResult,
    developersResult,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle(),

    supabase
      .from('developers')
      .select('*')
      .order('name'),
  ])

  if (projectResult.error) {
    throw new Error(projectResult.error.message)
  }

  if (developersResult.error) {
    throw new Error(developersResult.error.message)
  }

  if (!projectResult.data) {
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
          Edit project
        </h1>
      </div>

      <ProjectEditor
        project={projectResult.data}
        developers={developersResult.data ?? []}
      />
    </div>
  )
}