import { Badge } from '@/components/ui/badge'
import {
  formatUnitStatus,
  type UnitStatus,
} from '@/lib/crm/inventory/types'

type InventoryStatusBadgeProps = {
  status: UnitStatus
}

export function InventoryStatusBadge({
  status,
}: InventoryStatusBadgeProps) {
  return (
    <Badge variant={status === 'available' ? 'default' : 'secondary'}>
      {formatUnitStatus(status)}
    </Badge>
  )
}