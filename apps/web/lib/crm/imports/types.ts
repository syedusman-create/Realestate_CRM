import type {
  Enums,
  Tables,
} from '@realestate-crm/database'

export type ImportType =
  | 'leads'
  | 'properties'

export type ImportJobStatus =
  | 'uploaded'
  | 'validating'
  | 'ready'
  | 'processing'
  | 'completed'
  | 'completed_with_errors'
  | 'failed'

export type ImportJob = Tables<'crm_import_jobs'>

export type ImportColumnMapping = Record<string, string>

export type ImportRow = {
  rowNumber: number
  values: Record<string, string>
}

export type ImportValidationSeverity =
  | 'error'
  | 'warning'

export type ImportValidationIssue = {
  rowNumber: number
  field?: string
  severity: ImportValidationSeverity
  message: string
}

export type ImportPreview = {
  headers: string[]
  rows: ImportRow[]
  totalRows: number
}

export type ImportValidationResult = {
  validRows: number
  invalidRows: number
  issues: ImportValidationIssue[]
}

export type ImportExecutionResult = {
  importedRows: number
  skippedRows: number
  failedRows: number
  issues: ImportValidationIssue[]

  projectsCreated?: number
  configurationsCreated?: number
  unitsCreated?: number
}

export type ImportActionState = {
  ok: boolean
  message: string
  importJobId?: string

  importedRows?: number
  skippedRows?: number
  failedRows?: number
  issues?: ImportValidationIssue[]

  projectsCreated?: number
  configurationsCreated?: number
  unitsCreated?: number
}

export const EMPTY_IMPORT_ACTION_STATE: ImportActionState = {
  ok: true,
  message: '',
}

export type LeadPriority = Enums<'crm_lead_priority'>
export type LeadTemperature = Enums<'crm_lead_temperature'>

export const LEAD_IMPORT_FIELDS = [
  'first_name',
  'last_name',
  'display_name',
  'phone',
  'email',
  'occupation',
  'company_name',
  'preferred_language',
  'notes',
  'priority',
  'temperature',
  'lead_score',
] as const

export type LeadImportField =
  (typeof LEAD_IMPORT_FIELDS)[number]

export const PROPERTY_IMPORT_FIELDS = [
  'project_name',
  'project_slug',
  'property_category',
  'property_type',
  'developer_name',
  'city',
  'state',
  'postal_code',
  'address_line_1',
  'address_line_2',
  'project_status',
  'launch_date',
  'possession_date',
  'rera_number',
  'description',
  'highlights',
  'price_min',
  'price_max',
  'configuration_name',
  'bedrooms',
  'bathrooms',
  'carpet_area_min',
  'carpet_area_max',
  'builtup_area_min',
  'builtup_area_max',
  'super_builtup_area_min',
  'super_builtup_area_max',
  'unit_number',
  'floor_number',
  'carpet_area_sqft',
  'builtup_area_sqft',
  'super_builtup_area_sqft',
  'balcony_area_sqft',
  'facing',
  'parking_count',
  'asking_price',
  'price_per_sqft',
  'unit_status',
] as const

export type PropertyImportField =
  (typeof PROPERTY_IMPORT_FIELDS)[number]