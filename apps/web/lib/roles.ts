export type CrmRole = 'admin' | 'manager' | 'agent' | 'broker'

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

export function normalizeCrmRole(role: string | null | undefined): CrmRole {
  const normalized = String(role ?? '').trim().toLowerCase().replace(/\s+/g, '_')
  return ROLE_ALIASES[normalized] ?? 'agent'
}

export const CRM_ROLE_LABELS: Record<CrmRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  agent: 'Agent',
  broker: 'Broker',
}
