import type { InventoryItem } from './types'

export type InventoryMatrixCell = {
  unit: InventoryItem
  floor: number
}

export type InventoryMatrixRow = {
  floor: number
  cells: InventoryMatrixCell[]
}

export type InventoryMatrixTower = {
  towerId: string
  towerName: string
  phaseName: string | null
  rows: InventoryMatrixRow[]
}

export function buildInventoryMatrix(items: InventoryItem[]): InventoryMatrixTower[] {
  const towerGroups = new Map<string, InventoryItem[]>()

  for (const item of items) {
    const key = item.tower_id ?? '__unassigned__'
    const group = towerGroups.get(key) ?? []
    group.push(item)
    towerGroups.set(key, group)
  }

  return Array.from(towerGroups.entries())
    .map(([towerId, towerItems]) => {
      const first = towerItems[0]
      const rows = new Map<number, InventoryItem[]>()

      for (const item of towerItems) {
        const floor = item.floor_number ?? 0
        const row = rows.get(floor) ?? []
        row.push(item)
        rows.set(floor, row)
      }

      return {
        towerId,
        towerName: first?.tower?.name ?? 'Unassigned tower',
        phaseName: first?.phase?.name ?? null,
        rows: Array.from(rows.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([floor, floorItems]) => ({
            floor,
            cells: floorItems
              .sort((a, b) => a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true, sensitivity: 'base' }))
              .map((unit) => ({ floor, unit })),
          })),
      }
    })
    .sort((a, b) => a.towerName.localeCompare(b.towerName))
}
