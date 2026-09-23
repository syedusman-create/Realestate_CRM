import { createClient } from '@/lib/supabase/server'
import { InventoryHeader } from '@/components/inventory/inventory-header'
import { InventoryMetrics } from '@/components/inventory/inventory-metrics'
import { InventoryFilters } from '@/components/inventory/inventory-filters'
import { InventoryList } from '@/components/inventory/inventory-list'
import {
  calculateInventoryMetrics,
  type InventoryItem,
  type ListingType,
  type PropertyType,
  type UnitStatus,
} from '@/lib/crm/inventory/types'

type SearchParams = {
  q?: string
  project?: string
  developer?: string
  status?: string
  propertyType?: string
  listingType?: string
}

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function InventoryPage({
  searchParams,
}: Props) {
  const params = await searchParams
  const supabase = await createClient()

  const [
    projectsResult,
    developersResult,
    unitsResult,
    configurationsResult,
    listingsResult,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .order('name')
      .limit(500),

    supabase
      .from('developers')
      .select('*')
      .order('name')
      .limit(500),

    supabase
      .from('units')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000),

    supabase
      .from('project_configurations')
      .select('*')
      .order('configuration_name')
      .limit(1000),

    supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000),
  ])

  const firstError =
    projectsResult.error ??
    developersResult.error ??
    unitsResult.error ??
    configurationsResult.error ??
    listingsResult.error

  if (firstError) {
    throw new Error(firstError.message)
  }

  const projects = projectsResult.data ?? []
  const developers = developersResult.data ?? []
  const units = unitsResult.data ?? []
  const configurations = configurationsResult.data ?? []
  const listings = listingsResult.data ?? []

  const projectMap = new Map(
    projects.map((project) => [project.id, project]),
  )

  const developerMap = new Map(
    developers.map((developer) => [developer.id, developer]),
  )

  const configurationMap = new Map(
    configurations.map((configuration) => [
      configuration.id,
      configuration,
    ]),
  )

  const listingMap = new Map(
    listings.map((listing) => [listing.unit_id, listing]),
  )

  const metrics = calculateInventoryMetrics(units)

  const query = (params.q ?? '').trim().toLowerCase()
  const projectId = params.project ?? ''
  const developerId = params.developer ?? ''
  const status = params.status ?? ''
  const propertyType = params.propertyType ?? ''
  const listingType = params.listingType ?? ''

  const items: InventoryItem[] = units
    .map((unit) => {
      const project = projectMap.get(unit.project_id) ?? null
      const configuration = unit.configuration_id
        ? configurationMap.get(unit.configuration_id) ?? null
        : null
      const developer = project?.developer_id
        ? developerMap.get(project.developer_id) ?? null
        : null
      const listing = listingMap.get(unit.id) ?? null

      return {
        ...unit,
        project,
        configuration,
        developer,
        listing,
      }
    })
    .filter((item) => {
      if (
        query &&
        ![
          item.unit_number,
          item.project?.name,
          item.developer?.name,
          item.configuration?.configuration_name,
          item.project?.city,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query),
          )
      ) {
        return false
      }

      if (projectId && item.project_id !== projectId) {
        return false
      }

      if (
        developerId &&
        item.project?.developer_id !== developerId
      ) {
        return false
      }

      if (status && item.status !== (status as UnitStatus)) {
        return false
      }

      if (
        propertyType &&
        item.project?.property_type !==
          (propertyType as PropertyType)
      ) {
        return false
      }

      if (
        listingType &&
        item.listing?.listing_type !==
          (listingType as ListingType)
      ) {
        return false
      }

      return true
    })

  return (
    <div className="space-y-6">
      <InventoryHeader />

      <InventoryMetrics metrics={metrics} />

      <InventoryFilters
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
        }))}
        developers={developers.map((developer) => ({
          id: developer.id,
          name: developer.name,
        }))}
      />

      <InventoryList items={items} />
    </div>
  )
}