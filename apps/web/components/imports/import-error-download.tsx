'use client'

type ImportError = {
  rowNumber: number
  field?: string
  severity: string
  message: string
}

export function ImportErrorDownload({
  issues,
}: {
  issues: ImportError[]
}) {
  if (issues.length === 0) {
    return null
  }

  function download() {
    const header =
      'row,field,severity,message'

    const rows = issues.map(
      (issue) =>
        [
          issue.rowNumber,
          issue.field ?? '',
          issue.severity,
          `"${issue.message.replaceAll(
            '"',
            '""',
          )}"`,
        ].join(','),
    )

    const blob = new Blob(
      [
        [
          header,
          ...rows,
        ].join('\n'),
      ],
      {
        type: 'text/csv;charset=utf-8',
      },
    )

    const url =
      URL.createObjectURL(blob)

    const anchor =
      document.createElement('a')

    anchor.href = url
    anchor.download =
      'import-errors.csv'

    anchor.click()

    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
    >
      Download Errors
    </button>
  )
}