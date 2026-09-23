import { redirect } from 'next/navigation'

import { normalizeCrmRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

export default async function DialerAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } =
    await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .maybeSingle()

  if (!profile?.is_active) {
    redirect('/unauthorized')
  }

  const role = normalizeCrmRole(
    profile.role,
  )

  if (role !== 'admin') {
    redirect('/unauthorized')
  }

  return children
}