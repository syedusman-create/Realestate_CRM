type ImportResultsProps = {
  importedRows: number
  skippedRows: number
  failedRows: number
  message: string
  projectsCreated?: number
  configurationsCreated?: number
  unitsCreated?: number
}

export function ImportResults({
  importedRows,
  skippedRows,
  failedRows,
  message,
  projectsCreated = 0,
  configurationsCreated = 0,
  unitsCreated = 0,
}: ImportResultsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <p className="font-medium">{message}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Imported rows
          </p>
          <p className="text-2xl font-semibold">
            {importedRows}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Skipped rows
          </p>
          <p className="text-2xl font-semibold">
            {skippedRows}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Failed rows
          </p>
          <p className="text-2xl font-semibold">
            {failedRows}
          </p>
        </div>
      </div>

      {unitsCreated > 0 ||
      configurationsCreated > 0 ||
      projectsCreated > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Projects created
            </p>
            <p className="text-2xl font-semibold">
              {projectsCreated}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Configurations created
            </p>
            <p className="text-2xl font-semibold">
              {configurationsCreated}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Units created
            </p>
            <p className="text-2xl font-semibold">
              {unitsCreated}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}