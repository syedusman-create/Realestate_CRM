import type {
  ImportJob,
} from '@/lib/crm/imports/types'

function formatStatus(
  status: string,
): string {
  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (value) =>
      value.toUpperCase(),
    )
}

export function ImportHistory({
  jobs,
}: {
  jobs: ImportJob[]
}) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        No imports have been run yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left">
              File
            </th>

            <th className="px-4 py-3 text-left">
              Type
            </th>

            <th className="px-4 py-3 text-left">
              Status
            </th>

            <th className="px-4 py-3 text-right">
              Imported
            </th>

            <th className="px-4 py-3 text-right">
              Failed
            </th>

            <th className="px-4 py-3 text-left">
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="border-b last:border-0"
            >
              <td className="px-4 py-3">
                {job.file_name}
              </td>

              <td className="px-4 py-3">
                {job.import_type}
              </td>

              <td className="px-4 py-3">
                {formatStatus(
                  job.status,
                )}
              </td>

              <td className="px-4 py-3 text-right">
                {job.imported_rows}
              </td>

              <td className="px-4 py-3 text-right">
                {job.invalid_rows}
              </td>

              <td className="px-4 py-3">
                {new Date(
                  job.created_at,
                ).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}