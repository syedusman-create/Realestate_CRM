import type {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@realestate-crm/database'

export type InventoryProject = Tables<'projects'>
export type InventoryDeveloper = Tables<'developers'>
export type InventoryConfiguration = Tables<'project_configurations'>

export type ProjectStatus = Enums<'crm_project_status'>
export type PropertyCategory = Enums<'crm_property_category'>
export type PropertyType = Enums<'crm_property_type'>

export type ProjectInsert = TablesInsert<'projects'>
export type ProjectUpdate = TablesUpdate<'projects'>

export type ConfigurationInsert =
  TablesInsert<'project_configurations'>

export type ConfigurationUpdate =
  TablesUpdate<'project_configurations'>

export type ProjectWithDeveloper = InventoryProject & {
  developer: InventoryDeveloper | null
}

export type ProjectWithRelations = ProjectWithDeveloper & {
  configurations: InventoryConfiguration[]
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  'upcoming',
  'pre_launch',
  'launched',
  'under_construction',
  'ready_to_move',
  'completed',
  'sold_out',
  'inactive',
]

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  'primary_sale',
  'resale',
  'rental',
]

export const PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'villa',
  'plot',
  'independent_house',
  'row_house',
  'commercial',
  'office',
  'retail',
  'other',
]

export type ProjectActionState = {
  ok: boolean
  message?: string
  projectId?: string
}

export const EMPTY_PROJECT_ACTION_STATE: ProjectActionState = {
  ok: true,
  message: '',
}

export type ConfigurationActionState = {
  ok: boolean
  message: string
  configurationId?: string
}

export const EMPTY_CONFIGURATION_ACTION_STATE: ConfigurationActionState =
  {
    ok: true,
    message: '',
  }

export function formatProjectStatus(status: ProjectStatus) {
  return status
    .split('_')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

export function formatPropertyCategory(
  category: PropertyCategory,
) {
  return category
    .split('_')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

export function formatPropertyType(type: PropertyType) {
  return type
    .split('_')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ')
}

export function formatProjectCurrency(
  value: number | string | null | undefined,
) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function formatProjectNumber(
  value: number | string | null | undefined,
) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return new Intl.NumberFormat('en-IN').format(Number(value))
}

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}