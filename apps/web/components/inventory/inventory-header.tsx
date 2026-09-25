import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export function InventoryHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Manage projects, units, availability, pricing, and listings.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/dashboard/inventory/new" className={buttonVariants()}>
          Add property
        </Link>
        <Link href="/dashboard/imports/properties" className={buttonVariants({ variant: 'secondary' })}>
          Import
        </Link>
        <Link href="/dashboard/inventory/projects" className={buttonVariants({ variant: 'outline' })}>
          Projects
        </Link>
      </div>
    </div>
  )
}
