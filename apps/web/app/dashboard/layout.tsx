import { redirect } from 'next/navigation'

import AppShell from '@/components/layout/app-shell'
import Content from '@/components/layout/content'
import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'

import BackButton from '@/components/navigation/back-button'
import MobileNav from '@/components/navigation/mobile-nav'
import Nav from '@/components/navigation/nav'
import UserMenu from '@/components/navigation/user-menu'

import { getNavigationForRole } from '@/lib/auth/navigation'
import { normalizeCrmRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
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
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle()

  const role = normalizeCrmRole(
    profile?.role,
  )

  if (!role) {
    redirect('/unauthorized')
  }

  const fullName =
    profile?.full_name ??
    user.email ??
    'User'

  const navigation =
    getNavigationForRole(role)

  return (
    <AppShell
      sidebar={
        <Sidebar>
          <Nav groups={navigation} />

          <UserMenu
            fullName={fullName}
            role={role}
          />
        </Sidebar>
      }
      header={
        <Header>
          <div className="flex w-full items-center gap-3">
            <MobileNav groups={navigation} />

            <BackButton />

            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Global Enterprises
              </p>

              <h1 className="truncate text-base font-semibold tracking-tight">
                Workspace
              </h1>
            </div>
          </div>
        </Header>
      }
      content={
        <Content>
          {children}
        </Content>
      }
      footer={
        <Footer>
          <span>
            Global Enterprises
          </span>

          <span>
            Real Estate Platform
          </span>
        </Footer>
      }
    />
  )
}