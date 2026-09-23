import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'

export function InventoryHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Inventory
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage projects, units, availability, pricing, and listings.
        </p>
      </div>

      
        <Link href="/dashboard/inventory" className={buttonVariants()}>
          Refresh inventory
        </Link>
      
    </div>
  )
}