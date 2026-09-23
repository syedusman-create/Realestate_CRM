'use client'

import { useState } from 'react'

import { parseCsv } from '@/lib/crm/imports/csv'
import type {
  ImportPreview,
} from '@/lib/crm/imports/types'

type ImportUploaderProps = {
  onParsed: (
    fileName: string,
    preview: ImportPreview,
  ) => void
}

export function ImportUploader({
  onParsed,
}: ImportUploaderProps) {
  const [error, setError] =
    useState<string | null>(null)

  async function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    setError(null)

    if (
      !file.name
        .toLowerCase()
        .endsWith('.csv')
    ) {
      setError(
        'Please select a CSV file.',
      )
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        'CSV files are limited to 10 MB.',
      )
      return
    }

    try {
      const content =
        await file.text()

      const preview =
        parseCsv(content)

      onParsed(
        file.name,
        preview,
      )
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Unable to parse CSV file.',
      )
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center hover:bg-muted/40">
        <span className="text-sm font-medium">
          Choose CSV file
        </span>

        <span className="mt-1 text-xs text-muted-foreground">
          Maximum 10 MB
        </span>

        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={handleChange}
        />
      </label>

      {error ? (
        <p className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}