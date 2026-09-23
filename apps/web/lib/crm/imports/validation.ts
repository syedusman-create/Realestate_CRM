import {
  LEAD_IMPORT_FIELDS,
  PROPERTY_IMPORT_FIELDS,
  type ImportColumnMapping,
  type ImportRow,
  type ImportType,
  type ImportValidationIssue,
  type ImportValidationResult,
} from './types'

/**
 * These values match the live Supabase CRM enums.
 *
 * Keep these values aligned with the database.
 */
const PROPERTY_CATEGORIES = [
  'primary_sale',
  'resale',
  'rental',
] as const

const PROPERTY_TYPES = [
  'apartment',
  'villa',
  'plot',
  'independent_house',
  'row_house',
  'commercial',
  'office',
  'retail',
  'other',
] as const

const PROJECT_STATUSES = [
  'upcoming',
  'pre_launch',
  'launched',
  'under_construction',
  'ready_to_move',
  'completed',
  'sold_out',
  'inactive',
] as const

const UNIT_STATUSES = [
  'available',
  'reserved',
  'sold',
  'leased',
  'under_maintenance',
  'off_market',
] as const

function value(
  row: ImportRow,
  mapping: ImportColumnMapping,
  field: string,
): string {
  const column = mapping[field]

  if (!column) {
    return ''
  }

  return row.values[column]?.trim() ?? ''
}

function validEmail(
  email: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validNumber(
  valueToCheck: string,
): boolean {
  const number = Number(valueToCheck)

  return (
    valueToCheck !== '' &&
    Number.isFinite(number)
  )
}

function numberValue(
  row: ImportRow,
  mapping: ImportColumnMapping,
  field: string,
): number | null {
  const fieldValue = value(
    row,
    mapping,
    field,
  )

  if (!fieldValue) {
    return null
  }

  const parsed = Number(fieldValue)

  return Number.isFinite(parsed)
    ? parsed
    : null
}

function validDate(
  valueToCheck: string,
): boolean {
  if (!valueToCheck) {
    return true
  }

  /**
   * Import dates are expected in ISO format:
   * YYYY-MM-DD
   */
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      valueToCheck,
    )
  ) {
    return false
  }

  const date = new Date(
    `${valueToCheck}T00:00:00Z`,
  )

  if (Number.isNaN(date.getTime())) {
    return false
  }

  return (
    date.toISOString().slice(0, 10) ===
    valueToCheck
  )
}

function oneOf(
  valueToCheck: string,
  values: readonly string[],
): boolean {
  return values.includes(valueToCheck)
}

function addEnumIssue(
  issues: ImportValidationIssue[],
  row: ImportRow,
  field: string,
  valueToCheck: string,
  allowedValues: readonly string[],
  label: string,
): void {
  if (!valueToCheck) {
    return
  }

  if (
    !oneOf(
      valueToCheck,
      allowedValues,
    )
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field,
      severity: 'error',
      message: `${label} must be one of: ${allowedValues.join(', ')}.`,
    })
  }
}

function validateLeadRow(
  row: ImportRow,
  mapping: ImportColumnMapping,
): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = []

  const displayName = value(
    row,
    mapping,
    'display_name',
  )

  const firstName = value(
    row,
    mapping,
    'first_name',
  )

  const lastName = value(
    row,
    mapping,
    'last_name',
  )

  const phone = value(
    row,
    mapping,
    'phone',
  )

  const email = value(
    row,
    mapping,
    'email',
  )

  if (
    !displayName &&
    !firstName &&
    !lastName
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'display_name',
      severity: 'error',
      message:
        'A name is required. Provide display_name or first/last name.',
    })
  }

  if (!phone && !email) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'phone',
      severity: 'error',
      message:
        'At least a phone number or email address is required.',
    })
  }

  if (
    email &&
    !validEmail(email)
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'email',
      severity: 'error',
      message: 'Invalid email address.',
    })
  }

  const score = value(
    row,
    mapping,
    'lead_score',
  )

  if (
    score &&
    (
      !validNumber(score) ||
      Number(score) < 0 ||
      Number(score) > 100
    )
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'lead_score',
      severity: 'error',
      message:
        'Lead score must be a number between 0 and 100.',
    })
  }

  return issues
}

function validatePropertyRow(
  row: ImportRow,
  mapping: ImportColumnMapping,
): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = []

  const projectName = value(
    row,
    mapping,
    'project_name',
  )

  if (!projectName) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'project_name',
      severity: 'error',
      message: 'Project name is required.',
    })
  }

  const propertyType = value(
    row,
    mapping,
    'property_type',
  )

  if (!propertyType) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'property_type',
      severity: 'error',
      message: 'Property type is required.',
    })
  } else {
    addEnumIssue(
      issues,
      row,
      'property_type',
      propertyType,
      PROPERTY_TYPES,
      'Property type',
    )
  }

  const propertyCategory = value(
    row,
    mapping,
    'property_category',
  )

  if (propertyCategory) {
    addEnumIssue(
      issues,
      row,
      'property_category',
      propertyCategory,
      PROPERTY_CATEGORIES,
      'Property category',
    )
  }

  const projectStatus = value(
    row,
    mapping,
    'project_status',
  )

  if (projectStatus) {
    addEnumIssue(
      issues,
      row,
      'project_status',
      projectStatus,
      PROJECT_STATUSES,
      'Project status',
    )
  }

  const unitStatus = value(
    row,
    mapping,
    'unit_status',
  )

  if (unitStatus) {
    addEnumIssue(
      issues,
      row,
      'unit_status',
      unitStatus,
      UNIT_STATUSES,
      'Unit status',
    )
  }

  const configurationName = value(
    row,
    mapping,
    'configuration_name',
  )

  const unitNumber = value(
    row,
    mapping,
    'unit_number',
  )

  if (
    !configurationName &&
    !unitNumber
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'configuration_name',
      severity: 'warning',
      message:
        'No configuration or unit information was provided.',
    })
  }

  const numericFields = [
    'price_min',
    'price_max',
    'bedrooms',
    'bathrooms',
    'carpet_area_min',
    'carpet_area_max',
    'builtup_area_min',
    'builtup_area_max',
    'super_builtup_area_min',
    'super_builtup_area_max',
    'floor_number',
    'carpet_area_sqft',
    'builtup_area_sqft',
    'super_builtup_area_sqft',
    'balcony_area_sqft',
    'parking_count',
    'asking_price',
    'price_per_sqft',
  ]

  for (const field of numericFields) {
    const fieldValue = value(
      row,
      mapping,
      field,
    )

    if (
      fieldValue &&
      (
        !validNumber(fieldValue) ||
        Number(fieldValue) < 0
      )
    ) {
      issues.push({
        rowNumber: row.rowNumber,
        field,
        severity: 'error',
        message: `${field} must be a non-negative number.`,
      })
    }
  }

  const priceMin = numberValue(
    row,
    mapping,
    'price_min',
  )

  const priceMax = numberValue(
    row,
    mapping,
    'price_max',
  )

  if (
    priceMin !== null &&
    priceMax !== null &&
    priceMin > priceMax
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'price_min',
      severity: 'error',
      message:
        'price_min cannot be greater than price_max.',
    })
  }

  const carpetAreaMin =
    numberValue(
      row,
      mapping,
      'carpet_area_min',
    )

  const carpetAreaMax =
    numberValue(
      row,
      mapping,
      'carpet_area_max',
    )

  if (
    carpetAreaMin !== null &&
    carpetAreaMax !== null &&
    carpetAreaMin > carpetAreaMax
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'carpet_area_min',
      severity: 'error',
      message:
        'carpet_area_min cannot be greater than carpet_area_max.',
    })
  }

  const builtupAreaMin =
    numberValue(
      row,
      mapping,
      'builtup_area_min',
    )

  const builtupAreaMax =
    numberValue(
      row,
      mapping,
      'builtup_area_max',
    )

  if (
    builtupAreaMin !== null &&
    builtupAreaMax !== null &&
    builtupAreaMin > builtupAreaMax
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'builtup_area_min',
      severity: 'error',
      message:
        'builtup_area_min cannot be greater than builtup_area_max.',
    })
  }

  const superBuiltupAreaMin =
    numberValue(
      row,
      mapping,
      'super_builtup_area_min',
    )

  const superBuiltupAreaMax =
    numberValue(
      row,
      mapping,
      'super_builtup_area_max',
    )

  if (
    superBuiltupAreaMin !== null &&
    superBuiltupAreaMax !== null &&
    superBuiltupAreaMin >
      superBuiltupAreaMax
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'super_builtup_area_min',
      severity: 'error',
      message:
        'super_builtup_area_min cannot be greater than super_builtup_area_max.',
    })
  }

  const launchDate = value(
    row,
    mapping,
    'launch_date',
  )

  if (
    launchDate &&
    !validDate(launchDate)
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'launch_date',
      severity: 'error',
      message:
        'launch_date must use YYYY-MM-DD format and be a valid date.',
    })
  }

  const possessionDate = value(
    row,
    mapping,
    'possession_date',
  )

  if (
    possessionDate &&
    !validDate(possessionDate)
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'possession_date',
      severity: 'error',
      message:
        'possession_date must use YYYY-MM-DD format and be a valid date.',
    })
  }

  if (
    launchDate &&
    possessionDate &&
    validDate(launchDate) &&
    validDate(possessionDate) &&
    launchDate > possessionDate
  ) {
    issues.push({
      rowNumber: row.rowNumber,
      field: 'possession_date',
      severity: 'error',
      message:
        'possession_date cannot be earlier than launch_date.',
    })
  }

  return issues
}

export function getImportFields(
  type: ImportType,
): readonly string[] {
  return type === 'leads'
    ? LEAD_IMPORT_FIELDS
    : PROPERTY_IMPORT_FIELDS
}

export function validateImport(
  type: ImportType,
  rows: ImportRow[],
  mapping: ImportColumnMapping,
): ImportValidationResult {
  const issues: ImportValidationIssue[] = []

  for (const row of rows) {
    const rowIssues =
      type === 'leads'
        ? validateLeadRow(
            row,
            mapping,
          )
        : validatePropertyRow(
            row,
            mapping,
          )

    issues.push(...rowIssues)
  }

  const invalidRowNumbers = new Set(
    issues
      .filter(
        (issue) =>
          issue.severity === 'error',
      )
      .map(
        (issue) => issue.rowNumber,
      ),
  )

  return {
    validRows:
      rows.length -
      invalidRowNumbers.size,
    invalidRows:
      invalidRowNumbers.size,
    issues,
  }
}