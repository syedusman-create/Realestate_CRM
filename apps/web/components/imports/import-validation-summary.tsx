import type {
  ImportValidationResult,
} from '@/lib/crm/imports/types'

type ImportValidationSummaryProps = {
  result: ImportValidationResult
}

export function ImportValidationSummary({
  result,
}: ImportValidationSummaryProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Valid rows
        </p>

        <p className="mt-1 text-2xl font-semibold">
          {result.validRows}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Invalid rows
        </p>

        <p className="mt-1 text-2xl font-semibold">
          {result.invalidRows}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Issues
        </p>

        <p className="mt-1 text-2xl font-semibold">
          {result.issues.length}
        </p>
      </div>
    </div>
  )
}
