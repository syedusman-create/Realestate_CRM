export const CRM_ROLES = [
  'admin',
  'manager',
  'agent',
  'broker',
] as const

export type CrmRole = (typeof CRM_ROLES)[number]

const ROLE_ALIASES: Record<string, CrmRole> = {
  admin: 'admin',
  administrator: 'admin',
  super_admin: 'admin',
  owner: 'admin',

  manager: 'manager',
  sales_manager: 'manager',
  team_lead: 'manager',

  agent: 'agent',
  sales: 'agent',
  sales_agent: 'agent',

  broker: 'broker',
}

export function normalizeCrmRole(
  role: string | null | undefined,
): CrmRole | null {
  if (!role) {
    return null
  }

  return ROLE_ALIASES[
    role.trim().toLowerCase()
  ] ?? null
}

export function isCrmRole(
  role: string | null | undefined,
  expected: CrmRole,
): boolean {
  return normalizeCrmRole(role) === expected
}