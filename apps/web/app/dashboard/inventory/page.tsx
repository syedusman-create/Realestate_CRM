import { createClient } from '@/lib/supabase/server'
import { InventoryHeader } from '@/components/inventory/inventory-header'
import { InventoryMetrics } from '@/components/inventory/inventory-metrics'
import { InventoryFilters } from '@/components/inventory/inventory-filters'
import { InventoryList } from '@/components/inventory/inventory-list'
import { InventoryMatrix } from '@/components/inventory/inventory-matrix'
import { InventoryViewSwitcher } from '@/components/inventory/inventory-view-switcher'
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
  phase?: string
  tower?: string
  configuration?: string
  status?: string
  propertyType?: string
  listingType?: string
  bedrooms?: string
  view?: string
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
    phasesResult,
    towersResult,
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
      .from('project_phases')
      .select('*')
      .order('name')
      .limit(500),

    supabase
      .from('project_towers')
      .select('*')
      .order('name')
      .limit(500),

    supabase
      .from('units')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(1000),

    supabase
      .from('project_configurations')
      .select('*')
      .order('configuration_name')
      .limit(1000),

    supabase
      .from('listings')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(1000),
  ])

  const firstError =
    projectsResult.error ??
    developersResult.error ??
    phasesResult.error ??
    towersResult.error ??
    unitsResult.error ??
    configurationsResult.error ??
    listingsResult.error

  if (firstError) {
    throw new Error(firstError.message)
  }

  const projects = projectsResult.data ?? []
  const developers = developersResult.data ?? []
  const phases = phasesResult.data ?? []
  const towers = towersResult.data ?? []
  const units = unitsResult.data ?? []
  const configurations =
    configurationsResult.data ?? []
  const listings = listingsResult.data ?? []

  const projectMap = new Map(
    projects.map((project) => [
      project.id,
      project,
    ]),
  )

  const developerMap = new Map(
    developers.map((developer) => [
      developer.id,
      developer,
    ]),
  )

  const phaseMap = new Map(
    phases.map((phase) => [
      phase.id,
      phase,
    ]),
  )

  const towerMap = new Map(
    towers.map((tower) => [
      tower.id,
      tower,
    ]),
  )

  const configurationMap = new Map(
    configurations.map((configuration) => [
      configuration.id,
      configuration,
    ]),
  )

  const listingMap = new Map(
    listings.map((listing) => [
      listing.unit_id,
      listing,
    ]),
  )

  const metrics =
    calculateInventoryMetrics(units)

  const query = (params.q ?? '')
    .trim()
    .toLowerCase()

  const projectId = params.project ?? ''
  const developerId = params.developer ?? ''
  const phaseId = params.phase ?? ''
  const towerId = params.tower ?? ''
  const configurationId =
    params.configuration ?? ''
  const status = params.status ?? ''
  const propertyType =
    params.propertyType ?? ''
  const listingType =
    params.listingType ?? ''
  const bedrooms = params.bedrooms ?? ''

  const items: InventoryItem[] = units
    .map((unit) => {
      const project =
        projectMap.get(unit.project_id) ?? null

      const phase = unit.phase_id
        ? phaseMap.get(unit.phase_id) ?? null
        : null

      const tower = unit.tower_id
        ? towerMap.get(unit.tower_id) ?? null
        : null

      const configuration =
        unit.configuration_id
          ? configurationMap.get(
              unit.configuration_id,
            ) ?? null
          : null

      const developer =
        project?.developer_id
          ? developerMap.get(
              project.developer_id,
            ) ?? null
          : null

      const listing =
        listingMap.get(unit.id) ?? null

      return {
        ...unit,
        project,
        phase,
        tower,
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
          item.phase?.name,
          item.tower?.name,
          item.configuration
            ?.configuration_name,
          item.project?.city,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query),
          )
      ) {
        return false
      }

      if (
        projectId &&
        item.project_id !== projectId
      ) {
        return false
      }

      if (
        developerId &&
        item.project?.developer_id !==
          developerId
      ) {
        return false
      }

      if (
        phaseId &&
        item.phase_id !== phaseId
      ) {
        return false
      }

      if (
        towerId &&
        item.tower_id !== towerId
      ) {
        return false
      }

      if (
        configurationId &&
        item.configuration_id !==
          configurationId
      ) {
        return false
      }

      if (
        status &&
        item.status !==
          (status as UnitStatus)
      ) {
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

      if (
        bedrooms &&
        String(item.bedrooms ?? '') !==
          bedrooms
      ) {
        return false
      }

      return true
    })

  const currentView =
    params.view === 'matrix'
      ? 'matrix'
      : 'table'

  return (
    <div className="space-y-6">
      <InventoryHeader />

      <InventoryMetrics
        metrics={metrics}
      />

      <InventoryFilters
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
        }))}
        developers={developers.map(
          (developer) => ({
            id: developer.id,
            name: developer.name,
          }),
        )}
        phases={phases.map((phase) => ({
          id: phase.id,
          name: phase.name,
          project_id: phase.project_id,
        }))}
        towers={towers.map((tower) => ({
          id: tower.id,
          name: tower.name,
          project_id: tower.project_id,
          phase_id: tower.phase_id,
        }))}
        configurations={configurations.map(
          (configuration) => ({
            id: configuration.id,
            name:
              configuration.configuration_name,
            project_id:
              configuration.project_id,
          }),
        )}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">
              {items.length}
            </span>{' '}
            of {units.length} units
          </p>
        </div>

        <InventoryViewSwitcher
          currentView={currentView}
        />
      </div>

      {currentView === 'matrix' ? (
        <InventoryMatrix items={items} />
      ) : (
        <InventoryList items={items} />
      )}
    </div>
  )
}