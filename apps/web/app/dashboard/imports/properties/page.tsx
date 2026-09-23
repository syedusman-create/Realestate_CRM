'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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
    PROPERTY_IMPORT_FIELDS,
    type ImportActionState,
    type ImportColumnMapping,
    type ImportPreview as ImportPreviewType,
} from '@/lib/crm/imports/types'

import { validateImport } from '@/lib/crm/imports/validation'

const EMPTY_MAPPING: ImportColumnMapping = {}

const EMPTY_RESULT: ImportActionState = {
    ok: true,
    message: '',
}

export default function PropertyImportPage() {
    const [fileName, setFileName] = useState('')
    const [preview, setPreview] =
        useState<ImportPreviewType | null>(null)

    const [mapping, setMapping] =
        useState<ImportColumnMapping>(
            EMPTY_MAPPING,
        )

    const [validation, setValidation] =
        useState<ReturnType<typeof validateImport> | null>(
            null,
        )

    const [result, setResult] =
        useState<ImportActionState>(
            EMPTY_RESULT,
        )

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
        setMapping({})
        setValidation(null)
        setResult(EMPTY_RESULT)
    }

    function handleValidate() {
        if (!preview) {
            return
        }

        const validationResult =
            validateImport(
                'properties',
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

        if (validation.invalidRows > 0) {
            return
        }

        setIsCreating(true)
        setResult(EMPTY_RESULT)

        try {
            const job =
                await createImportJob(
                    'properties',
                    fileName,
                    mapping,
                )

            if (
                !job.ok ||
                !job.importJobId
            ) {
                setResult(job)
                return
            }

            setIsCreating(false)
            setIsExecuting(true)

            const execution =
                await executeImport(
                    job.importJobId,
                    'properties',
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
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Import projects, configurations,
                        and units from a CSV file.
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                        Property Import
                    </h1>
                </div>

                <Link
                    href="/dashboard/imports"
                    className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                    Back to Imports
                </Link>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>
                        1. Upload property CSV
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <ImportUploader
                        onParsed={handleParsed}
                    />
                </CardContent>
            </Card>

            {preview ? (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            2. Map columns
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <ImportMapping
                            headers={preview.headers}
                            fields={
                                PROPERTY_IMPORT_FIELDS
                            }
                            mapping={mapping}
                            onChange={setMapping}
                        />
                    </CardContent>
                </Card>
            ) : null}

            {preview ? (
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
            ) : null}

            {preview ? (
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
                                onClick={
                                    handleValidate
                                }
                                disabled={
                                    !canValidate
                                }
                            >
                                Validate Import
                            </Button>

                            <span className="text-sm text-muted-foreground">
                                {preview.totalRows.toLocaleString()}{' '}
                                row
                                {preview.totalRows === 1
                                    ? ''
                                    : 's'} detected
                            </span>
                        </div>

                        {validation ? (
                            <>
                                <ImportValidationSummary
                                    result={validation}
                                />

                                <ImportErrorDownload
                                    issues={
                                        validation.issues
                                    }
                                />
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}

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
                                Fix the validation errors
                                before importing.
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {validation.validRows.toLocaleString()}{' '}
                                row
                                {validation.validRows === 1
                                    ? ''
                                    : 's'} are ready to
                                import.
                            </p>
                        )}

                        <Button
                            type="button"
                            onClick={
                                handleImport
                            }
                            disabled={!canImport}
                        >
                            {isCreating
                                ? 'Creating Import...'
                                : isExecuting
                                    ? 'Importing...'
                                    : 'Import Properties'}
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            {result.message ? (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            6. Results
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <ImportResults
                            importedRows={result.importedRows ?? 0}
                            skippedRows={result.skippedRows ?? 0}
                            failedRows={result.failedRows ?? 0}
                            message={result.message}
                            projectsCreated={result.projectsCreated ?? 0}
                            configurationsCreated={result.configurationsCreated ?? 0}
                            unitsCreated={result.unitsCreated ?? 0}
                        />

                        {result.issues &&
                            result.issues.length > 0 ? (
                            <div className="mt-4">
                                <ImportErrorDownload
                                    issues={
                                        result.issues
                                    }
                                />
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}
        </div>
    )
}