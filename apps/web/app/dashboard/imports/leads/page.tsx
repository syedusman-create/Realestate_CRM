'use client'

import { useState } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { ImportUploader } from '@/components/imports/import-uploader'
import { ImportMapping } from '@/components/imports/import-mapping'
import { ImportPreview } from '@/components/imports/import-preview'
import { ImportValidationSummary } from '@/components/imports/import-validation-summary'
import { ImportResults } from '@/components/imports/import-results'
import { ImportErrorDownload } from '@/components/imports/import-error-download'

import {
  createImportJob,
  executeImport,
} from '@/lib/crm/imports/actions'

import {
  LEAD_IMPORT_FIELDS,
  type ImportActionState,
  type ImportColumnMapping,
  type ImportPreview as ImportPreviewType,
  type ImportValidationResult,
} from '@/lib/crm/imports/types'

import { validateImport } from '@/lib/crm/imports/validation'

const EMPTY_RESULT: ImportActionState = {
  ok: true,
  message: '',
}

export default function LeadImportPage() {
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] =
    useState<ImportPreviewType | null>(null)

  const [mapping, setMapping] =
    useState<ImportColumnMapping>({})

  const [validation, setValidation] =
    useState<ImportValidationResult | null>(null)

  const [result, setResult] =
    useState<ImportActionState>(EMPTY_RESULT)

  const [isCreating, setIsCreating] =
    useState(false)

  const [isExecuting, setIsExecuting] =
    useState(false)

  function handleParsed(
    parsedFileName: string,
    parsedPreview: ImportPreviewType,
  ) {
    setFileName(parsedFileName)
    setPreview(parsedPreview)

    /*
     * Start with an empty mapping.
     *
     * ImportMapping automatically detects matching CSV
     * headers and displays the suggested mappings.
     */
    setMapping({})

    setValidation(null)
    setResult(EMPTY_RESULT)
  }

  function handleValidate() {
    if (!preview) {
      return
    }

    const validationResult = validateImport(
      'leads',
      preview.rows,
      mapping,
    )

    setValidation(validationResult)
    setResult(EMPTY_RESULT)
  }

  async function handleImport() {
    if (!preview || !validation) {
      return
    }

    /*
     * Do not allow an import when validation errors exist.
     */
    if (validation.invalidRows > 0) {
      return
    }

    setIsCreating(true)
    setResult(EMPTY_RESULT)

    try {
      const job = await createImportJob(
        'leads',
        fileName,
        mapping,
      )

      if (!job.ok || !job.importJobId) {
        setResult(job)
        return
      }

      setIsCreating(false)
      setIsExecuting(true)

      const execution = await executeImport(
        job.importJobId,
        'leads',
        preview.rows,
        mapping,
      )

      setResult(execution)
    } finally {
      setIsCreating(false)
      setIsExecuting(false)
    }
  }

  const canValidate =
    Boolean(
      preview &&
        preview.rows.length > 0,
    )

  const canImport =
    Boolean(
      preview &&
        validation &&
        validation.invalidRows === 0 &&
        validation.validRows > 0 &&
        !isCreating &&
        !isExecuting,
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Import Leads
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Upload a CSV, map the columns, validate the
          data and import the leads into your CRM.
        </p>
      </div>

      {/* 1. Upload */}

      <Card>
        <CardHeader>
          <CardTitle>
            1. Upload CSV
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ImportUploader
            onParsed={handleParsed}
          />
        </CardContent>
      </Card>

      {preview ? (
        <>
          {/* 2. Mapping */}

          <Card>
            <CardHeader>
              <CardTitle>
                2. Map Columns
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ImportMapping
                headers={preview.headers}
                fields={LEAD_IMPORT_FIELDS}
                mapping={mapping}
                onChange={setMapping}
              />
            </CardContent>
          </Card>

          {/* 3. Preview */}

          <Card>
            <CardHeader>
              <CardTitle>
                3. Preview
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ImportPreview
                preview={preview}
              />
            </CardContent>
          </Card>

          {/* 4. Validation */}

          <Card>
            <CardHeader>
              <CardTitle>
                4. Validate
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={handleValidate}
                  disabled={!canValidate}
                >
                  Validate Import
                </Button>

                <span className="text-sm text-muted-foreground">
                  {preview.totalRows.toLocaleString()}{' '}
                  row
                  {preview.totalRows === 1
                    ? ''
                    : 's'}{' '}
                  detected
                </span>
              </div>

              {validation ? (
                <>
                  <ImportValidationSummary
                    result={validation}
                  />

                  <ImportErrorDownload
                    issues={validation.issues}
                  />
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* 5. Import */}

          {validation &&
          validation.validRows > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  5. Import
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {validation.invalidRows > 0 ? (
                  <p className="text-sm text-destructive">
                    Fix the validation errors before
                    importing.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {validation.validRows.toLocaleString()}{' '}
                    row
                    {validation.validRows === 1
                      ? ''
                      : 's'}{' '}
                    are ready to import.
                  </p>
                )}

                <Button
                  type="button"
                  onClick={handleImport}
                  disabled={!canImport}
                >
                  {isCreating
                    ? 'Creating Import...'
                    : isExecuting
                      ? 'Importing...'
                      : 'Import Leads'}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* 6. Results */}

          {result.message ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  6. Results
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ImportResults
                  importedRows={
                    result.importedRows ?? 0
                  }
                  skippedRows={
                    result.skippedRows ?? 0
                  }
                  failedRows={
                    result.failedRows ?? 0
                  }
                  message={result.message}
                  projectsCreated={
                    result.projectsCreated ?? 0
                  }
                  configurationsCreated={
                    result.configurationsCreated ?? 0
                  }
                  unitsCreated={
                    result.unitsCreated ?? 0
                  }
                />

                {result.issues &&
                result.issues.length > 0 ? (
                  <div className="mt-4">
                    <ImportErrorDownload
                      issues={result.issues}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  )
}