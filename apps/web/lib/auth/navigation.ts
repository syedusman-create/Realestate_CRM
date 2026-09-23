import type { CrmPermission } from '@/lib/auth/permissions'
import { getPermissions } from '@/lib/auth/permissions'
import type { CrmRole } from '@/lib/auth/roles'

export type NavigationIcon =
  | 'dashboard'
  | 'leads'
  | 'deals'
  | 'tasks'
  | 'dialer'
  | 'inventory'
  | 'recommendations'
  | 'reports'
  | 'imports'
  | 'team'

export type NavigationItem = {
  label: string
  href: string
  icon: NavigationIcon
  permission: CrmPermission
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}

const NAVIGATION: NavigationGroup[] = [
  {
    label: 'Workspace',
    items: [
      {
        label: 'Overview',
        href: '/dashboard',
        icon: 'dashboard',
        permission: 'dashboard.view',
      },
      {
        label: 'Leads',
        href: '/dashboard/leads',
        icon: 'leads',
        permission: 'leads.view',
      },
      {
        label: 'Opportunities',
        href: '/dashboard/deals',
        icon: 'deals',
        permission: 'deals.view',
      },
      {
        label: 'Tasks',
        href: '/dashboard/tasks',
        icon: 'tasks',
        permission: 'tasks.view',
      },
    ],
  },
  {
    label: 'Sales',
    items: [
      {
        label: 'Dialer',
        href: '/dashboard/dialer',
        icon: 'dialer',
        permission: 'dialer.view',
      },
      {
        label: 'Inventory',
        href: '/dashboard/inventory',
        icon: 'inventory',
        permission: 'inventory.view',
      },
      {
        label: 'Property Matching',
        href: '/dashboard/recommendations',
        icon: 'recommendations',
        permission: 'recommendations.view',
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Reports',
        href: '/dashboard/reports',
        icon: 'reports',
        permission: 'reports.view',
      },
      {
        label: 'Import Center',
        href: '/dashboard/imports',
        icon: 'imports',
        permission: 'imports.leads',
      },
      {
        label: 'Team',
        href: '/dashboard/team',
        icon: 'team',
        permission: 'team.view',
      },
    ],
  },
]

export function getNavigationForRole(
  role: CrmRole,
): NavigationGroup[] {
  const permissions = new Set(
    getPermissions(role),
  )

  return NAVIGATION
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        permissions.has(item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0)
}