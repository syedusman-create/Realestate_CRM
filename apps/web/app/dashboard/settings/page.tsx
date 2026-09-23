import { redirect } from 'next/navigation'
import {
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { normalizeCrmRole } from '@/lib/auth/roles'

import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default async function SettingsPage() {
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
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle()

  const rawFullName =
    profile?.full_name

  const fullName =
    typeof rawFullName === 'string' &&
    rawFullName.trim().length > 0
      ? rawFullName
      : user.email ?? 'User'

  const role = normalizeCrmRole(
    typeof profile?.role === 'string'
      ? profile.role
      : null,
  )

  if (!role) {
    redirect('/unauthorized')
  }

  const initials = fullName
    .split(/\s+/)
    .filter(
      (part): part is string =>
        part.length > 0,
    )
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join('')

  const displayRole = role.replaceAll(
    '_',
    ' ',
  )

  return (
    <div className="page">
      <div className="mb-8">
        <div className="eyebrow">
          Account
        </div>

        <h1 className="mt-2 flex items-center gap-3">
          <Settings className="size-7 text-brand-gold" />
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage your account information and
          workspace access.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.75fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4 text-brand-gold" />
              Account
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="bg-brand-navy text-base font-semibold text-white">
                  {initials || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="truncate text-base font-semibold">
                  {fullName}
                </div>

                <div className="mt-1 truncate text-sm text-muted-foreground">
                  {user.email ??
                    'No email available'}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <div className="eyebrow">
                  Role
                </div>

                <div className="mt-2 text-sm font-semibold capitalize">
                  {displayRole}
                </div>
              </div>

              <div>
                <div className="eyebrow">
                  Account ID
                </div>

                <div className="mt-2 truncate font-mono text-xs text-muted-foreground">
                  {user.id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-brand-gold" />
              Access
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Your workspace access is controlled
              by your assigned CRM role and
              permissions.
            </p>

            <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Current role
              </div>

              <div className="mt-2 text-sm font-semibold capitalize">
                {displayRole}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}