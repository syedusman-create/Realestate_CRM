'use client'

import type { ImportColumnMapping } from '@/lib/crm/imports/types'

type ImportMappingProps = {
  headers: string[]
  fields: readonly string[]
  mapping: ImportColumnMapping
  onChange: (mapping: ImportColumnMapping) => void
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
}

function buildAutomaticMapping(
  headers: string[],
  fields: readonly string[],
): ImportColumnMapping {
  const normalizedHeaders = new Map<string, string>()

  for (const header of headers) {
    const normalized = normalizeHeader(header)

    if (normalized && !normalizedHeaders.has(normalized)) {
      normalizedHeaders.set(normalized, header)
    }
  }

  const nextMapping: ImportColumnMapping = {}

  for (const field of fields) {
    const normalizedField = normalizeHeader(field)
    const matchingHeader = normalizedHeaders.get(normalizedField)

    if (matchingHeader) {
      nextMapping[field] = matchingHeader
    }
  }

  return nextMapping
}

function mappingsEqual(
  first: ImportColumnMapping,
  second: ImportColumnMapping,
): boolean {
  const firstKeys = Object.keys(first)
  const secondKeys = Object.keys(second)

  if (firstKeys.length !== secondKeys.length) {
    return false
  }

  return firstKeys.every((key) => first[key] === second[key])
}

export function ImportMapping({
  headers,
  fields,
  mapping,
  onChange,
}: ImportMappingProps) {
  function handleAutomaticMapping() {
    onChange(buildAutomaticMapping(headers, fields))
  }

  function setField(field: string, column: string) {
    onChange({
      ...mapping,
      ...(column
        ? { [field]: column }
        : (() => {
            const next = { ...mapping }
            delete next[field]
            return next
          })()),
    })
  }

  const automaticMapping = buildAutomaticMapping(headers, fields)
  const hasAutomaticMatches = Object.keys(automaticMapping).length > 0
  const isAlreadyAutomaticallyMapped = mappingsEqual(
    mapping,
    automaticMapping,
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium">Column mapping</p>
          <p className="text-xs text-muted-foreground">
            Matching CSV headers are mapped automatically. You can change any
            mapping manually below.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutomaticMapping}
          disabled={!hasAutomaticMatches || isAlreadyAutomaticallyMapped}
          className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          Auto-map columns
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div
            key={field}
            className="grid gap-2 md:grid-cols-[1fr_1fr] md:items-center"
          >
            <div>
              <p className="text-sm font-medium">{field}</p>
            </div>

            <select
              value={mapping[field] ?? ''}
              onChange={(event) => setField(field, event.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Not mapped</option>

              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}