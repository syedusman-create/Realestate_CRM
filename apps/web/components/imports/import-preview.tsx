import type {
  ImportPreview as ImportPreviewType,
} from '@/lib/crm/imports/types'

type ImportPreviewProps = {
  preview: ImportPreviewType
}

export function ImportPreview({
  preview,
}: ImportPreviewProps) {
  const rows =
    preview.rows.slice(0, 10)

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-3 py-2 text-left">
              #
            </th>

            {preview.headers.map(
              (header) => (
                <th
                  key={header}
                  className="px-3 py-2 text-left"
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.rowNumber}
              className="border-b last:border-0"
            >
              <td className="px-3 py-2">
                {row.rowNumber}
              </td>

              {preview.headers.map(
                (header) => (
                  <td
                    key={header}
                    className="max-w-60 truncate px-3 py-2"
                  >
                    {row.values[header]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}