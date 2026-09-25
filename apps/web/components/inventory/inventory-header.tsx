import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { normalizeCrmRole } from '@/lib/auth/roles'

export async function InventoryHeader() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let canManageInventory = false

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.is_active) {
      const role = normalizeCrmRole(
        profile.role,
      )

      canManageInventory =
        role === 'admin' ||
        role === 'manager'
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Inventory
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage projects, units, availability,
          pricing, and listings.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canManageInventory && (
          <>
            <Link
              href="/dashboard/inventory/new"
              className={buttonVariants()}
            >
              Add property
            </Link>

            <Link
              href="/dashboard/imports/properties"
              className={buttonVariants({
                variant: 'outline',
              })}
            >
              Import
            </Link>
          </>
        )}

        <Link
          href="/dashboard/inventory"
          className={buttonVariants({
            variant: 'outline',
          })}
        >
          Refresh
        </Link>
      </div>
    </div>
  )
}