import type {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@realestate-crm/database'

export type Unit = Tables<'units'>
export type Project = Tables<'projects'>
export type Developer = Tables<'developers'>
export type ProjectConfiguration =
  Tables<'project_configurations'>
export type ProjectPhase = Tables<'project_phases'>
export type ProjectTower = Tables<'project_towers'>
export type Listing = Tables<'listings'>
export type PropertyMedia = Tables<'property_media'>

export type UnitStatus = Enums<'crm_unit_status'>
export type PropertyType = Enums<'crm_property_type'>
export type PropertyCategory =
  Enums<'crm_property_category'>
export type ListingType = Enums<'crm_listing_type'>
export type ListingStatus =
  Enums<'crm_listing_status'>
export type Furnishing = Enums<'crm_furnishing'>

export type UnitInsert = TablesInsert<'units'>
export type UnitUpdate = TablesUpdate<'units'>
export type ListingInsert = TablesInsert<'listings'>
export type ListingUpdate = TablesUpdate<'listings'>

export type InventoryItem = Unit & {
  project: Project | null
  phase: ProjectPhase | null
  tower: ProjectTower | null
  configuration: ProjectConfiguration | null
  developer: Developer | null
  listing: Listing | null
}

export type InventoryFilters = {
  q: string
  projectId: string
  developerId: string
  phaseId: string
  towerId: string
  configurationId: string
  status: 'all' | UnitStatus
  propertyType: 'all' | PropertyType
  listingType: 'all' | ListingType
  bedrooms: string
}

export type InventoryMetrics = {
  total: number
  available: number
  reserved: number
  sold: number
  leased: number
  maintenance: number
  offMarket: number
}

export type InventoryActionState = {
  ok: boolean
  message: string
  unitId?: string
}

export const EMPTY_INVENTORY_ACTION_STATE: InventoryActionState = {
  ok: true,
  message: '',
}

export const UNIT_STATUSES: UnitStatus[] = [
  'available',
  'reserved',
  'sold',
  'leased',
  'under_maintenance',
  'off_market',
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

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  'primary_sale',
  'resale',
  'rental',
]

export const LISTING_TYPES: ListingType[] = [
  'primary_sale',
  'resale',
  'rent',
  'lease',
]

export const LISTING_STATUSES: ListingStatus[] = [
  'draft',
  'active',
  'reserved',
  'under_offer',
  'closed',
  'expired',
  'withdrawn',
]

export const FURNISHING_OPTIONS: Furnishing[] = [
  'unfurnished',
  'semi_furnished',
  'fully_furnished',
]

export function formatUnitStatus(
  status: UnitStatus,
) {
  return status
    .split('_')
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(' ')
}

export function formatListingType(
  value: ListingType,
) {
  return value
    .split('_')
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(' ')
}

export function formatPropertyType(
  value: PropertyType,
) {
  return value
    .split('_')
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(' ')
}

export function formatCurrency(
  value: number | string | null | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—'
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function formatNumber(
  value: number | string | null | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—'
  }

  return new Intl.NumberFormat('en-IN').format(
    Number(value),
  )
}

export function calculateInventoryMetrics(
  units: Pick<Unit, 'status'>[],
): InventoryMetrics {
  return {
    total: units.length,

    available: units.filter(
      (unit) => unit.status === 'available',
    ).length,

    reserved: units.filter(
      (unit) => unit.status === 'reserved',
    ).length,

    sold: units.filter(
      (unit) => unit.status === 'sold',
    ).length,

    leased: units.filter(
      (unit) => unit.status === 'leased',
    ).length,

    maintenance: units.filter(
      (unit) =>
        unit.status === 'under_maintenance',
    ).length,

    offMarket: units.filter(
      (unit) => unit.status === 'off_market',
    ).length,
  }
}