import type { CrmRole } from './roles'

export const CRM_PERMISSIONS = [
  'dashboard.view',

  'leads.view',
  'leads.view_all',
  'leads.create',
  'leads.edit',
  'leads.assign',

  'deals.view',
  'deals.view_all',
  'deals.create',
  'deals.edit',

  'tasks.view',
  'tasks.view_all',
  'tasks.manage',

  'dialer.view',
  'dialer.manage',

  'inventory.view',
  'inventory.manage',

  'imports.leads',
  'imports.properties',

  'recommendations.view',

  'reports.view',
  'reports.view_all',

  'team.view',
  'team.manage',

  'settings.manage',
] as const

export type CrmPermission =
  (typeof CRM_PERMISSIONS)[number]

const ROLE_PERMISSIONS: Record<
  CrmRole,
  readonly CrmPermission[]
> = {
  admin: CRM_PERMISSIONS,

  manager: [
    'dashboard.view',

    'leads.view',
    'leads.view_all',
    'leads.create',
    'leads.edit',
    'leads.assign',

    'deals.view',
    'deals.view_all',
    'deals.create',
    'deals.edit',

    'tasks.view',
    'tasks.view_all',
    'tasks.manage',

    'dialer.view',

    'inventory.view',
    'inventory.manage',

    'imports.leads',
    'imports.properties',

    'recommendations.view',

    'reports.view',
    'reports.view_all',

    'team.view',
    'team.manage',
  ],

  agent: [
    'dashboard.view',

    'leads.view',
    'leads.create',
    'leads.edit',

    'deals.view',
    'deals.create',
    'deals.edit',

    'tasks.view',

    'dialer.view',

    'inventory.view',

    'recommendations.view',
  ],

  broker: [
    'dashboard.view',

    'leads.view',
    'leads.create',
    'leads.edit',

    'deals.view',
    'deals.create',
    'deals.edit',

    'tasks.view',

    'inventory.view',

    'recommendations.view',
  ],
}
export function hasPermission(
  role: CrmRole | null,
  permission: CrmPermission,
): boolean {
  if (!role) {
    return false
  }

  return ROLE_PERMISSIONS[role].includes(permission)
}

export function getPermissions(
  role: CrmRole | null,
): readonly CrmPermission[] {
  if (!role) {
    return []
  }

  return ROLE_PERMISSIONS[role]
}