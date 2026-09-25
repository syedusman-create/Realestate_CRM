import type {
  InventoryItem,
  UnitStatus,
} from './types'

export type InventoryMatrixCell = {
  unit: InventoryItem
}

export type InventoryMatrixRow = {
  floor: number | null
  label: string
  units: InventoryMatrixCell[]
}

export type InventoryMatrixTower = {
  id: string
  name: string
  rows: InventoryMatrixRow[]
}

export function buildInventoryMatrix(
  items: InventoryItem[],
): InventoryMatrixTower[] {
  const towerMap = new Map<
    string,
    {
      id: string
      name: string
      items: InventoryItem[]
    }
  >()

  for (const item of items) {
    const towerId =
      item.tower?.id ?? 'unassigned'

    const towerName =
      item.tower?.name ?? 'Unassigned tower'

    const existing = towerMap.get(towerId)

    if (existing) {
      existing.items.push(item)
    } else {
      towerMap.set(towerId, {
        id: towerId,
        name: towerName,
        items: [item],
      })
    }
  }

  return Array.from(towerMap.values())
    .sort((a, b) =>
      a.name.localeCompare(
        b.name,
        undefined,
        {
          numeric: true,
          sensitivity: 'base',
        },
      ),
    )
    .map((tower) => {
      const floorMap = new Map<
        string,
        {
          floor: number | null
          units: InventoryItem[]
        }
      >()

      for (const item of tower.items) {
        const key =
          item.floor_number === null
            ? 'unassigned'
            : String(item.floor_number)

        const existing = floorMap.get(key)

        if (existing) {
          existing.units.push(item)
        } else {
          floorMap.set(key, {
            floor: item.floor_number,
            units: [item],
          })
        }
      }

      const rows = Array.from(
        floorMap.values(),
      )
        .sort((a, b) => {
          if (a.floor === null) return 1
          if (b.floor === null) return -1

          return b.floor - a.floor
        })
        .map((row) => ({
          floor: row.floor,

          label:
            row.floor === null
              ? 'Unassigned'
              : `Floor ${row.floor}`,

          units: row.units
            .sort((a, b) =>
              a.unit_number.localeCompare(
                b.unit_number,
                undefined,
                {
                  numeric: true,
                  sensitivity: 'base',
                },
              ),
            )
            .map((unit) => ({
              unit,
            })),
        }))

      return {
        id: tower.id,
        name: tower.name,
        rows,
      }
    })
}

export function getMatrixStatusClass(
  status: UnitStatus,
) {
  switch (status) {
    case 'available':
      return 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'

    case 'reserved':
      return 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'

    case 'sold':
      return 'border-red-300 bg-red-50 text-red-900 hover:bg-red-100'

    case 'leased':
      return 'border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100'

    case 'under_maintenance':
      return 'border-orange-300 bg-orange-50 text-orange-900 hover:bg-orange-100'

    case 'off_market':
      return 'border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100'

    default:
      return 'border-border bg-card hover:bg-muted'
  }
}